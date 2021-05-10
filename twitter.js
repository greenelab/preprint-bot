const Twitter = require("twitter-lite");
const TwitterText = require("twitter-text");
const {
  consumer_key,
  consumer_secret,
  access_token_key,
  access_token_secret,
} = require("./keys");
const clipboardy = require("clipboardy");

// bot Twitter account
const handle = "@preprintbot";

// create twitter api client
client = new Twitter({
  consumer_key,
  consumer_secret,
  access_token_key,
  access_token_secret,
});

// get tweets already posted to account
async function getTweets() {
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

// reliably calculate tweet length
// (accounts for link shortening, emojis, non-english chars, etc)
function tweetLength(message) {
  return TwitterText.parseTweet(message).weightedLength;
}

// publish tweet
async function sendTweet(message) {
  if (process.env.NODE_ENV.trim() === "test") {
    // copy tweet to clipboard for more accurate testing on twitter.com
    clipboardy.writeSync(message);
    return "In test mode. Tweet copied to clipboard instead of sending.";
  } else {
    try {
      // send tweet
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
}

// handle api error catch
// https://github.com/draftbit/twitter-lite#api-errors
function apiCatch({ errors }) {
  let message;
  // API error
  if (errors) message = errors.map((error) => error.message).join(" | ");
  // other error (network problem, invalid JSON, etc)
  else message = "Non-api error sending tweet.";
  // return error message
  return new Error(message);
}

module.exports = { getTweets, isRepeatTweet, tweetLength, sendTweet };
