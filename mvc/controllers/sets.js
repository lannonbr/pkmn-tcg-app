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

  router.route("/sets-jp/").get(async (req, res) => {
    let model = require("../models/global")(req, res);
    model.routePrefix = app.get("routePrefix") || "";

    model.sets = JSON.parse(
      fs.readFileSync(path.join(__dirname, "..", "..", "data", "sets-jp.json"))
    ).results.filter((set) => set.abbreviation.length > 0);

    model.sets.forEach((set) => {
      set.abbreviation = set.abbreviation.toLowerCase();
    });

    model.content.pageTitle = "JP Set Listing";
    res.render("jpSetListing", model);
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

  router.route("/sets-jp/:id").get(async (req, res) => {
    let model = require("../models/global")(req, res);
    model.routePrefix = app.get("routePrefix") || "";

    let setId = req.params.id;

    model.setId = setId;

    model.setList = JSON.parse(
      fs.readFileSync(
        path.join(
          __dirname,
          "..",
          "..",
          "data",
          "sets",
          "jp",
          `${setId}-products.json`
        )
      )
    );

    model.setList = model.setList
      .filter((item) => {
        return (
          item.extendedData.findIndex((data) => data.name == "Number") >= 0
        );
      })
      .map((card) => {
        return {
          productId: card.productId,
          name: card.name.split(" -")[0],
          number: parseInt(
            card.extendedData
              .find((data) => data.name == "Number")
              .value.split("/")[0]
          ),
        };
      });

    model.content.pageTitle = `Set Listing: ${setId}`;
    res.render("jpSetList", model);
  });

  router.route("/sets-jp/:setId/card/:cardId").get(async (req, res) => {
    const cardId = req.params.cardId;
    const setId = req.params.setId;

    let model = require("../models/global")(req, res);
    model.routePrefix = app.get("routePrefix") || "";

    let setList = JSON.parse(
      fs.readFileSync(
        path.join(
          __dirname,
          "..",
          "..",
          "data",
          "sets",
          "jp",
          `${setId}-products.json`
        )
      )
    );

    let card = setList.find((product) => product.productId == cardId);

    model.set = setId;
    model.card = card;

    model.cardDetails = JSON.stringify(card, null, 2);

    model.cardPic = card.imageUrl.replace("200w", "400w");
    model.tcgPlayerUrl = card.url;

    model.content.pageTitle = `Card: ${card.name} (${cardId})`;
    res.render("jpCard", model);
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
