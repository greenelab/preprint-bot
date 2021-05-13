const { writeFileSync, readFileSync } = require("fs");
const { stringify, parse } = require("yaml");

// log file
const logFile = "log.yaml";

// load previous runs of bot from log file
async function loadLog() {
  const file = readFileSync(logFile, { encoding: "utf8" });
  const data = parse(file);
  return data;
}

// save this run of bot to log file
function saveLog({ preprint, comment, tweets }, log = []) {
  log.push({
    preprint: cleanPreprint(preprint),
    comment: cleanComment(comment),
    tweets: cleanTweets(tweets),
  });

  writeFileSync(logFile, stringify(log), () => null, { encoding: "utf8" });
}

// keep only useful props from preprint data
const cleanPreprint = (preprint) => {
  for (const authorIndex of Object.keys(preprint.authors)) {
    delete preprint?.authors[authorIndex]?.id;
    delete preprint?.authors[authorIndex]?.institution;
  }
  delete preprint?.ranks;
  delete preprint?.publication;

  return preprint;
};

// keep only useful props from comment data
const cleanComment = (comment) => {
  delete comment?.editableUntil;
  delete comment?.message;
  delete comment?.author?.disable3rdPartyTrackers;
  delete comment?.author?.joinedAt;
  delete comment?.author?.isPrivate;
  delete comment?.author?.signedUrl;
  delete comment?.author?.isPrimary;
  delete comment?.author?.isAnonymous;
  delete comment?.author?.avatar;
  delete comment?.media;
  delete comment?.isSpam;
  delete comment?.isDeletedByAuthor;
  delete comment?.isHighlighted;
  delete comment?.parent;
  delete comment?.isDeleted;
  delete comment?.isFlagged;
  delete comment?.isAtFlagLimit;
  delete comment?.canVote;
  delete comment?.moderationLabels;
  delete comment?.isEdited;
  delete comment?.sb;

  return comment;
};

// keep only useful props from tweets data
const cleanTweets = (tweets) => {
  for (const tweetIndex of Object.keys(tweets)) {
    delete tweets[tweetIndex]?.entities?.hashtags;
    delete tweets[tweetIndex]?.entities?.symbols;
    delete tweets[tweetIndex]?.entities?.user_mentions;
    for (const urlIndex of Object.keys(tweets[tweetIndex]?.entities?.urls)) {
      delete tweets[tweetIndex]?.entities?.urls[urlIndex]?.expanded_url;
      delete tweets[tweetIndex]?.entities?.urls[urlIndex]?.display_url;
      delete tweets[tweetIndex]?.entities?.urls[urlIndex]?.indices;
    }
    delete tweets[tweetIndex]?.source;
    delete tweets[tweetIndex]?.user;
    delete tweets[tweetIndex]?.geo;
    delete tweets[tweetIndex]?.coordinates;
    delete tweets[tweetIndex]?.place;
    delete tweets[tweetIndex]?.contributors;
    delete tweets[tweetIndex]?.is_quote_status;
    delete tweets[tweetIndex]?.retweet_count;
    delete tweets[tweetIndex]?.favorite_count;
    delete tweets[tweetIndex]?.favorited;
    delete tweets[tweetIndex]?.retweeted;
    delete tweets[tweetIndex]?.possibly_sensitive;
    delete tweets[tweetIndex]?.lang;
    delete tweets[tweetIndex]?._headers;
  }

  return tweets;
};

module.exports = { loadLog, saveLog };
