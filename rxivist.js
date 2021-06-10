const fetch = require("node-fetch");

// rxivist api for getting metadata about preprints submitted to bio/medrxiv
const api = "https://api.rxivist.org/v1/papers";

// get list of recent preprints from bio/medrxiv
async function getPreprints() {
  try {
    const response = (await (await fetch(api)).json()).results;
    return response.slice(0, 100).map((preprint) => ({ preprint }));
  } catch (error) {
    return null;
  }
}

// lookup details for specific doi
async function getPreprint(doi) {
  try {
    const response = await (await fetch(api + "/" + doi)).json();
    if (response.error) throw new Error(response.error);
    return response;
  } catch (error) {
    return null;
  }
}

module.exports = { getPreprints, getPreprint };
