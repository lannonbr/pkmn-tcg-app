const fs = require("fs");
const path = require("path");
const pokemon = require("pokemontcgsdk");
const { getCard } = require("../models/cards");

const usdFormatter = new Intl.NumberFormat("en-us", {
  style: "currency",
  currency: "USD",
});

module.exports = (router, app) => {
  router.route("/sets/").get(async (req, res) => {
    let model = require("../models/global")(req, res);
    model.routePrefix = app.get("routePrefix") || "";

    model.sets = JSON.parse(
      fs.readFileSync(path.join(__dirname, "..", "..", "data", "sets.json"))
    );

    model.sets = model.sets.reverse();

    let setsByYear = {};

    for (let set of model.sets) {
      let setYear = /(\d{4})/.exec(set.description)[0];

      if (setsByYear[setYear] === undefined) {
        setsByYear[setYear] = [set];
      } else {
        setsByYear[setYear].push(set);
      }
    }

    model.setsByYear = Object.entries(setsByYear).reverse();

    model.newSets = model.sets.slice(0, 4);

    for (const set of model.newSets) {
      const s = await pokemon.set.find(set.value);

      set.img = s.images.logo;
    }

    model.content.pageTitle = "Set Listing";
    res.render("setListing", model);
  });

  router.route("/sets/:id").get(async (req, res) => {
    const setId = req.params.id;

    let model = require("../models/global")(req, res);
    model.routePrefix = app.get("routePrefix") || "";

    model.setList = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, "..", "..", "data", "sets", `${setId}.json`)
      )
    );

    if (setId.startsWith("sv")) {
      model.series = "SV";
    }

    const set = await pokemon.set.find(setId);

    model.set = {
      id: setId,
      name: set.name,
      image: set.images.logo,
      releaseDate: set.releaseDate,
      total: set.printedTotal,
      secretRares: set.total - set.printedTotal,
    };

    model.content.pageTitle = `Set Listing: ${set.name}`;
    res.render("setList", model);
  });

  router.route("/sets/:setId/card/:cardId").get(async (req, res) => {
    const cardId = req.params.cardId;

    const card = await pokemon.card.find(cardId);

    let model = require("../models/global")(req, res);
    model.routePrefix = app.get("routePrefix") || "";

    model.cardDetails = JSON.stringify(card, null, 2);

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

    let cardMetadata = {
      identifier: card.id,
      name: card.name,
      rarity: card.rarity,
      tcgLink: model.tcgPlayerUrl,
      prices: model.priceList,
    };

    const followCard = getCard(cardId);

    if (followCard != undefined) {
      cardMetadata.requestedPrice = followCard.requestedPrice;
      cardMetadata.refreshCron = followCard.refreshCron;
    }

    model.cardMetadata = JSON.stringify(cardMetadata);

    model.content.pageTitle = `Card: ${card.name} (${cardId})`;
    res.render("card", model);
  });
};
