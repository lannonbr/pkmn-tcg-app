const dataGitUrl = "https://github.com/PokemonTCG/pokemon-tcg-data";

const { execSync } = require("child_process");

execSync(`git clone ${dataGitUrl}`);

const sets = require("../pokemon-tcg-data/sets/en.json");

const fs = require("fs");

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

for (let setPath of setsPaths) {
  const set = require(`../pokemon-tcg-data/cards/en/${setPath}`);
  const setLen = set.length;

  fs.writeFileSync(
    `./data/sets/${setPath}`,
    JSON.stringify(
      set.map((card) => {
        return {
          name: `${card.name} (${card.number}/${setLen})`,
          value: card.id,
        };
      })
    )
  );
}

execSync("rm -rf pokemon-tcg-data");
