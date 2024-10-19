const { createSaveCardDialog } = require("./cardDialog");

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

if (window.location.pathname == "/") {
  document.querySelectorAll(".editBtn").forEach((btn) => {
    btn.addEventListener("click", async (evt) => {
      let row = evt.target.parentElement.parentElement;
      let cardId = row
        .querySelector("td:nth-child(2) a")
        .getAttribute("href")
        .split("/card/")[1];

      const card = await fetch(`/followedCard/${cardId}`).then((resp) =>
        resp.json()
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
      form.action = "/updateFollowCard";

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
