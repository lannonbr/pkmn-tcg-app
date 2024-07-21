function createSaveCardDialog() {
  const data = JSON.parse(document.getElementById("metadata").innerText);

  const form = document.createElement("form");

  form.action = "/saveCard";
  form.method = "POST";
  form.innerHTML = `
    <input type="hidden" name="identifier" value="${data.identifier}" />
    <input type="hidden" name="name" value="${data.name}" />
    <input type="hidden" name="rarity" value="${data.rarity}" />
    <input type="hidden" name="marketPrice" value="${parseFloat(
      data.prices[0].marketPrice.slice(1)
    )}" />
    <input type="hidden" name="tcgLink" value="${data.tcgLink}" />

    <label for="requestedPrice">Requested Price:</label>
    <input type="text" name="requestedPrice" id="requestedPrice" required />
    <label for="refreshCron">Schedule for refreshing:</label>
    <input type="text" name="refreshCron" id="refreshCron" required />
    <button type="submit">Submit</button>
  `;

  document.getElementsByTagName("article")[0].appendChild(form);
}

module.exports = {
  createSaveCardDialog,
};
