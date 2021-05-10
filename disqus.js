const fetch = require("node-fetch");
const fetchMeta = require("url-metadata");
const { disqus_api_key } = require("./keys");

// disqus apis
const postsApi = "https://disqus.com/api/3.0/forums/listPosts";
const detailsApi = "https://disqus.com/api/3.0/threads/details";

// disqus "forum" names for bio/medrxiv
const forums = ["biorxivstage", "medrxiv"];

// get list of comments on bio/medrxiv
async function getComments() {
  try {
    let comments = [];
    for (const forum of forums) {
      // set search params
      const params = new URLSearchParams();
      params.set("api_key", disqus_api_key);
      params.set("forum", forum);
      params.set("limit", 100);

      // get first handful of posts
      comments = comments.concat(
        (await (await fetch(postsApi + "?" + params.toString())).json())
          .response || []
      );
    }
    return comments.map((comment) => {
      const { thread, raw_message: message, createdAt: date, likes } = comment;

      return { thread, message, date, likes };
    });
  } catch (message) {
    return new Error(message);
  }
}

// get preprint doi from comment link
async function getDoi(thread) {
  // set search params
  const params = new URLSearchParams();
  params.set("api_key", disqus_api_key);
  params.set("thread", thread);

  // get link of post
  const comment =
    (await (await fetch(detailsApi + "?" + params.toString())).json())
      .response || [];
  const link = comment.link;

  // get doi from url
  return cleanDoi(link);
}

// remove everything before first number, eg "doi:"
// remove version at end, eg "v4"
const cleanDoi = (query) =>
  query.replace(/^\D*/g, "").replace(/v\d+$/g, "").trim();

module.exports = { getComments, getDoi };
