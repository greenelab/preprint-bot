const fetch = require("node-fetch");

// backend server
const server = "https://api-pss.greenelab.com/doi/";
// frontend/app url
const app = "https://greenelab.github.io/preprint-similarity-search/?doi=";

// get # of neighbors preprint has
async function getNeighbors(doi) {
  try {
    const response = await (await fetch(server + doi)).json();
    return response.paper_neighbors.length || 0;
  } catch (error) {
    return 0;
  }
}

// get link to preprint in app
function getLink(doi) {
  return app + doi;
}

module.exports = { getNeighbors, getLink };
