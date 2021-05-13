const fetch = require("node-fetch");
const { getPreprint } = require("./rxivist");
const { disqus_api_key } = require("./keys");

// disqus apis
const postsApi = "https://disqus.com/api/3.0/forums/listPosts";
const detailsApi = "https://disqus.com/api/3.0/threads/details";

// disqus "forum" names for bio/medrxiv
const forums = ["biorxivstage", "medrxiv"];

// get list of comments on bio/medrxiv and their associated preprints
async function getComments() {
  try {
    let comments = [];
    for (const forum of forums) {
      // set search params
      const params = new URLSearchParams();
      params.set("api_key", disqus_api_key);
      params.set("forum", forum);

      // get first handful of comments
      const response =
        (await (await fetch(postsApi + "?" + params.toString())).json())
          .response || [];
      comments = comments.concat(response);
    }

    // get associated preprint details for each comment
    comments = (
      await Promise.all(
        comments.map(async (comment) => {
          const doi = await getDoi(comment.thread);
          const preprint = await getPreprint(doi);
          if (comment && preprint) return { comment, preprint };
        })
      )
    ).filter((entry) => entry);

    return comments;
  } catch (error) {
    return null;
  }
}

// get preprint doi from comment thread
async function getDoi(thread) {
  // set search params
  const params = new URLSearchParams();
  params.set("api_key", disqus_api_key);
  params.set("thread", thread);

  // get link of post
  const response =
    (await (await fetch(detailsApi + "?" + params.toString())).json())
      .response || [];
  const link = response.link;

  // get doi from url
  return cleanDoi(link);
}

// remove everything before first number, eg "doi:"
// remove version at end, eg "v4"
const cleanDoi = (query) =>
  query.replace(/^\D*/g, "").replace(/v\d+$/g, "").trim();

module.exports = { getComments, getDoi };
