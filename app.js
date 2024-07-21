const appDb = require("./appDb");
const sqlite = require("better-sqlite3");

require("roosevelt")({
  onServerInit: (app) => {
    appDb.db = sqlite("data/data.db");
  },
}).startServer();
