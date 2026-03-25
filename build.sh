#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# Pipeline OS v4.1 — Build Script  (esbuild-based)
# Usage:  ./build.sh [version]
# Output: pipeline-os-v{VERSION}-{DATE}.html on the Desktop
#
# What this does:
#   1. Checks for / installs esbuild (via npm)
#   2. Bundles src/main.js as an IIFE (minified)
#   3. Extracts core JS from shell.html (lines after <script>)
#   4. Merges: pipeline.html (CSS+HTML) + core JS + bundle → single .html
# ─────────────────────────────────────────────────────────────

set -euo pipefail

VERSION="${1:-4.1.0}"
DATE=$(date +%d%b%Y | tr '[:upper:]' '[:lower:]')
OUT_DIR="$HOME/Desktop"
OUT="$OUT_DIR/pipeline-os-v${VERSION}-${DATE}.html"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PIPELINE_HTML="$SCRIPT_DIR/pipeline.html"
SHELL_HTML="$SCRIPT_DIR/shell.html"
SRC_ENTRY="$SCRIPT_DIR/src/main.js"
TMP_BUNDLE="$SCRIPT_DIR/.bundle.tmp.js"

# ── Validate inputs ──────────────────────────────────────────
if [ ! -f "$PIPELINE_HTML" ]; then
  echo "ERROR: pipeline.html not found at $PIPELINE_HTML"
  exit 1
fi

if [ ! -f "$SHELL_HTML" ]; then
  echo "ERROR: shell.html not found at $SHELL_HTML"
  exit 1
fi

if [ ! -f "$SRC_ENTRY" ]; then
  echo "ERROR: src/main.js not found at $SRC_ENTRY"
  exit 1
fi

# ── Ensure esbuild is available ──────────────────────────────
# Search common install locations first (NVM, Homebrew, npm global, local)
ESBUILD=""
for candidate in \
  esbuild \
  "$SCRIPT_DIR/package/bin/esbuild" \
  "$SCRIPT_DIR/node_modules/.bin/esbuild" \
  /opt/homebrew/bin/esbuild \
  /usr/local/bin/esbuild \
  "$HOME/.npm-global/bin/esbuild" \
  "$HOME/.local/bin/esbuild"
