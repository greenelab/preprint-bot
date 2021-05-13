const chalk = require("chalk");

// loggers
const log = console.log;
const success = (message = "") => console.log(chalk.green(message));
const info = (message = "") => console.log(chalk.blue(message));
const warning = (message = "") => console.log(chalk.yellow(message));
const error = (message = "") => console.log(chalk.red(message));

module.exports = { log, success, info, warning, error };
