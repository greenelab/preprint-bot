const { runBot } = require("./tweet");

runBot("comment").catch((error) => {
  console.error(error);
  process.exit(1);
});
