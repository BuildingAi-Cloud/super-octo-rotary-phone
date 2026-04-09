-- ============================================================================
-- 002: Vendor Dashboard Tables
-- Creates vendor_service_requests, vendor_invoices, vendor_appointments
-- ============================================================================

-- 1. Service Requests assigned to vendors
CREATE TABLE IF NOT EXISTS vendor_service_requests (
  id            TEXT PRIMARY KEY,
  building      TEXT NOT NULL,
  issue         TEXT NOT NULL,
  priority      TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  status        TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'completed')),
  date          DATE NOT NULL DEFAULT CURRENT_DATE,
  assigned_vendor_id TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vsr_vendor    ON vendor_service_requests (assigned_vendor_id);
CREATE INDEX IF NOT EXISTS idx_vsr_status    ON vendor_service_requests (status);
CREATE INDEX IF NOT EXISTS idx_vsr_date      ON vendor_service_requests (date DESC);

-- Auto-update trigger
CREATE OR REPLACE FUNCTION update_vsr_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_vsr_updated ON vendor_service_requests;
CREATE TRIGGER trg_vsr_updated
  BEFORE UPDATE ON vendor_service_requests
  FOR EACH ROW EXECUTE FUNCTION update_vsr_updated_at();

-- RLS
ALTER TABLE vendor_service_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access to vendor_service_requests"
  ON vendor_service_requests FOR ALL
  USING (true)
  WITH CHECK (true);


-- 2. Vendor Invoices
CREATE TABLE IF NOT EXISTS vendor_invoices (
  id              TEXT PRIMARY KEY,
  vendor_id       TEXT NOT NULL,
  invoice_number  TEXT NOT NULL,
  amount          NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  service_date    DATE,
  notes           TEXT DEFAULT '',
  request_id      TEXT REFERENCES vendor_service_requests(id) ON DELETE SET NULL,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vi_vendor  ON vendor_invoices (vendor_id);
CREATE INDEX IF NOT EXISTS idx_vi_status  ON vendor_invoices (status);

CREATE OR REPLACE FUNCTION update_vi_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_vi_updated ON vendor_invoices;
CREATE TRIGGER trg_vi_updated
  BEFORE UPDATE ON vendor_invoices
  FOR EACH ROW EXECUTE FUNCTION update_vi_updated_at();

ALTER TABLE vendor_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access to vendor_invoices"
  ON vendor_invoices FOR ALL
  USING (true)
  WITH CHECK (true);


-- 3. Vendor Appointments
CREATE TABLE IF NOT EXISTS vendor_appointments (
  id          TEXT PRIMARY KEY,
  vendor_id   TEXT NOT NULL,
  date        DATE NOT NULL,
  time        TEXT NOT NULL,
  building    TEXT NOT NULL,
  contact     TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_va_vendor ON vendor_appointments (vendor_id);
CREATE INDEX IF NOT EXISTS idx_va_date   ON vendor_appointments (date ASC);

ALTER TABLE vendor_appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access to vendor_appointments"
  ON vendor_appointments FOR ALL
  USING (true)
  WITH CHECK (true);


-- 4. Seed data for demo/testing
INSERT INTO vendor_service_requests (id, building, issue, priority, status, date, assigned_vendor_id)
VALUES
  ('REQ-081', 'Harlow Tower A',    'HVAC not cooling',         'high',   'new',         '2026-04-07', 'vendor-1'),
  ('REQ-079', 'Meridian Block 3',  'Elevator maintenance',     'medium', 'in_progress', '2026-04-05', 'vendor-1'),
  ('REQ-074', 'Oakfield Centre',   'Plumbing leak — floor 2',  'high',   'new',         '2026-04-03', 'vendor-1'),
  ('REQ-068', 'Harlow Tower B',    'Fire alarm inspection',    'low',    'in_progress', '2026-03-29', 'vendor-1'),
  ('REQ-061', 'Nexus Office Park', 'Electrical panel check',   'medium', 'completed',   '2026-03-24', 'vendor-1')
ON CONFLICT (id) DO NOTHING;

INSERT INTO vendor_invoices (id, vendor_id, invoice_number, amount, service_date, notes, request_id, status)
VALUES
  ('inv-1', 'vendor-1', 'INV-1042', 1250.00, '2026-03-24', 'Electrical panel inspection and repair', 'REQ-061', 'pending')
ON CONFLICT (id) DO NOTHING;

INSERT INTO vendor_appointments (id, vendor_id, date, time, building, contact, description)
VALUES
  ('apt-1', 'vendor-1', '2026-04-12', '9:00 AM',  'Harlow Tower A',  'Sarah Chen',  'HVAC Inspection'),
  ('apt-2', 'vendor-1', '2026-04-15', '2:30 PM',  'Oakfield Centre', 'James Patel', 'Plumbing Assessment')
ON CONFLICT (id) DO NOTHING;
