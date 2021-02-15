const clipboardy = require("clipboardy");
const { makeTweet } = require("./bot.js");

// dummy tweet
const tweet = makeTweet({
  doi: "doi:10.1093/gigascience/giaa117",
  title:
    "Reaction of a bidentate ligands (4,4′-dimethyl 2,2′-bipyridine) with planar-chiral chloro-bridged ruthenium: Synthesis of cis-dicarbonyl[4,4′-dimethyl-2,2′-bipyridine- κO1,κO2]{2-[tricarbonyl(η6-phenylene- κC1)chromium]pyridine-κN}ruthenium hexafluorophosphate",
  author: "Casey S. Greene",
  url: "https://greenelab.github.io/covid19-review/",
  category: "artificial intelligence",
  repo: "biorxiv",
  inPss: true,
});

clipboardy.writeSync(tweet);

console.log(
  "Tweet copied to clipboard. Paste into new tweet on Twitter to test."
);
