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
          const link = await getLink(comment.thread);
          const doi = getDoi(link);
          const preprint = await getPreprint(doi);
          comment.link = link;
          if (comment && preprint) return { comment, preprint };
        })
      )
    ).filter((entry) => entry);

    return comments;
  } catch (error) {
    return null;
  }
}

// get link of page comment is on
async function getLink(thread) {
  // set search params
  const params = new URLSearchParams();
  params.set("api_key", disqus_api_key);
  params.set("thread", thread);

  // get link of page
  const response =
    (await (await fetch(detailsApi + "?" + params.toString())).json())
      .response || [];
  return response.link;
}

// remove everything before first number, eg "doi:"
// remove version at end, eg "v4"
const getDoi = (link) => link.replace(/^\D*/g, "").replace(/v\d+$/g, "").trim();

module.exports = { getComments, getDoi };
