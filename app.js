const appDb = require("./appDb");
const sqlite = require("better-sqlite3");
require("dotenv").config();
const { execSync } = require("child_process");
const fs = require("fs");
const pokemon = require("pokemontcgsdk");

if (!fs.existsSync("./public/css")) {
  fs.mkdirSync("./public/css", { recursive: true });
}

execSync(
  "npx tailwindcss -i ./statics/css/styles.css -o ./public/css/styles.css"
);

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
const app = require("roosevelt")({
  routePrefix: process.env.PKMN_TCG_APP_ROUTE_PREFIX,
  onServerInit: (app) => {
    appDb.db = sqlite("data/data.db");
    scheduleJobs();
  },
});

const routePrefix = app.expressApp.get("routePrefix") || "";

// Middleware to re-route any res.redirect() call to proper location if route prefix is used
if (routePrefix !== "") {
  app.expressApp.use((req, res, next) => {
    const redirect = res.redirect;

    res.redirect = function (url) {
      if (url.charAt(0) === "/" && !url.includes(routePrefix)) {
        url = routePrefix + url;
      }
      redirect.call(this, url);
    };
    next();
  });
}

app.startServer();
