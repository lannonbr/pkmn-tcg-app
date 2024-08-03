const { sendAt } = require("cron");
const { DateTime } = require("luxon");
const { getCards } = require("./cards");

module.exports = (model) => {
  const dollarFormatter = new Intl.NumberFormat("en-us", {
    style: "currency",
    currency: "USD",
  });

  model.cards = getCards();

  // Format prices to dollar amounts
  model.cards.forEach((card) => {
    card.marketPrice = dollarFormatter.format(card.marketPrice);
    card.requestedPrice = dollarFormatter.format(card.requestedPrice);
    card.nextRun = sendAt(card.refreshCron).toLocaleString(
      DateTime.TIME_SIMPLE
    );
  });

  return model;
};
