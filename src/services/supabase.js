// ═══════════════════════════════════════════════════════════════
// SERVICE: Supabase  |  supabase.js
// Pipeline OS · v5.0 · src/services/supabase.js
//
// Cloud persistence layer. Replaces IndexedDB as primary store
// when Supabase credentials are configured.
// IndexedDB remains as offline cache / fallback.
//
// Architecture:
//   write → Supabase (primary) + IndexedDB (cache)
//   read  → IndexedDB cache first, Supabase on miss
//   boot  → pull from Supabase, hydrate IndexedDB cache
// ═══════════════════════════════════════════════════════════════

// ── Supabase Client (lightweight, no SDK dependency) ─────────
const SUPA_STORAGE_KEY = 'ppos_supabase';

let _supaUrl = '';
let _supaKey = ''; // anon key (public)
let _supaToken = ''; // user JWT after auth
let _supaUserId = '';
let _supaReady = false;

/**
 * Initialize Supabase connection.
 * Call once at boot with credentials from settings.
 */
export function supaInit(url, anonKey) {
  if (!url || !anonKey) return false;
  _supaUrl = url.replace(/\/$/, '');
  _supaKey = anonKey;

  // Restore session from localStorage
  const saved = localStorage.getItem(SUPA_STORAGE_KEY);
  if (saved) {
    try {
      const s = JSON.parse(saved);
      if (s.access_token && s.user?.id) {
        _supaToken = s.access_token;
        _supaUserId = s.user.id;
        _supaReady = true;
      }
    } catch (e) { /* ignore */ }
  }
  return _supaReady;
}

export function supaIsReady() { return _supaReady; }
export function supaUserId() { return _supaUserId; }

// ── HTTP helper ──────────────────────────────────────────────
async function _supa(method, path, body = null, query = '') {
  const url = `${_supaUrl}/rest/v1/${path}${query ? '?' + query : ''}`;
  const headers = {
    'apikey': _supaKey,
    'Authorization': `Bearer ${_supaToken || _supaKey}`,
    'Content-Type': 'application/json',
    'Prefer': method === 'POST' ? 'return=representation' : (method === 'PATCH' ? 'return=representation' : ''),
  };
  if (!headers.Prefer) delete headers.Prefer;

  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);

  const resp = await fetch(url, opts);
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.message || err.details || `Supabase ${resp.status}`);
  }
  const text = await resp.text();
  return text ? JSON.parse(text) : null;
}

