const { runBot } = require("./bot.js");

// run bot script and catch all errors
runBot().catch((error) => {
  console.error(error);
  process.exit(1);
});
