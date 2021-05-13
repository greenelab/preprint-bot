const { getComments } = require("./disqus");
const { getPreprints } = require("./rxivist");
const { tweetLength, sendTweets } = require("./twitter");
const sort = require("array-sort");
const { log, success, info } = require("./util");

//  find a recent bio/medrxiv preprint or preprint and tweet it out
async function runBot(type = "preprint") {
  // get preprints
  log("");
  info("Fetching preprints");
  let preprints =
    type === "comment" ? await getComments() : await getPreprints();
  if (!preprints) throw new Error("Couldn't get preprints");
  success(`${preprints.length} preprints found`);

  // select preprint
  log("");
  info("Selecting preprints");
  let selected = await selectPreprint(preprints);
  if (!selected) throw new Error("Couldn't select preprint");
  log(selected);
  success(`Selected ${selected.preprint.doi}`);

  // make tweet status messages
  log("");
  info("Making statuses");
  const statuses = makeStatuses(selected);
  for (const status of statuses) success("\n" + status + "\n");

  // send tweets
  log("");
  info("Sending tweets");
  const tweets = await sendTweets(statuses);
  if (tweets instanceof Error) throw tweets;
  for (const { entities, created_at } of tweets)
    success(`Posted at ${entities.urls[0].url} on ${created_at}`);

  // save results to check for duplicates
  preprint = { ...preprint, tweets };
}

// find preprint to tweet
async function selectPreprint(preprints) {
  // sort preprints by date and upvotes on associated comment
  preprints = sort(preprints, ["comment.likes", "comment.createdAt"], {
    reverse: true,
  });

  // go through preprints until we find one acceptable
  for (const preprint of preprints) {
    log(preprint);

    // check that preprint isn't a repeat tweet
    if (isRepeat()) {
      continue;
    }

    return preprint;
  }
}

// check tweet has already been tweeted
function isRepeat(preprint) {
  return false;
}

// make actual tweet status text
function makeStatuses({ preprint = null, comment = null }) {
  // bot twitter handle
  const handle = "@PreprintBot";

  // preprint similarity search link
  const search = `https://greenelab.github.io/preprint-similarity-search/?doi=${preprint.doi}`;

  // first author initials and last name, et al
  let author =
    (preprint.authors[0] || {}).name
      .split(/\s/)
      .filter((part) => part)
      .map((part, index, parts) =>
        index < parts.length - 1 ? part.charAt(0) + "." : part
      )
      .join(" ") + " et al";

  // link to preprint on bio/medrxiv
  const url = preprint.biorxiv_url || preprint.medrxiv_url;

  // capitalize category
  const category =
    preprint.category[0].toUpperCase() + preprint.category.substr(1);

  // capitalize rxiv properly
  const repo = preprint.repo.replace(/(.*)(r)(xiv)/g, "$1R$3");

  if (comment) {
    // truncate title
    const title = preprint.title.slice(0, 30) + "...";
    const message = comment.raw_message;

    // status template for tweeting comment
    const status = [
      `💬 ${repo} comment on "${title}"`,
      ``,
      `"${message}"`,
      ``,
      `${url}`,
    ].join("\n");

    // reply status (doesn't link properly if you don't put handle)
    const reply = [
      `${handle}`,
      ``,
      `🗺️ See similar papers on the ${repo} landscape:`,
      ``,
      `${search}`,
    ].join("\n");

    return [compressStatus(status, message), reply];
  } else {
    // status template for tweeting preprint
    const status = [
      `🔥 ${repo} ${category} preprint by ${author}:`,
      ``,
      `"${title}"`,
      ``,
      `${url}`,
      ``,
      `🗺️ See similar papers:`,
      `${search}`,
    ].join("\n");

    return [compressStatus(status, title)];
  }
}

// compress tweet status by truncating specified substring in it
const compressStatus = (status, substring) => {
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