// ── Auth ─────────────────────────────────────────────────────
export async function supaSignUp(email, password) {
  const resp = await fetch(`${_supaUrl}/auth/v1/signup`, {
    method: 'POST',
    headers: { 'apikey': _supaKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await resp.json();
  if (data.error) throw new Error(data.error.message || data.msg);
  if (data.access_token) {
    _supaToken = data.access_token;
    _supaUserId = data.user.id;
    _supaReady = true;
    localStorage.setItem(SUPA_STORAGE_KEY, JSON.stringify(data));
  }
  return data;
}

export async function supaSignIn(email, password) {
  const resp = await fetch(`${_supaUrl}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { 'apikey': _supaKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await resp.json();
  if (data.error) throw new Error(data.error.message || data.msg);
  _supaToken = data.access_token;
  _supaUserId = data.user.id;
  _supaReady = true;
  localStorage.setItem(SUPA_STORAGE_KEY, JSON.stringify(data));
  return data;
}

export function supaSignOut() {
  _supaToken = '';
  _supaUserId = '';
  _supaReady = false;
  localStorage.removeItem(SUPA_STORAGE_KEY);
}

// ── Labels ───────────────────────────────────────────────────
export async function supaGetLabels() {
  return _supa('GET', 'labels', null, `owner_id=eq.${_supaUserId}&order=created_at.asc`);
}

export async function supaCreateLabel(name) {
  const rows = await _supa('POST', 'labels', { owner_id: _supaUserId, name });
  return rows?.[0] || null;
}

export async function supaUpdateLabel(id, fields) {
  const rows = await _supa('PATCH', `labels?id=eq.${id}`, fields);
  return rows?.[0] || null;
}

export async function supaDeleteLabel(id) {
  return _supa('DELETE', `labels?id=eq.${id}`);
}

// ── Artists ──────────────────────────────────────────────────
export async function supaGetArtists(labelId) {
  const q = labelId
    ? `label_id=eq.${labelId}&order=created_at.asc`
    : `order=created_at.asc`;
  return _supa('GET', 'artists', null, q);
}

export async function supaCreateArtist(labelId, name, opts = {}) {
  const row = { label_id: labelId, name };
  if (opts.persona) row.persona = opts.persona;
  if (opts.style_prompt) row.style_prompt = opts.style_prompt;
  if (opts.bio) row.bio = opts.bio;
  const rows = await _supa('POST', 'artists', row);
  return rows?.[0] || null;
}

export async function supaUpdateArtist(id, fields) {
  const rows = await _supa('PATCH', `artists?id=eq.${id}`, fields);
  return rows?.[0] || null;
}

export async function supaDeleteArtist(id) {
  return _supa('DELETE', `artists?id=eq.${id}`);
}

// ── Tracks ───────────────────────────────────────────────────
export async function supaGetTracks(artistId) {
  return _supa('GET', 'tracks', null, `artist_id=eq.${artistId}&order=created_at.asc`);
}

export async function supaCreateTrack(artistId, title, opts = {}) {
  const row = { artist_id: artistId, title };
  if (opts.lyrics) row.lyrics = opts.lyrics;
  if (opts.prompt) row.prompt = opts.prompt;
  if (opts.negative_prompt) row.negative_prompt = opts.negative_prompt;
  if (opts.bpm) row.bpm = opts.bpm;
  if (opts.key) row.key = opts.key;
  if (opts.time_sig) row.time_sig = opts.time_sig;
  if (opts.from_suno) row.from_suno = opts.from_suno;
  if (opts.module_state) row.module_state = opts.module_state;
  const rows = await _supa('POST', 'tracks', row);
  return rows?.[0] || null;
}

export async function supaUpdateTrack(id, fields) {
  const rows = await _supa('PATCH', `tracks?id=eq.${id}`, fields);
  return rows?.[0] || null;
}

export async function supaDeleteTrack(id) {
  return _supa('DELETE', `tracks?id=eq.${id}`);
}

/**
 * Save full module state snapshot for a track.
 * Called by persistence layer on autosave / beforeunload.
 */
export async function supaSaveModuleState(trackId, state) {
  return supaUpdateTrack(trackId, { module_state: state });
}

/**
 * Load full module state snapshot for a track.
 */
export async function supaLoadModuleState(trackId) {
  const rows = await _supa('GET', 'tracks', null, `id=eq.${trackId}&select=module_state`);
  return rows?.[0]?.module_state || null;
}

// ── Versions ─────────────────────────────────────────────────
export async function supaGetVersions(trackId) {
  return _supa('GET', 'versions', null, `track_id=eq.${trackId}&order=version_number.asc`);
}

export async function supaCreateVersion(trackId, versionNumber, opts = {}) {
  const row = { track_id: trackId, version_number: versionNumber };
  if (opts.suno_id) row.suno_id = opts.suno_id;
  if (opts.audio_url) row.audio_url = opts.audio_url;
  if (opts.prompt_used) row.prompt_used = opts.prompt_used;
  if (opts.notes) row.notes = opts.notes;
  const rows = await _supa('POST', 'versions', row);
  return rows?.[0] || null;
}

export async function supaSelectVersion(trackId, versionId) {
  // Deselect all, then select the one
  await _supa('PATCH', `versions?track_id=eq.${trackId}`, { is_selected: false });
  return _supa('PATCH', `versions?id=eq.${versionId}`, { is_selected: true });
}

export async function supaDeleteVersion(id) {
  return _supa('DELETE', `versions?id=eq.${id}`);
}

// ── Sync: Supabase ↔ IndexedDB ──────────────────────────────
/**
 * Pull all user data from Supabase and hydrate IndexedDB cache.
 * Call after successful auth.
 */
export async function supaPullAll() {
  if (!_supaReady) return;

  try {
    // Pull labels
    const labels = await supaGetLabels();
    const mappedLabels = labels.map(l => ({
      id: l.id,
      name: l.name,
      createdAt: l.created_at,
    }));
    window.dbSet('pipeline_labels', mappedLabels);

    // Pull artists per label (also get unlabeled)
    const allArtists = await _supa('GET', 'artists', null, 'order=created_at.asc');
    const mappedArtists = allArtists.map(a => ({
      id: a.id,
      name: a.name,
      labelId: a.label_id,
      stylePrompt: a.style_prompt || '',
      bio: a.bio || '',
      personas: a.persona ? [{ name: a.persona, styleVariation: '' }] : [],
      createdAt: a.created_at,
    }));
    window.dbSet('pipeline_artists', mappedArtists);

    // Pull tracks per artist
    for (const a of allArtists) {
      const tracks = await supaGetTracks(a.id);
      const mappedTracks = tracks.map(t => ({
        name: t.title,
        supaId: t.id,
        fromSuno: t.from_suno || false,
        status: t.status,
        savedAt: t.updated_at,
        createdAt: t.created_at,
      }));
      window.dbSet('pipeline_projects_' + a.id, mappedTracks);
    }

    console.log('[Supabase] Pull complete:', mappedLabels.length, 'labels,', allArtists.length, 'artists');
  } catch (e) {
    console.error('[Supabase] Pull failed:', e.message);
  }
}

/**
 * Push local IndexedDB data to Supabase.
 * Used for initial migration from local-only to cloud.
 */
export async function supaPushAll() {
  if (!_supaReady) return;

  try {
    // Push labels
    const localLabels = window.dbGet('pipeline_labels') || [];
    for (const l of localLabels) {
      const created = await supaCreateLabel(l.name);
      if (created) {
        // Update local ID to Supabase ID
        l._supaId = created.id;
      }
    }

    // Push artists
    const localArtists = window.dbGet('pipeline_artists') || [];
    for (const a of localArtists) {
      const labelId = localLabels.find(l => l.id === a.labelId)?._supaId;
      if (!labelId) continue; // skip orphaned artists
      const created = await supaCreateArtist(labelId, a.name, {
        style_prompt: a.stylePrompt,
        bio: a.bio,
        persona: a.personas?.[0]?.name || '',
      });
      if (created) {
        a._supaId = created.id;
        // Push tracks for this artist
        const tracks = window.dbGet('pipeline_projects_' + a.id) || [];
        for (const t of tracks) {
          await supaCreateTrack(created.id, t.name || t.track, {
            from_suno: t.fromSuno || false,
          });
        }
      }
    }

    console.log('[Supabase] Push complete');
  } catch (e) {
    console.error('[Supabase] Push failed:', e.message);
  }
}

// ── Expose to window ─────────────────────────────────────────
window.supaInit = supaInit;
window.supaIsReady = supaIsReady;
window.supaSignUp = supaSignUp;
window.supaSignIn = supaSignIn;
window.supaSignOut = supaSignOut;
window.supaGetLabels = supaGetLabels;
window.supaCreateLabel = supaCreateLabel;
window.supaUpdateLabel = supaUpdateLabel;
window.supaDeleteLabel = supaDeleteLabel;
window.supaGetArtists = supaGetArtists;
window.supaCreateArtist = supaCreateArtist;
window.supaUpdateArtist = supaUpdateArtist;
window.supaDeleteArtist = supaDeleteArtist;
window.supaGetTracks = supaGetTracks;
window.supaCreateTrack = supaCreateTrack;
window.supaUpdateTrack = supaUpdateTrack;
window.supaDeleteTrack = supaDeleteTrack;
window.supaSaveModuleState = supaSaveModuleState;
window.supaLoadModuleState = supaLoadModuleState;
window.supaGetVersions = supaGetVersions;
window.supaCreateVersion = supaCreateVersion;
window.supaSelectVersion = supaSelectVersion;
window.supaDeleteVersion = supaDeleteVersion;
window.supaPullAll = supaPullAll;
window.supaPushAll = supaPushAll;
