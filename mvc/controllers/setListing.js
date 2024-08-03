const fs = require("fs");
const path = require("path");
const pokemon = require("pokemontcgsdk");
const { saveCard, removeCard } = require("../models/cards");
const scheduleJobs = require("../../lib/scheduleJobs");

const usdFormatter = new Intl.NumberFormat("en-us", {
  style: "currency",
  currency: "USD",
});

module.exports = (router, app) => {
  router.route("/new/").get(async (req, res) => {
    let model = require("../models/global")(req, res);

    model.sets = JSON.parse(
      fs.readFileSync(path.join(__dirname, "..", "..", "data", "sets.json"))
    );

    model.sets = model.sets.reverse();

    model.newSets = model.sets.slice(0, 4);

    for (const set of model.newSets) {
      const s = await pokemon.set.find(set.value);

      set.img = s.images.logo;
    }

    model.content.pageTitle = "Set Listing";
    res.render("setListing", model);
  });

  router.route("/new/:id").get((req, res) => {
    const setId = req.params.id;

    let model = require("../models/global")(req, res);

    model.setList = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, "..", "..", "data", "sets", `${setId}.json`)
      )
    );

    model.content.pageTitle = `Set Listing: ${setId}`;
    res.render("setList", model);
  });

  router.route("/card/:id").get(async (req, res) => {
    const cardId = req.params.id;

    const card = await pokemon.card.find(cardId);

    let model = require("../models/global")(req, res);

    model.cardDetails = JSON.stringify(card, null, 2);
    // console.log(card);

    model.cardPrices = JSON.stringify(card.tcgplayer, null, 2);
    model.cardName = card.name;
    model.cardPic = card.images.small;
    model.set = card.set.id;
    model.tcgPlayerUrl = card.tcgplayer.url;
    model.priceList = Object.entries(card.tcgplayer.prices).map(
      ([type, priceObj]) => {
        return {
          type,
          marketPrice: usdFormatter.format(priceObj.market),
        };
      }
    );

    model.cardMetadata = JSON.stringify({
      identifier: card.id,
      name: card.name,
      rarity: card.rarity,
      tcgLink: model.tcgPlayerUrl,
      prices: model.priceList,
    });

    model.content.pageTitle = `Card: ${card.name} (${cardId})`;
    res.render("card", model);
  });

  router.route("/saveCard").post((req, res) => {
    const card = req.body;

    card.uuid = require("uuid").v4();

    saveCard(card);

    scheduleJobs();

    res.redirect(`/`);
  });

  router.route("/removeCard/:id").get((req, res) => {
    removeCard(req.params.id);

    scheduleJobs();

    res.redirect("/");
  });
};
