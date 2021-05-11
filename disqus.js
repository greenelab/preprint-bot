const fetch = require("node-fetch");
const { disqus_api_key } = require("./keys");
const { getPreprint } = require("./rxivist");

// disqus apis
const postsApi = "https://disqus.com/api/3.0/forums/listPosts";
const detailsApi = "https://disqus.com/api/3.0/threads/details";

// disqus "forum" names for bio/medrxiv
const forums = ["biorxivstage", "medrxiv"];

// get list of preprints from comments on bio/medrxiv
async function getPreprints() {
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

    // clean comments props
    comments = comments.map(
      ({ thread, raw_message: message, createdAt: date, likes }) => ({
        thread,
        message,
        date,
        likes,
      })
    );

    // get associated preprint details for each comment
    let preprints = await Promise.all(
      comments.map(async (comment) => {
        const doi = await getDoi(comment.thread);
        const preprint = await getPreprint(doi);
        return { ...comment, ...preprint };
      })
    );

    // remove any preprints missing a doi, title, etc
    preprints = preprints.filter((preprint) =>
      Object.values(preprint).every((value) => value)
    );

    return preprints;
  } catch (error) {
    return [];
  }
}

// get preprint doi from comment link
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

module.exports = { getPreprints, getDoi };
