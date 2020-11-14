const axios = require("axios");
const cheerio = require("cheerio");

const BASE_URL = process.env.BASE_URL || "https://row7seeds.com/";

const client = axios.create({
  baseURL: BASE_URL,
});

module.exports = {
  BASE_URL,
  getProducts,
  getProduct
};

async function getProducts() {
  const $ = await $getPage("/collections/seeds/");

  const products = $(".products .product")
    .map((idx, el) => {
      const href = $("a", el).attr("href");
      const name = $(".product__info .product__name", el)
        .text()
        .trim()
        // Condense whitespace
        .replace(/\s+/g, " ");
      return {
        href: new URL(href, BASE_URL).href,
        name,
      };
    })
    .get()
    .sort((a, b) => String(a.name).localeCompare(b.name))
    .map(async product => getProduct(product.href, product));
  
  return Promise.all(products);
}

async function getProduct(href, data={}) {
  const $ = await $getPage(href);

  const soldOut = !!$("button.js-waitlist__button").length;
  const [subHeading, breeder] = $(".pdp__info__subheading")
    .html()
    .trim()
    .toUpperCase()
    .split("<BR>")
    .map((item) => item.trim())
    .filter(Boolean);

  return {
    ...data,
    subHeading,
    breeder: breeder.replace(/^BREEDER:\s+/, "").trim(),
    hybrid: subHeading.includes("HYBRID"),
    openPollinated: subHeading.includes("OPEN POLLINATED"),
    experimental: data.name?.toUpperCase().includes("EXPERIMENTAL"),
    soldOut,
  };
}

async function $getPage(href) {
  const res = await client.get(href);
  return cheerio.load(res.data);
}
