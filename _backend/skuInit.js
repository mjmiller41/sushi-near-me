const { upsertPlacesApiSkuData } = require("./lib/db");
const { readObjectFromFile, saveObjectToFile } = require("./lib/fileIO");
const { Sku } = require("./lib/Sku");

async function run() {
  const skuObjs = await readObjectFromFile("MAR_2025_costs.json");

  const skus = [];
  for (const skuObj of skuObjs) {
    const sku = new Sku(skuObj);
    skus.push(sku);
  }
  await upsertPlacesApiSkuData(skus);
}

run();
