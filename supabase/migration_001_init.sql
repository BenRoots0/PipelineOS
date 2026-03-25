-- ════════════════════════════════════════════════════════════════
-- Pipeline OS · Supabase Migration 001 · Initial Schema
-- Run in Supabase SQL Editor (Dashboard → SQL → New query)
-- ════════════════════════════════════════════════════════════════

-- 1. LABELS ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS labels (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_labels_owner ON labels(owner_id);

-- 2. ARTISTS ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS artists (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label_id   uuid NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
  name       text NOT NULL,
  persona    text,
  style_prompt text,
  bio        text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_artists_label ON artists(label_id);

-- 3. TRACKS ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tracks (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id       uuid NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  title           text NOT NULL,
  lyrics          text,
  prompt          text,
  negative_prompt text,
  bpm             int,
  key             text,
  time_sig        text,
  status          text NOT NULL DEFAULT 'draft',
  from_suno       boolean NOT NULL DEFAULT false,
  -- Full module state snapshot (pipeline[], LI, pipelineObj)
  module_state    jsonb,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_tracks_artist ON tracks(artist_id);
CREATE INDEX IF NOT EXISTS idx_tracks_status ON tracks(status);

-- 4. VERSIONS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS versions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id        uuid NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  version_number  int NOT NULL,
  suno_id         text,
  audio_url       text,
  prompt_used     text,
  is_selected     boolean NOT NULL DEFAULT false,
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_versions_track ON versions(track_id);
CREATE INDEX IF NOT EXISTS idx_versions_selected ON versions(is_selected);

-- 5. AUTO-UPDATE updated_at ──────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_tracks_updated_at
  BEFORE UPDATE ON tracks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 6. ROW LEVEL SECURITY ─────────────────────────────────────────
ALTER TABLE labels   ENABLE ROW LEVEL SECURITY;
ALTER TABLE artists  ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracks   ENABLE ROW LEVEL SECURITY;
ALTER TABLE versions ENABLE ROW LEVEL SECURITY;

-- LABELS policies
CREATE POLICY labels_select ON labels FOR SELECT TO authenticated USING (true);
CREATE POLICY labels_insert ON labels FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY labels_update ON labels FOR UPDATE TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY labels_delete ON labels FOR DELETE TO authenticated USING (auth.uid() = owner_id);

-- ARTISTS policies (owner check via labels join)
CREATE POLICY artists_select ON artists FOR SELECT TO authenticated USING (true);
CREATE POLICY artists_insert ON artists FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM labels WHERE labels.id = label_id AND labels.owner_id = auth.uid()));
CREATE POLICY artists_update ON artists FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM labels WHERE labels.id = label_id AND labels.owner_id = auth.uid()));
CREATE POLICY artists_delete ON artists FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM labels WHERE labels.id = label_id AND labels.owner_id = auth.uid()));

-- TRACKS policies (owner check via artists → labels join)
CREATE POLICY tracks_select ON tracks FOR SELECT TO authenticated USING (true);
CREATE POLICY tracks_insert ON tracks FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM artists a JOIN labels l ON l.id = a.label_id
    WHERE a.id = artist_id AND l.owner_id = auth.uid()
  ));
CREATE POLICY tracks_update ON tracks FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM artists a JOIN labels l ON l.id = a.label_id
    WHERE a.id = artist_id AND l.owner_id = auth.uid()
  ));
CREATE POLICY tracks_delete ON tracks FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM artists a JOIN labels l ON l.id = a.label_id
    WHERE a.id = artist_id AND l.owner_id = auth.uid()
  ));

-- VERSIONS policies (owner check via tracks → artists → labels)
CREATE POLICY versions_select ON versions FOR SELECT TO authenticated USING (true);
CREATE POLICY versions_insert ON versions FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM tracks t JOIN artists a ON a.id = t.artist_id JOIN labels l ON l.id = a.label_id
    WHERE t.id = track_id AND l.owner_id = auth.uid()
  ));
CREATE POLICY versions_update ON versions FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM tracks t JOIN artists a ON a.id = t.artist_id JOIN labels l ON l.id = a.label_id
    WHERE t.id = track_id AND l.owner_id = auth.uid()
  ));
CREATE POLICY versions_delete ON versions FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM tracks t JOIN artists a ON a.id = t.artist_id JOIN labels l ON l.id = a.label_id
    WHERE t.id = track_id AND l.owner_id = auth.uid()
  ));
