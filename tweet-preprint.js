const { runBot } = require("./tweet");

runBot("preprint").catch((error) => {
  console.error(error);
  process.exit(1);
});
