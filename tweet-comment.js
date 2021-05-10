const { getComments, getDoi } = require("./disqus");

// script to find a recent bio/medrxiv comment and tweet it out
async function tweetComment() {
  // get comments
  console.log("Fetching comments");
  let comments = await getComments();
  if (!comments.length) throw new Error("Couldn't get comments");
  console.log(`${comments.length} comments found`);

  // get list of previous tweet texts
  console.log("Fetching previous tweets");
  const tweets = await getTweets();
  if (tweets instanceof Error) throw tweets;

  // select comment
  let selected = await selectComment(comments, tweets);
  if (!selected) throw new Error("Couldn't select comment");

  // get doi of preprint on page
  const doi = await getDoi(selected.thread);
  selected = { ...selected, doi };

  // make tweet status message
  const tweet = makeTweet(selected);
  console.log("\n\n" + tweet + "\n\n");

  // send tweet
  console.log("Sending tweet");
  const result = await sendTweet(tweet);
  if (result instanceof Error) throw result;
  console.log(result);
}

// find comment to tweet
async function selectComment(comments, tweets) {
  // go through comments until we find one acceptable
  for (const comment of comments) {
    console.log(`Checking comment ${comment.message.substr(0, 100)}`);

    // check that comment isn't a repeat tweet
    if (isRepeatTweet(comment, tweets)) {
      console.log("Is a repeat tweet");
      continue;
    }

    // check that comment returns results in pss
    if (!(await getNeighbors(comment.doi))) {
      console.log("Has no results in Comment Similarity Search");
      continue;
    }

    return comment;
  }
}

// run script
tweetComment().catch((error) => {
  console.error(error);
  process.exit(1);
});
