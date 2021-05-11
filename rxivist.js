const fetch = require("node-fetch");

// rxivist api for getting metadata about preprints submitted to bio/medrxiv
const api = "https://api.rxivist.org/v1/papers";

// get list of recent preprints from bio/medrxiv
async function getPreprints() {
  try {
    const response = (await (await fetch(api)).json()).results;
    return (
      response
        // get only subset of most recent
        .slice(0, 100)
        // clean preprint props
        .map(cleanPreprint)
        // remove any preprints missing a doi, title, etc
        .filter((preprint) => Object.values(preprint).every((value) => value))
    );
  } catch (error) {
    return [];
  }
}

// lookup details for specific doi
async function getPreprint(doi) {
  try {
    const response = await (await fetch(api + "/" + doi)).json();
    return cleanPreprint(response);
  } catch (error) {
    return {};
  }
}

// clean field names from rxvist api and keep only needed props
function cleanPreprint(preprint) {
  let {
    doi,
    title,
    authors = [],
    biorxiv_url,
    medrxiv_url,
    url: rxivist_url,
    category,
    repo: journal,
  } = preprint;

  // main url
  const url = biorxiv_url || medrxiv_url || rxivist_url;

  // first author initials and last name, et al
  let author =
    (authors[0] || {}).name
      .split(/\s/)
      .filter((part) => part)
      .map((part, index, parts) =>
        index < parts.length - 1 ? part.charAt(0) + "." : part
      )
      .join(" ") + " et al";

  // capitalize category
  category = category[0].toUpperCase() + category.substr(1);

  // capitalize rxiv properly
  journal = journal.replace(/(.*)(r)(xiv)/g, "$1R$3");

  return { doi, title, author, url, category, journal };
}

module.exports = { getPreprints, getPreprint };
