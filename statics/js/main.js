const { createSaveCardDialog } = require("./cardDialog");

if (window.location.href.includes("/card/")) {
  document
    .getElementById("addToWatchlistBtn")
    .addEventListener("click", createSaveCardDialog);
}
