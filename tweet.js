const { getPreprints: fromDisqus } = require("./disqus");
const { getPreprints: fromRxivist } = require("./rxivist");
const { getNeighbors, getLink } = require("./pss");
const { getTweets, tweetLength, sendTweet } = require("./twitter");
const sort = require("array-sort");

//  find a recent bio/medrxiv preprint or preprint and tweet it out
async function runBot(type = "preprint") {
  // get preprints
  console.log("Fetching preprints");
  let preprints = type === "comment" ? await fromDisqus() : await fromRxivist();
  if (!preprints.length) throw new Error("Couldn't get preprints");
  console.log(`${preprints.length} preprints found`);

  // get list of previous tweet texts
  console.log("Fetching previous tweets");
  const tweets = await getTweets();
  if (tweets instanceof Error) throw tweets;

  // select preprint
  let selected = await selectPreprint(preprints, tweets);
  if (!selected) throw new Error("Couldn't select preprint");

  // make tweet status message
  const tweet = makeTweet(selected);
  console.log("\n\n" + tweet + "\n\n");

  // send tweet
  console.log("Sending tweet");
  const result = await sendTweet(tweet);
  if (result instanceof Error) throw result;
  console.log(result);
}

// find preprint to tweet
async function selectPreprint(preprints, tweets) {
  // sort preprints by date and upvotes on associated comment
  preprints = sort(preprints, ["likes", "date"], { reverse: true });

  // go through preprints until we find one acceptable
  for (const preprint of preprints) {
    console.log(`Checking preprint ${preprint.doi}`);

    // check that preprint isn't a repeat tweet
    if (isRepeatTweet(preprint.title, tweets)) {
      console.log("Is a repeat tweet");
      continue;
    }

    // check that preprint returns results in pss
    if (!(await getNeighbors(preprint.doi))) {
      console.log("Has no results in Preprint Similarity Search");
      continue;
    }

    return preprint;
  }
}

// check tweet has already been tweeted
function isRepeatTweet(text, tweets) {
  for (const tweet of tweets) {
    // check for exact text match
    if (tweet.includes(text)) return true;

    // check for truncated text match
    if (tweet.includes("..."))
      for (let chars = 1; chars < text.length; chars++)
        if (tweet.includes(text.slice(0, -chars) + "...")) return true;
  }
  return false;
}

// make the actual tweet text
function makeTweet({ doi, title, author, url, category, journal, message }) {
  // preprint similarity search link
  const link = getLink(doi);

  if (message) {
    // status template for tweeting comment
    let status = [
      `💬 New comment on "${title.slice(0, 20)}..." on ${journal}`,
      ``,
      `"${message}"`,
      ``,zc
      `🗺️ See similar papers:`,
      `${link}`,
    ].join("\n");
    return compressTweet(status, message);
  } else {
    // status template for tweeting preprint
    let status = [
      `🔥 ${category} preprint on ${journal}`,
      ``,
      `"${title}" by ${author}`,
      `${url}`,
      ``,
      `🗺️ See similar papers:`,
      `${link}`,
    ].join("\n");
    return compressTweet(status, title);
  }
}

// compress tweet status by truncating specified substring in it
const compressTweet = (status, substring) => {
  // current tweet char limit minus safety padding for unknown edge cases
  const totalLimit = 280 - 5;

  // reliably calculate tweet length
  // (accounts for link shortening, emojis, non-english chars, etc)
  const length = tweetLength(status);

  // truncate text to fit in char limit
  if (length > totalLimit) {
    const short = substring.slice(0, -(length - totalLimit + 3)) + "...";
    status = status.replace(substring, short);
  }

  return status;
};

module.exports = { runBot };
