const { CronJob } = require("cron");

const { getCards, updatePrice } = require("../mvc/models/cards");
const pokemon = require("pokemontcgsdk");

let jobs = [];

module.exports = function () {
  const cards = getCards();

  // Stop all existing jobs and delete them
  for (let job of jobs) {
    job.stop();
  }
  jobs = [];

  for (let card of cards) {
    const job = new CronJob(
      card.refreshCron,
      async function () {
        const cardFromAPI = await pokemon.card.find(this.card.identifier);

        const priceList = Object.entries(cardFromAPI.tcgplayer.prices).map(
          ([type, priceObj]) => {
            return {
              type,
              marketPrice: priceObj.market,
            };
          }
        );

        let marketPrice = 0;

        if (priceList.length > 1) {
          marketPrice = priceList.filter(
            (price) => !price.type.includes("reverse")
          )[0].marketPrice;
        } else {
          marketPrice = priceList[0].marketPrice;
        }

        updatePrice(this.card.identifier, marketPrice);

        if (marketPrice <= this.card.requestedPrice) {
          const discordUrl = process.env.DISCORD_WEBHOOK_URL;

          await fetch(discordUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              content: `Card ${this.card.cardName} (${this.card.identifier}) is cheaper than your requested price of $${this.card.requestedPrice}. Buy here: ${this.card.tcgLink}`,
            }),
          });
        }
      },
      null, // function to be run when `job.stop()` is called. Left null as no cleanup needed other than deleting the job from memory
      true, // Auto start
      Intl.DateTimeFormat().resolvedOptions().timeZone, // Time Zone
      { card } // Context
    );

    jobs.push(job);
  }

  console.log("Scheduled jobs running:", jobs.length);
};
