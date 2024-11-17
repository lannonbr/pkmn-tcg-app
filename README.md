# pkmn-tcg-app

A node app to track prices for Pokemon TCG cards based on prices from TCGPlayer. The main functionality will be sending Discord alerts when a card's market price drops below a price I would be comfortable buying it at.

![pokemon-tcg-price-tracker](https://github.com/user-attachments/assets/58e3b439-5dc5-4b39-8cfc-0f29d17a3aaa)

## Setup

Local dev:

- git clone
- `npm install`
- `mkdir data`
- `sqlite3 data/data.db < schemas/entries.sql` to initialize the database
- `node scripts/cacheSets.js` to grab set lists from https://github.com/PokemonTCG/pokemon-tcg-data/
- `npm run dev`

Docker compose:

- git clone
- `mkdir data`
- `node scripts/cacheSets.js`
- `docker compose up -d`

## Env Variables

- POKEMON_TCG_API_TOKEN (**Required**): API token from https://pokemontcg.io/ to get card & pricing data.
- DISCORD_WEBHOOK_URL (**Required**): URL for discord alerts. Ref: https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks
- PKMN_TCG_APP_ROUTE_PREFIX (_Optional_): Path prefix to run the server on
