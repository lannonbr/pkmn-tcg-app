const fs = require("fs");
const path = require("path");
const pokemon = require("pokemontcgsdk");
const {
  saveCard,
  removeCard,
  getCard,
  updateFollowCard,
  getCards,
} = require("../models/cards");
const scheduleJobs = require("../../lib/scheduleJobs");
const { randomUUID } = require("node:crypto");

const usdFormatter = new Intl.NumberFormat("en-us", {
  style: "currency",
  currency: "USD",
});

module.exports = (router, app) => {
  router.route("/new/").get(async (req, res) => {
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

  router.route("/followedCards").get((req, res) => {
    const cards = getCards();
    return res.json(cards);
  });

  router.route("/import").post((req, res) => {
    const content = JSON.parse(req.body.content);

    for (let card of content) {
      card.name = card.cardName;
      saveCard(card);
    }

    scheduleJobs();

    res.redirect("/");
  });

  router.route("/new/:id").get(async (req, res) => {
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
      name: set.name,
      image: set.images.logo,
      releaseDate: set.releaseDate,
      total: set.printedTotal,
      secretRares: set.total - set.printedTotal,
    };

    model.content.pageTitle = `Set Listing: ${set.name}`;
    res.render("setList", model);
  });

  router.route("/followedCard/:id").get((req, res) => {
    const cardId = req.params.id;

    const card = getCard(cardId);

    return res.json(card);
  });

  router.route("/updateFollowCard").post((req, res) => {
    const { id, requestedPrice, refreshCron } = req.body;

    updateFollowCard(id, requestedPrice, refreshCron);

    scheduleJobs();

    return res.redirect("/");
  });

  router.route("/card/:id").get(async (req, res) => {
    const cardId = req.params.id;

    const card = await pokemon.card.find(cardId);

    let model = require("../models/global")(req, res);
    model.routePrefix = app.get("routePrefix") || "";

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

  router.route("/saveCard").post((req, res) => {
    const card = req.body;

    card.uuid = randomUUID();

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
