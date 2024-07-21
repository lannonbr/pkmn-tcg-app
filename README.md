# pkmn-tcg-app

A node app to track prices for Pokemon TCG cards based on prices from TCGPlayer. The main functionality will be sending Discord alerts when a card's market price drops
below a price I would be comfortable buying it at.

## Setup

Local dev:

- git clone
- `npm install`
- `node scripts/cacheSets.js` to grab set lists from https://github.com/PokemonTCG/pokemon-tcg-data/
- `npm run dev`

Docker compose:

- git clone
- `node scripts/cacheSets.js`
- `docker compose up -d`

## Env Variables

- POKEMON_TCG_API_TOKEN: API token from https://pokemontcg.io/ to get card & pricing data.
- DISCORD_WEBHOOK_URL: URL for discord alerts. Ref: https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks
