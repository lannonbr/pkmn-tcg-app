const { Octokit } = require("@octokit/rest");
const dayjs = require("dayjs");

async function run() {
  const today = dayjs();

  const client = new Octokit({
    auth: process.env.GITHUB_TOKEN,
  });

  const versions =
    await client.packages.getAllPackageVersionsForPackageOwnedByAuthenticatedUser(
      {
        package_type: "container",
        package_name: "pkmn-tcg-app",
      }
    );

  let versionsRemoved = 0;

  for (const version of versions.data) {
    // delete untagged versions that are older than 7 days
    if (
      today.diff(dayjs(version.created_at), "days") > 7 &&
      version.metadata.container.tags.length === 0
    ) {
      await client.packages.deletePackageVersionForAuthenticatedUser({
        package_type: "container",
        package_name: "pkmn-tcg-app",
        package_version_id: version.id,
      });
      versionsRemoved++;
    }
  }

  console.log(`Image versions pruned: ${versionsRemoved}`);
}

run();
