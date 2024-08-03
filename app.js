const appDb = require("./appDb");
const sqlite = require("better-sqlite3");
require("dotenv").config();

const pokemon = require("pokemontcgsdk");
pokemon.configure({ apiKey: process.env["POKEMON_TCG_API_TOKEN"] });

const scheduleJobs = require("./lib/scheduleJobs");
require("roosevelt")({
  onServerInit: (app) => {
    appDb.db = sqlite("data/data.db");
    scheduleJobs();
  },
}).startServer();
