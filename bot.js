// imports
const Twitter = require("twitter-lite");
const TwitterText = require("twitter-text");
const fetch = require("node-fetch");
const keys = require("./keys.js");

// urls
const rxivist = "https://api.rxivist.org/v1/papers"; // rxivist api for getting metadata about preprints submitted to biorxiv/medrxiv
const pssServer = "https://api-pss.greenelab.com/doi/"; // Preprint Similarity Search backend server
const pssApp = "https://greenelab.github.io/preprint-similarity-search/?doi="; // Preprint Similarity Search frontend/app url
const handle = "@preprintbot"; // bot Twitter account

// globals
let client;

// main script
async function runBot() {
  // create twitter api client
  for (const [key, value] of Object.entries(keys))
    console.log(key, `"...${value.slice(-4)}"`);
  client = new Twitter(keys);

  // get preprints
  console.log("Fetching preprints");
  let preprints = await getPreprints();
  if (!preprints.length) throw new Error("Couldn't get preprints");
  console.log(`${preprints.length} preprints found`);

  // get list of previous tweet texts
  const posts = await getPosts();
  if (posts instanceof Error) throw posts;

  // select preprint
  const selected = await selectPreprint(preprints, posts);
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
exports.runBot = runBot;

// get subset of recent preprints to choose from
async function getPreprints() {
  try {
    return (await (await fetch(rxivist)).json()).results.slice(0, 20) || [];
  } catch (error) {
    return [];
  }
}

// select notable preprint out of subset
async function selectPreprint(preprints, posts) {
  // go through subset of preprints
  for (const preprint of preprints) {
    console.log(`Checking preprint ${preprint.doi}`);

    // get props
    const {
      doi,
      title,
      authors = [],
      biorxiv_url,
      medrxiv_url,
      url: rxivist_url,
      category,
      repo,
    } = preprint;

    // get clean props
    const url = biorxiv_url || medrxiv_url || rxivist_url;
    const author = (authors[0] || {}).name;

    // has all props
    if (!doi || !title || !url || !author || !category || !repo) {
      console.log("Missing properties");
      continue;
    }

    // isn't a repeat
    if (isRepeat(preprint, posts)) {
      console.log("Is a repeat");
      continue;
    }

    // is in pss
    const inPss = await getNeighbors(doi);

    // return only needed props
    return { doi, title, author, url, category, repo, inPss };
  }
}

// get tweets already posted to account
async function getPosts() {
  try {
    return (
      await client.get("statuses/user_timeline", {
        screen_name: handle,
        tweet_mode: "extended",
      })
    ).map((post) => post.full_text);
  } catch (error) {
    return apiCatch(error);
  }
}

// check if preprint has already been tweeted
function isRepeat({ title }, posts) {
  for (const post of posts) {
    // check for exact title match
    if (post.includes(title)) return true;

    // check for truncated title match
    if (post.includes("..."))
      for (let chars = 1; chars < title.length; chars++)
        if (post.includes(title.slice(0, -chars) + "...")) return true;
  }
  return false;
}

// get # of neighbors preprint has in Preprint Similarity Search
async function getNeighbors(doi) {
  try {
    return (
      (await (await fetch(pssServer + doi)).json()).paper_neighbors.length || 0
    );
  } catch (error) {
    return 0;
  }
}

// make the actual tweet text
function makeTweet({ doi, title, author, url, category, repo, inPss }) {
  // current tweet char limit minus safety padding for unknown edge cases
  const totalLimit = 280 - 5;

  // truncate author
  author = author.split(/\s/);
  const last = author.pop();
  author = author
    .map((part) => part.charAt(0) + ".")
    .concat(last)
    .join(" ");

  // capitalize *Rxiv properly -_-
  repo = repo.replace(/(.*)(r)(xiv)/g, "$1R$3");

  // preprint similarity search link
  const link = pssApp + doi;

  // message template
  let message = [
    `🔥 A hot ${category} preprint on ${repo} by ${author} et al:`,
    ``,
    `📜 ${title}`,
    `${url}`,
  ];
  if (inPss)
    message = message.concat([
      ``,
      `🗺️ See similar papers in the ${repo} landscape:`,
      `${link}`,
    ]);
  message = message.join("\n");

  // reliably calculate tweet length
  // (accounts for link shortening, emojis, non-english chars, etc)
  const length = TwitterText.parseTweet(message).weightedLength;

  // truncate title to fit in char limit
  if (length > totalLimit) {
    const shortTitle = title.slice(0, -(length - totalLimit + 3)) + "...";
    message = message.replace(title, shortTitle);
  }

  return message;
}
exports.makeTweet = makeTweet;

// publish tweet
async function sendTweet(status) {
  try {
    const response = await client.post("statuses/update", { status });

    // get clean props
    const date = response.created_at;
    const url = response.entities.urls[0].url;

    // return success message
    return `Posted at ${url} on ${date}`;
  } catch (error) {
    return apiCatch(error);
  }
}

// handle api error catch
function apiCatch({ errors }) {
  // https://github.com/draftbit/twitter-lite#api-errors
  let message;
  // API error
  if (errors) message = errors.map((error) => error.message).join(" | ");
  // other error (network problem, invalid JSON, etc)
  else message = "Non-api error sending tweet.";
  // return error message
  return new Error(message);
}
