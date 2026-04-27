CREATE TABLE IF NOT EXISTS simulations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  image_url TEXT,
  shape TEXT,
  color TEXT,
  ai_response TEXT,
  created_at TEXT
);
