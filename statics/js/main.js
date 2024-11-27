const { createSaveCardDialog } = require("./cardDialog");

const routePrefix = document
  .querySelector("meta[name='routePrefix']")
  .getAttribute("content");

if (window.location.href.includes("/card/")) {
  const data = JSON.parse(document.getElementById("metadata").innerText);

  if (data.requestedPrice) {
    createSaveCardDialog();
    document.getElementById("addToWatchlistBtn").remove();
  } else {
    document
      .getElementById("addToWatchlistBtn")
      .addEventListener("click", createSaveCardDialog);
  }
}

if (window.location.pathname == `${routePrefix}/`) {
  document
    .querySelector("#exportCardsBtn")
    .addEventListener("click", async (evt) => {
      const cards = await fetch(`${routePrefix}/followedCards`).then((resp) =>
        resp.json()
      );

      const blob = new Blob([JSON.stringify(cards)], {
        type: "application/json",
      });

      const link = document.createElement("a");

      const url = URL.createObjectURL(blob);

      link.href = url;
      link.download = `pkmn-tcg-app-export.json`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    });

  document.querySelector("#importCardsBtn").addEventListener("click", (evt) => {
    const dialog = document.createElement("dialog");

    dialog.id = "importDialog";

    dialog.innerHTML = `
        <h2>Import</h2>
        <form method="post" action="/import">
          <textarea id="content" name="content"></textarea>
          <button type="button" class="cancelBtn">Cancel</button>
          <input type="Submit" value="Submit" />
        </form>
      `;

    dialog.querySelector(".cancelBtn").addEventListener("click", () => {
      dialog.close();
      dialog.remove();
    });

    dialog.addEventListener("close", () => {
      dialog.remove();
    });

    document.body.appendChild(dialog);

    dialog.showModal();
  });

  document.querySelectorAll(".editBtn").forEach((btn) => {
    btn.addEventListener("click", async (evt) => {
      let row = evt.target.parentElement.parentElement;
      let cardId = row
        .querySelector("td:nth-child(2) a")
        .getAttribute("href")
        .split("/card/")[1];

      const card = await fetch(`${routePrefix}/followedCard/${cardId}`).then(
        (resp) => resp.json()
      );

      const aside = document.createElement("aside");

      aside.innerHTML = `
      <div class="heading flex justify-between">
        <h2>Editing ${card.cardName} (${card.identifier})</h2>
        </div>
        <img src="https://images.pokemontcg.io/${card.identifier.replace(
          "-",
          "/"
        )}.png" alt="Card preview for ${card.cardName}" />
      `;

      const closeBtn = document.createElement("button");
      closeBtn.className = "closeBtn";
      closeBtn.innerText = "X";
      closeBtn.addEventListener("click", () => {
        aside.remove();
      });

      aside.querySelector(".heading").appendChild(closeBtn);

      let form = document.createElement("form");

      form.method = "post";
      form.action = `${routePrefix}/updateFollowCard`;

      form.innerHTML = `
        <input type="hidden" name="id" value="${cardId}" />
        <label for="requestedPrice">Requested Price:</label>
        <input type="text" name="requestedPrice" value="${card.requestedPrice}" />
        <label for="refreshCron">Schedule for refreshing (cron format, ref: <a href="https://crontab.guru">crontab.guru</a>):</label>
        <input type="text" name="refreshCron" value="${card.refreshCron}"/>
        <button type="submit">Submit</button>
      `;

      aside.appendChild(form);

      document.getElementById("homepage").appendChild(aside);
    });
  });
}
