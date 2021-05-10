const fetch = require("node-fetch");

// rxivist api for getting metadata about preprints submitted to biorxiv/medrxiv
const api = "https://api.rxivist.org/v1/papers";

// get subset of recent preprints to choose from
async function getPreprints() {
  try {
    return (
      (await (await fetch(api)).json()).results
        // get only subset of most recent
        .slice(0, 100)
        // clean field names from rxvist api and keep only needed props
        .map((preprint) => {
          let {
            doi,
            title,
            authors = [],
            biorxiv_url,
            medrxiv_url,
            url: rxivist_url,
            category,
            repo,
          } = preprint;
          // main url
          const url = biorxiv_url || medrxiv_url || rxivist_url;

          // first author initials and last name, et al
          let author =
            (authors[0] || {}).name
              .split(/\s/)
              .map((part, index, length) =>
                index < length - 1 ? part.charAt(0) + "." : part
              )
              .join(" ") + "et al";

          // capitalize category
          category = category[0].toUpperCase() + category.substr(1);

          // capitalize *Rxiv properly -_-
          repo = repo.replace(/(.*)(r)(xiv)/g, "$1R$3");

          return { doi, title, author, url, category, repo };
        })
        // remove any preprints missing a doi, title, etc
        .filter((preprint) => Object.values(preprint).every((value) => value))
    );
  } catch (error) {
    return [];
  }
}

module.exports = { getPreprints };
