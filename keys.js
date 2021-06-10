require("dotenv").config();

// twitter api keys
const consumer_key = process.env.CONSUMER_KEY || "";
const consumer_secret = process.env.CONSUMER_SECRET || "";
const access_token_key = process.env.ACCESS_TOKEN_KEY || "";
const access_token_secret = process.env.ACCESS_TOKEN_SECRET || "";

// disqus api keys
const disqus_api_key = process.env.DISQUS_API_KEY || "";

// other
const node_env = process.env.NODE_ENV || "";

// collect keys
const keys = {
  consumer_key,
  consumer_secret,
  access_token_key,
  access_token_secret,
  disqus_api_key,
  node_env,
};

// log keys
for (let [key, value] of Object.entries(keys)) {
  value = value.trim();
  keys[key] = value;
  console.log(`${key}: ${value ? `"...${value.slice(-4)}"` : `""`}`);
}

module.exports = keys;
