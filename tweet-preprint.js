const { getPreprints } = require("./rxivist");
const { getTweets } = require("./twitter");

// script to find latest *Rxiv preprints and tweet them out

// main script
async function tweetPreprint() {
  // get preprints
  console.log("Fetching preprints");
  let preprints = await getPreprints();
  if (!preprints.length) throw new Error("Couldn't get preprints");
  console.log(`${preprints.length} preprints found`);

  // get list of previous tweet texts
  const tweets = await getTweets();
  if (tweets instanceof Error) throw tweets;

  // select preprint
  const selected = await selectPreprint(preprints, tweets);
  if (!selected) throw new Error("Couldn't select preprint");

  // make tweet status
  const status = makeTweet(selected);
  console.log("\n\n" + status + "\n\n");

  // send tweet
  console.log("Sending tweet");
  const result = await sendTweet(status);
  if (result instanceof Error) throw result;
  console.log(result);
}

// find preprint to tweet
async function selectPreprint(preprints, tweets) {
  // go through subset of preprints
  for (const preprint of preprints) {
    console.log(`Checking preprint ${preprint.doi}`);

    // isn't a repeat
    if (isRepeatTweet(preprint, tweets)) {
      console.log("Is a repeat tweet");
      continue;
    }

    // is in pss
    if (!(await getNeighbors(doi))) {
      console.log("Has no results in Preprint Similarity Search");
      continue;
    }

    return preprint;
  }
}

// make the actual tweet text
function makeTweet({ doi, title, author, url, category, repo }) {
  // current tweet char limit minus safety padding for unknown edge cases
  const totalLimit = 280 - 5;

  // preprint similarity search link
  const link = getLink(doi);

  // message template
  let message = [
    `🔥 ${category} preprint on ${repo} by ${author}:`,
    ``,
    `📜 ${title}`,
    `${url}`,
    ``,
    `🗺️ See similar papers in the ${repo} landscape:`,
    `${link}`,
  ];
  message = message.join("\n");

  // reliably calculate tweet length
  // (accounts for link shortening, emojis, non-english chars, etc)
  const length = tweetLength(message);

  // truncate title to fit in char limit
  if (length > totalLimit) {
    const shortTitle = title.slice(0, -(length - totalLimit + 3)) + "...";
    message = message.replace(title, shortTitle);
  }

  return message;
}

// run script
try {
  tweetPreprint();
} catch (error) {
  console.error(error);
  process.exit(1);
}
