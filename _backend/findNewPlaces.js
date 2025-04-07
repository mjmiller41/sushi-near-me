const {
  initDb,
  getZipCoordinates,
  updateSearchHistory,
  upsertPlace,
  getExistingPlace,
  getSkuData,
} = require("./lib/db");
const { Sku, DEFAULT_PLACES_API_SKU_DATA, checkApiCostLimit } = require("./lib/Sku");
const { Place } = require("./lib/Place");
const { getPlaceIds, getPlaceDetails } = require("./lib/google");
const { logRequest, logSummary } = require("./lib/logger");
const { config } = require("./lib/config");

async function run() {
  await initDb();
  const currentSkuData = await getCurrentSkuData();
  console.log(`Sku data retrieved from db.`);
  checkApiCostLimit(currentSkuData);

  const coords = await getZipCoordinates(config.updateInterval);
  console.log(`Processing ${coords.length} unique coordinates`);

  // Get place IDs by zip code
  let uniqueIds = [];
  let totalPlacesFound = 0;
  for (const { latitude, longitude, zip_codes } of coords) {
    const { placeIds, request_count } = await getPlaceIds(
      config.searchRadius,
      latitude,
      longitude
    ).catch((error) => console.error(error));

    currentSkuData["635D-A9DD-C520"].increment(request_count);
    checkApiCostLimit(currentSkuData);

    await logRequest(
      "635D-A9DD-C520",
      request_count,
      `${placeIds?.length ?? 0} places found @Lat: ${latitude}, Lng: ${longitude}`
    );

    const uniqueZips = [...new Set(zip_codes)];
    await updateSearchHistory(latitude, longitude, uniqueZips);

    uniqueIds = uniqueIds.concat([...new Set(placeIds)]);
    totalPlacesFound += placeIds.length;
    if (uniqueIds.length >= config.placesLimit) break;
  }

  console.log(`${uniqueIds.length} unique IDs found.`);
  uniqueIds = uniqueIds.slice(0, 1);

  let getPlaceDetailsCount = 0;
  for (const id of uniqueIds) {
    const { rows } = await getExistingPlace(id, config.updateInterval);
    if (rows && rows.length > 0) {
      // Record exists and is recent; skip getPlaceDetails
      console.log(
        `Skipping Place ID ${id} - updated recently at ${rows[0].updated_at}`
      );
      continue; // Skip to the next placeId
    }

    // Fetch details if no recent record exists
    const placeDetailsSkuData = Object.values(currentSkuData).filter(
      (data) => data.func === "Place Details"
    );
    // Sort asc. by cost level ensures highest cost sku listed last.
    placeDetailsSkuData.sort((a, b) => a.cost_level - b.cost_level);

    // Filter out skus where free limit hit
    // Store highest cost level sku in currentSku
    let sku = "";
    const fields = placeDetailsSkuData.reduce((fields, skuData) => {
      if (!skuData.free_limit_hit) {
        sku = skuData.sku;
        fields = fields.concat(skuData.fields);
      }
      return fields;
    }, []);

    const data = await getPlaceDetails(id, fields.join(","));
    let place;
    if (data) {
      place = new Place(data);
      currentSkuData[sku].increment();
      getPlaceDetailsCount++;
    } else continue;

    await logRequest(sku, 1, `Place ID: ${id}`);

    await upsertPlace(place);
    if (config.limitPlaces && getPlaceDetailsCount >= config.placesLimit) break;
  }

  console.log(
    `${totalPlacesFound} total places returned.`,
    `${uniqueIds.length} unique place IDs found.`,
    `${getPlaceDetailsCount} places queried and inserted/updated.`
  );

  await logSummary(currentSkuData);
  console.log("Done!");
}

run().catch(console.error);
