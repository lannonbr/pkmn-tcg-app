const appDb = require("./appDb");
const sqlite = require("better-sqlite3");
require("dotenv").config();

const pokemon = require("pokemontcgsdk");

if (process.env.POKEMON_TCG_API_TOKEN == undefined) {
  console.log(
    "Error: the env variable POKEMON_TCG_API_TOKEN is not set. Please grab a token here: https://pokemontcg.io/"
  );
  process.exit(1);
}

if (process.env.DISCORD_WEBHOOK_URL == undefined) {
  console.log(
    "Error: the env variable DISCORD_WEBHOOK_URL is not set. Learn how to set one up here: https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks"
  );
  process.exit(1);
}

pokemon.configure({ apiKey: process.env["POKEMON_TCG_API_TOKEN"] });

const scheduleJobs = require("./lib/scheduleJobs");
require("roosevelt")({
  onServerInit: (app) => {
    appDb.db = sqlite("data/data.db");
    scheduleJobs();
  },
}).startServer();
