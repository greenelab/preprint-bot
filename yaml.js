const { writeFile } = require("fs");
const { stringify } = require("yaml");

function writeYaml(data = {}, filename = "data") {
  writeFile(filename + ".yaml", stringify(data), () => null);
}

module.exports = { writeYaml };
