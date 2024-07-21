CREATE TABLE followedCards (
  uuid TEXT PRIMARY KEY,
  identifier TEXT,
  cardName TEXT,
  rarity TEXT,
  marketPrice REAL,
  requestedPrice REAL,
  tcgLink TEXT,
  refreshCron TEXT
);