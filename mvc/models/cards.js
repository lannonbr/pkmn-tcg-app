const appDb = require("../../appDb");

function getCards() {
  return appDb.db.prepare("SELECT * FROM followedCards").all();
}

function getCard(cardId) {
  return appDb.db
    .prepare("SELECT * FROM followedCards where identifier = ?")
    .get(cardId);
}

function saveCard(card) {
  // Update the card if it already has been saved
  if (getCard(card.identifier) != undefined) {
    updateFollowCard(card.identifier, card.requestedPrice, card.refreshCron);
  } else {
    const insertStmt = appDb.db.prepare(
      "INSERT INTO followedCards (uuid, identifier, cardName, rarity, marketPrice, requestedPrice, tcgLink, refreshCron) VALUES (@uuid, @identifier, @cardName, @rarity, @marketPrice, @requestedPrice, @tcgLink, @refreshCron)"
    );

    insertStmt.run({
      uuid: card.uuid,
      identifier: card.identifier,
      cardName: card.name,
      rarity: card.rarity,
      marketPrice: card.marketPrice,
      requestedPrice: card.requestedPrice,
      tcgLink: card.tcgLink,
      refreshCron: card.refreshCron,
    });
  }
}

function removeCard(id) {
  appDb.db.prepare("DELETE FROM followedCards WHERE identifier = ?").run(id);
}

function updatePrice(id, marketPrice) {
  appDb.db
    .prepare("UPDATE followedCards SET marketPrice = ? WHERE identifier = ?")
    .run(marketPrice, id);
}

function updateFollowCard(id, requestedPrice, refreshCron) {
  appDb.db
    .prepare(
      "UPDATE followedCards SET requestedPrice = ?, refreshCron = ? WHERE identifier = ?"
    )
    .run(requestedPrice, refreshCron, id);
}

module.exports = {
  getCard,
  getCards,
  saveCard,
  removeCard,
  updatePrice,
  updateFollowCard,
};
