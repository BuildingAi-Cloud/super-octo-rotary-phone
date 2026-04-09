-- Migration: Create marketplace_listings table
-- Project: super-octo-rotary-phone
-- Date: 2026-04-09
-- Description: Marketplace for resident buy/sell/trade/services

CREATE TABLE IF NOT EXISTS marketplace_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('For Sale', 'Free / Giveaway', 'Services', 'Lost & Found', 'Housing Swap')),
  title TEXT NOT NULL CHECK (char_length(title) <= 120),
  description TEXT NOT NULL DEFAULT '' CHECK (char_length(description) <= 1000),
  suite TEXT NOT NULL DEFAULT 'Unassigned' CHECK (char_length(suite) <= 80),
  posted_by_user_id TEXT NOT NULL,
  posted_by_name TEXT NOT NULL CHECK (char_length(posted_by_name) <= 120),
  price TEXT CHECK (price IS NULL OR char_length(price) <= 40),
  is_free BOOLEAN NOT NULL DEFAULT false,
  interests INTEGER NOT NULL DEFAULT 0,
  contact_preference TEXT NOT NULL DEFAULT 'in_app' CHECK (contact_preference IN ('in_app', 'show_email', 'show_phone')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_status ON marketplace_listings(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_category ON marketplace_listings(category);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_created_at ON marketplace_listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_user ON marketplace_listings(posted_by_user_id);

-- RLS
ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON marketplace_listings
  FOR ALL USING (true) WITH CHECK (true);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_marketplace_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER marketplace_listings_updated_at
  BEFORE UPDATE ON marketplace_listings
  FOR EACH ROW
  EXECUTE FUNCTION update_marketplace_updated_at();

-- Seed data
INSERT INTO marketplace_listings (category, title, description, suite, posted_by_user_id, posted_by_name, price, is_free, interests, contact_preference, status, created_at)
VALUES
  ('For Sale', 'Standing desk — adjustable height', 'Uplift V2 desk, 48x30 inches. Minor scratches on surface. Pickup from lobby.', 'Suite 204', 'resident-001', 'Suite 204', '$120', false, 2, 'in_app', 'active', now() - interval '1 hour'),
  ('Free / Giveaway', 'Moving boxes — 15 assorted sizes', 'Free to a good home. Various sizes, some bubble wrap included.', 'Suite 110', 'resident-002', 'Suite 110', NULL, true, 5, 'in_app', 'active', now() - interval '4 hours'),
  ('Services', 'Dog walking — weekday mornings', 'Available Mon-Fri 7-9am. Experienced with large breeds.', 'Suite 507', 'resident-003', 'Suite 507', '$15/walk', false, 1, 'show_email', 'active', now() - interval '1 day'),
  ('Lost & Found', 'Silver key fob found near mailroom', 'Found silver building key fob Tuesday evening near mailroom entrance.', 'Building Team', 'staff-001', 'Building Team', NULL, false, 0, 'in_app', 'active', now() - interval '2 days'),
  ('For Sale', 'Acoustic guitar — barely used', 'Yamaha FG800 with case. Played less than 10 times.', 'Suite 312', 'resident-004', 'Suite 312', '$85', false, 3, 'in_app', 'active', now() - interval '3 days'),
  ('Housing Swap', '1BR swap — looking for 2BR same floor', 'Currently in 1BR facing east. Looking for 2BR on same floor, willing to discuss price adjustment.', 'Suite 401', 'resident-005', 'Suite 401', NULL, false, 4, 'show_phone', 'active', now() - interval '4 days');
