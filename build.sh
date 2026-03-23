#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# Pipeline OS — Build Script
# Usage:  ./build.sh [version] [--obfuscate]
# Output: pipeline-os-v{VERSION}-{DATE}.html on the Desktop
#
# Obfuscation: requires terser → npm install -g terser
# ─────────────────────────────────────────────────────────────

set -euo pipefail

VERSION="${1:-3.1.0}"
OBFUSCATE=false
for arg in "$@"; do [[ "$arg" == "--obfuscate" ]] && OBFUSCATE=true; done

DATE=$(date +%d%b%Y | tr '[:upper:]' '[:lower:]')
OUT_DIR="$HOME/Desktop"
OUT="$OUT_DIR/pipeline-os-v${VERSION}-${DATE}.html"

SHELL_FILE="$(dirname "$0")/shell.html"
MODULES_DIR="$(dirname "$0")/modules"

# ── Validate inputs ──────────────────────────────────────────
if [ ! -f "$SHELL_FILE" ]; then
  echo "ERROR: shell.html not found at $SHELL_FILE"
  exit 1
fi

if $OBFUSCATE && ! command -v terser &>/dev/null; then
  echo "ERROR: terser not found. Run: npm install -g terser"
  exit 1
fi

# ── Assemble via Python ───────────────────────────────────────
python3 - <<'PYEOF' "$SHELL_FILE" "$MODULES_DIR" "$OUT"
import sys, os, re

shell_path, modules_dir, out_path = sys.argv[1], sys.argv[2], sys.argv[3]

with open(shell_path, 'r', encoding='utf-8') as f:
    shell = f.read()

# Find the last </script> in the file — that's where modules inject
last_script_close = shell.rfind('</script>')
if last_script_close == -1:
    print("ERROR: No </script> found in shell.html")
    sys.exit(1)

shell_head = shell[:last_script_close]
shell_tail = shell[last_script_close:]

# Collect module files in alphabetical order
modules = []
if os.path.isdir(modules_dir):
    for fname in sorted(os.listdir(modules_dir)):
        if fname.endswith('.js'):
            fpath = os.path.join(modules_dir, fname)
            with open(fpath, 'r', encoding='utf-8') as f:
                modules.append(f.read())

# Assemble
injected = '\n'.join(modules)
output = shell_head + ('\n\n' + injected + '\n' if injected else '') + shell_tail

with open(out_path, 'w', encoding='utf-8') as f:
    f.write(output)

print(f"Built: {out_path}")
print(f"  Shell:   {len(shell_head)+len(shell_tail)} chars")
print(f"  Modules: {len(modules)} file(s) injected")
PYEOF

# ── Obfuscate JS block if requested ──────────────────────────
if $OBFUSCATE; then
  echo "  Obfuscating…"
  TMP="$OUT.tmp"

  python3 - <<PYEOF2 "$OUT" "$TMP"
import sys, subprocess, re

src_path, tmp_path = sys.argv[1], sys.argv[2]

with open(src_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Extract the main <script> block (last one)
# Find last <script> ... </script>
start = html.rfind('<script>')
end   = html.rfind('</script>')
if start == -1 or end == -1:
    print("  WARN: could not locate script block, skipping obfuscation")
    import shutil; shutil.copy(src_path, tmp_path)
    sys.exit(0)

js_raw = html[start+8:end]

result = subprocess.run(
    ['terser', '--compress', '--mangle',
     '--mangle-props', 'regex=/^_[^_]/',  # only mangle _private vars
     '--'],
    input=js_raw, capture_output=True, text=True
)
if result.returncode != 0:
    print("  WARN: terser failed:", result.stderr[:120])
    import shutil; shutil.copy(src_path, tmp_path)
    sys.exit(0)

obfuscated = result.stdout
html_out = html[:start+8] + obfuscated + html[end:]

with open(tmp_path, 'w', encoding='utf-8') as f:
    f.write(html_out)

ratio = int((1 - len(obfuscated)/len(js_raw)) * 100)
print(f"  JS: {len(js_raw):,} → {len(obfuscated):,} chars ({ratio}% smaller)")
PYEOF2

  mv "$TMP" "$OUT"
  echo "  Obfuscated: $OUT"
fi

echo "Done → $OUT"
