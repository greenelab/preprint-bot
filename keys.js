require("dotenv").config();

// twitter api keys
const consumer_key = process.env.CONSUMER_KEY || "";
const consumer_secret = process.env.CONSUMER_SECRET || "";
const access_token_key = process.env.ACCESS_TOKEN_KEY || "";
const access_token_secret = process.env.ACCESS_TOKEN_SECRET || "";

// disqus api keys
const disqus_api_key = process.env.DISQUS_API_KEY || "";

const keys = {
  consumer_key,
  consumer_secret,
  access_token_key,
  access_token_secret,
  disqus_api_key,
};

// log keys
for (const [key, value] of Object.entries(keys))
  console.log(`${key}: ${value.trim() ? `"...${value.slice(-4)}"` : `""`}`);

module.exports = keys;
