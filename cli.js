#!/usr/bin/env node

const chalk = require("chalk");
const lib = require("./lib");

main();

async function main() {
  const products = await lib.getProducts();
  for (const product of products) {
    const colorFn = product.soldOut ? chalk.bold.red : chalk.bold;
    const soldOut = product.soldOut ? `-- ${chalk.bold.red("SOLD OUT")}` : "";
    console.log(`${colorFn(product.name)} ${chalk.gray(product.subHeading)} ${soldOut}`);
  }
}
