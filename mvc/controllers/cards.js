const scheduleJobs = require("../../lib/scheduleJobs");
const { randomUUID } = require("node:crypto");
const {
  removeCard,
  saveCard,
  getCards,
  getCard,
  updateFollowCard,
} = require("../models/cards");

module.exports = (router, app) => {
  router.route("/cards").get((req, res) => {
    const cards = getCards();
    return res.json(cards);
  });

  router.route("/cards/:id").get((req, res) => {
    const cardId = req.params.id;

    const card = getCard(cardId);

    return res.json(card);
  });

  router.route("/cards").post((req, res) => {
    if (req.body?.content && Array.isArray(JSON.parse(req.body.content))) {
      const content = JSON.parse(req.body.content);

      for (let card of content) {
        card.name = card.cardName;
        saveCard(card);
      }
    } else {
      const card = req.body;

      card.uuid = randomUUID();

      saveCard(card);
    }

    scheduleJobs();

    res.redirect(`/`);
  });

  router.route("/cards/:id").post((req, res) => {
    const { id, requestedPrice, refreshCron } = req.body;

    updateFollowCard(id, requestedPrice, refreshCron);

    scheduleJobs();

    return res.redirect("/");
  });

  router.route("/cards/:id").delete((req, res) => {
    const cardId = req.params.id;

    removeCard(cardId);

    scheduleJobs();

    res.json({ message: "Successfully deleted ${cardId}" });
  });
};