do
  # Use -x for absolute paths (handles spaces); command -v for PATH entries
  if [[ "$candidate" == /* ]] && [ -x "$candidate" ]; then
    ESBUILD="$candidate"
    break
  elif command -v "$candidate" &>/dev/null 2>&1; then
    ESBUILD="$candidate"
    break
  fi
done

# Also check NVM-managed Node paths
if [ -z "$ESBUILD" ] && [ -d "$HOME/.nvm" ]; then
  NVM_ESBUILD=$(find "$HOME/.nvm/versions" -maxdepth 4 -name "esbuild" 2>/dev/null | head -1)
  [ -n "$NVM_ESBUILD" ] && ESBUILD="$NVM_ESBUILD"
fi

if [ -z "$ESBUILD" ]; then
  echo "  esbuild not found — attempting to install..."

  # Try npm (if available via common paths)
  NPM=""
  for npm_candidate in npm /opt/homebrew/bin/npm /usr/local/bin/npm; do
    if command -v "$npm_candidate" &>/dev/null 2>&1; then
      NPM="$npm_candidate"; break
    fi
  done

  if [ -n "$NPM" ]; then
    echo "  Installing esbuild via npm..."
    "$NPM" install --save-dev --prefix "$SCRIPT_DIR" esbuild 2>&1 | tail -3
    ESBUILD="$SCRIPT_DIR/node_modules/.bin/esbuild"
  else
    # Last resort: download standalone esbuild binary for macOS
    ARCH=$(uname -m)
    if [ "$ARCH" = "arm64" ]; then
      ESBUILD_URL="https://registry.npmjs.org/@esbuild/darwin-arm64/-/darwin-arm64-0.21.5.tgz"
    else
      ESBUILD_URL="https://registry.npmjs.org/@esbuild/darwin-x64/-/darwin-x64-0.21.5.tgz"
    fi
    echo "  Downloading esbuild binary ($ARCH)..."
    TMP_TGZ="$SCRIPT_DIR/.esbuild-download.tgz"
    curl -fsSL "$ESBUILD_URL" -o "$TMP_TGZ"
    # Extract into SCRIPT_DIR — tarball contains package/bin/esbuild
    tar -xzf "$TMP_TGZ" -C "$SCRIPT_DIR"
    rm -f "$TMP_TGZ"
    EXTRACTED="$SCRIPT_DIR/package/bin/esbuild"
    if [ -f "$EXTRACTED" ]; then
      chmod +x "$EXTRACTED"
      ESBUILD="$EXTRACTED"
    fi
  fi
fi

if [ -z "$ESBUILD" ] || ! "$ESBUILD" --version >/dev/null 2>&1; then
  echo ""
  echo "ERROR: Could not find or install esbuild."
  echo "  Option 1: Install Node.js from https://nodejs.org then run:"
  echo "            npm install -g esbuild"
  echo "  Option 2: Install via Homebrew:"
  echo "            brew install esbuild"
  exit 1
fi

ESBUILD_VERSION=$("$ESBUILD" --version 2>/dev/null || echo "unknown")
echo "  Using esbuild: $ESBUILD_VERSION"

# ── Bundle src/main.js with esbuild ─────────────────────────
echo "  Bundling src/main.js..."
"$ESBUILD" "$SRC_ENTRY" \
  --bundle \
  --minify \
  --format=iife \
  --outfile="$TMP_BUNDLE" \
  --log-level=warning

BUNDLE_SIZE=$(wc -c < "$TMP_BUNDLE")
echo "  Bundle size: ${BUNDLE_SIZE} bytes"

# ── Assemble final HTML via Python ───────────────────────────
python3 - <<'PYEOF' "$PIPELINE_HTML" "$SHELL_HTML" "$TMP_BUNDLE" "$OUT" "$VERSION"
import sys, re

pipeline_path, shell_path, bundle_path, out_path, version = \
  sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4], sys.argv[5]

# Read pipeline.html (CSS + HTML only, no JS)
with open(pipeline_path, 'r', encoding='utf-8') as f:
    pipeline_html = f.read()

# Extract core JS from shell.html: everything between <script> and </script>
with open(shell_path, 'r', encoding='utf-8') as f:
    shell = f.read()

script_start = shell.find('<script>')
script_end   = shell.rfind('</script>')
if script_start == -1 or script_end == -1:
    print("ERROR: Could not find <script>...</script> block in shell.html")
    sys.exit(1)

core_js = shell[script_start + len('<script>') : script_end]

# Read the esbuild bundle
with open(bundle_path, 'r', encoding='utf-8') as f:
    bundle_js = f.read()

# Find the bundle placeholder in pipeline.html and replace with inlined scripts
# The placeholder is: <!-- Bundle injected by build.sh -->\n<script src="bundle.js"></script>
placeholder_comment = '<!-- Bundle injected by build.sh -->'
placeholder_script  = '<script src="bundle.js"></script>'

# Build the replacement: core JS then bundle, in a single <script> block
replacement = (
    '<!-- Pipeline OS v' + version + ' — ' +
    'core + modules bundle (generated by build.sh) -->\n'
    '<script>\n' +
    core_js.strip() + '\n\n' +
    '// ── Module bundle ──\n' +
    bundle_js.strip() + '\n\n' +
    '// ── Wire renderModules to shell render() ──\n' +
    'if (typeof setRenderFn === "function" && typeof render === "function") {\n' +
    '  setRenderFn(render);\n' +
    '}\n' +
    '</script>'
)

# Replace placeholder
if placeholder_comment in pipeline_html:
    output = pipeline_html.replace(
        placeholder_comment + '\n' + placeholder_script,
        replacement
    )
elif placeholder_script in pipeline_html:
    output = pipeline_html.replace(placeholder_script, replacement)
else:
    print("ERROR: Could not find bundle placeholder in pipeline.html")
    sys.exit(1)

# Update title version
output = output.replace(
    '<title>Pipeline OS v4.0.0</title>',
    f'<title>Pipeline OS v{version}</title>'
)
output = output.replace(
    '<title>Pipeline OS v4.1.0</title>',
    f'<title>Pipeline OS v{version}</title>'
)

with open(out_path, 'w', encoding='utf-8') as f:
    f.write(output)

total_kb = len(output) // 1024
core_kb  = len(core_js) // 1024
bundle_kb = len(bundle_js) // 1024
print(f"  Core JS:  {core_kb} KB")
print(f"  Bundle:   {bundle_kb} KB")
print(f"  Total:    {total_kb} KB")
PYEOF

# ── Cleanup temp bundle ──────────────────────────────────────
rm -f "$TMP_BUNDLE"

echo "Done → $OUT"
