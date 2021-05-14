const { runBot } = require("./bot");
const { error } = require("./util");

runBot("comment").catch((message) => {
  error(message);
  process.exit(1);
});
