const dataGitUrl = "https://github.com/PokemonTCG/pokemon-tcg-data";

const { execSync } = require("child_process");

execSync(`git clone ${dataGitUrl}`);

const sets = require("../pokemon-tcg-data/sets/en.json");

const fs = require("fs");

// Save listing of sets into sets.json
fs.writeFileSync(
  "./data/sets.json",
  JSON.stringify(
    sets.map((set) => {
      return {
        name: set.name,
        description: `${set.id} (released ${set.releaseDate})`,
        value: set.id,
      };
    })
  )
);

const setsPaths = fs.readdirSync("./pokemon-tcg-data/cards/en/");

fs.mkdirSync("./data/sets", { recursive: true });

// For each set save the set listing as a unique json file filtered down
for (let setPath of setsPaths) {
  const set = require(`../pokemon-tcg-data/cards/en/${setPath}`);

  if (setPath.startsWith("sv")) {
    categorizeSVCards(setPath, set);
  } else {
    const setLen = set.length;

    const cardSetStd = set.map((card) => {
      return {
        name: `${card.name} (${card.number}/${setLen})`,
        rarity: card.rarity,
        supertype: card.supertype,
        value: card.id,
      };
    });

    fs.writeFileSync(`./data/sets/${setPath}`, JSON.stringify(cardSetStd));
  }
}

fs.rmSync("pokemon-tcg-data", { recursive: true });

/**
 * Categorize cards from the Scarlet and Violet era per set based upon card type & rarity
 * @param {string} setPath
 * @param {Object} set
 */
function categorizeSVCards(setPath, set) {
  const setLen = set.length;

  let groups;

  if (setPath.includes("sv4pt5")) {
    // Paldean Fates - has a few extra groups due to the baby shiny cards
    groups = [
      "supertype:Pokémon",
      "supertype:Trainer+Energy",
      "rarity:Shiny Rare",
      "rarity:Shiny Ultra Rare",
      "rarity:Illustration Rare",
      "rarity:Ultra Rare",
      "rarity:Special Illustration Rare",
      "rarity:Hyper Rare",
    ];
  } else if (setPath.includes("svp")) {
    // Promo meta-set. Only has promo rarity
    groups = ["rarity:Promo"];
  } else if (setPath.includes("sve")) {
    // energy meta-set. Only has energy supertype
    groups = ["supertype:Energy"];
  } else {
    groups = [
      "supertype:Pokémon",
      "supertype:Trainer+Energy",
      "rarity:Illustration Rare",
      "rarity:Ultra Rare",
      "rarity:Special Illustration Rare",
      "rarity:Hyper Rare",
    ];
  }

  let cardSetGrouped = [];

  for (const g of groups) {
    cardSetGrouped.push({
      type: g.split(":")[1],
      cards: [],
    });
  }

  let i = 0;

  set.forEach((card) => {
    let filteredCard = {
      name: `${card.name} (${card.number}/${setLen})`,
      rarity: card.rarity,
      supertype: card.supertype,
      value: card.id,
    };

    let [currentParam, currentVal] = groups[i].split(":");
    if (currentParam == "supertype") {
      if (currentVal.includes(card.supertype)) {
        cardSetGrouped[i].cards.push(filteredCard);
      } else {
        i++;
        cardSetGrouped[i].cards.push(filteredCard);
      }
    } else if (currentParam == "rarity") {
      if (currentVal == card.rarity) {
        cardSetGrouped[i].cards.push(filteredCard);
      } else {
        i++;
        cardSetGrouped[i].cards.push(filteredCard);
      }
    }
  });

  fs.writeFileSync(`./data/sets/${setPath}`, JSON.stringify(cardSetGrouped));
}
