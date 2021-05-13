const { runBot } = require("./bot");
const { error } = require("./util");

runBot("preprint").catch((message) => {
  error(message);
  process.exit(1);
});
