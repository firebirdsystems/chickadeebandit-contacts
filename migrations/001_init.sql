CREATE TABLE IF NOT EXISTS app_contacts__contacts (
  id           TEXT NOT NULL,
  display_name TEXT NOT NULL,
  email        TEXT,
  phone        TEXT,
  category     TEXT,
  address      TEXT,
  notes        TEXT,
  created_by   TEXT,
  created_at   TEXT NOT NULL,
  updated_at   TEXT NOT NULL,
  PRIMARY KEY (id)
);
