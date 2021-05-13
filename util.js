const chalk = require("chalk");

// loggers
const success = (message = "") => console.log(chalk.green(message));
const info = (message = "") => console.log(chalk.blue(message));
const warning = (message = "") => console.log(chalk.yellow(message));
const error = (message = "") => console.log(chalk.red(message));

module.exports = { success, info, warning, error };
