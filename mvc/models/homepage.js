const { CronJob } = require("cron");

// const job = new CronJob(
//   "* * * * *",
//   function () {
//     console.log("TICK");
//   },
//   null,
//   true,
//   "America/New_York"
// );

module.exports = (model) => {
  const dollarFormatter = new Intl.NumberFormat("en-us", {
    style: "currency",
    currency: "USD",
  });

  model.posts = [
    {
      uuid: "8b4b0e5b-9189-4fa1-9ac0-7beff8ae7864",
      identifier: "sv4-205",
      name: "Yveltal",
      rarity: "Illustration Rare",
      currentMarketPrice: dollarFormatter.format(17.21),
      requestedPrice: dollarFormatter.format(15),
      tcgLink:
        "https://www.tcgplayer.com/product/523886/pokemon-sv04-paradox-rift-yveltal-205-182?Language=English",
      refreshCron: "0 0 * * *",
    },
  ];

  return model;
};
