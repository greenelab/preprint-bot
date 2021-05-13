const Twitter = require("twitter-lite");
const TwitterText = require("twitter-text");
const {
  consumer_key,
  consumer_secret,
  access_token_key,
  access_token_secret,
  node_env,
} = require("./keys");
const clipboardy = require("clipboardy");

// create twitter api client
client = new Twitter({
  consumer_key,
  consumer_secret,
  access_token_key,
  access_token_secret,
});

// reliably calculate tweet length
// (accounts for link shortening, emojis, non-english chars, etc)
function tweetLength(message) {
  return TwitterText.parseTweet(message).weightedLength;
}

// publish tweet statuses
async function sendTweets(statuses) {
  if (node_env === "test") {
    // copy tweet to clipboard for more accurate testing on twitter.com
    clipboardy.writeSync(statuses.join("\n\nREPLY\n\n"));
    return new Error(
      "In test mode. Tweet copied to clipboard instead of sending."
    );
  } else {
    try {
      let responses = [];
      let in_reply_to_status_id = "";

      for (const status of statuses) {
        // send tweet
        const response = await client.post("statuses/update", {
          status,
          in_reply_to_status_id,
        });

        // collect all responses
        responses.push(response);

        // get id of posted tweet
        in_reply_to_status_id = response.id_str;
      }

      return responses;
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

module.exports = { tweetLength, sendTweets };
