const {
  upsertPlace,
  initSushiRestaurantsTable,
  upsertPlacesApiSkuData,
} = require("./lib/db");
const { readObjectFromFile, saveObjectToFile } = require("./lib/fileIO");
const { Place } = require("./lib/Place");
const { config } = require("./lib/config");
const { placesTextSearch, getPlaceDetails } = require("./lib/google");
const { calcDistance } = require("./lib/utils");
const {
  getCurrentSkuData,
  SKU_CATEGORIES,
  DEFAULT_PLACES_API_SKU_DATA,
  SKU_FUNCS,
} = require("./lib/Sku");
const stringSimilarity = require("string-similarity");
const readline = require("readline/promises");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function compareNames(name1, name2) {
  if (!name1 || !name2) {
    return 0; // Handle cases where one or both names are missing
  }

  const normalizedName1 = name1.trim().toLowerCase();
  const normalizedName2 = name2.trim().toLowerCase();

  if (normalizedName1 === normalizedName2) {
    return 1; // Exact match
  }

  // Use string similarity library for fuzzy matching
  const similarity = stringSimilarity.compareTwoStrings(
    normalizedName1,
    normalizedName2
  );
  return similarity; // Return a similarity score between 0 and 1
}

async function run() {
  const filePlaces = await readObjectFromFile("sushi_places_conflicts_2.json");
  console.log(`${filePlaces.length} places read from file.`);

  await initSushiRestaurantsTable();
  const skuData = await getCurrentSkuData();

  const textSearchIdOnlySku = skuData.find((sku) => {
    return (
      sku.func === SKU_FUNCS.TEXT_SEARCH && sku.category === SKU_CATEGORIES.ID_ONLY
    );
  });
  const placeDetailsProSku = skuData.find((sku) => {
    return sku.func === SKU_FUNCS.PLACE_DETAILS && sku.category === SKU_CATEGORIES.PRO;
  });

  const placeConflicts = [];
  let upsertCount = 0;
  filePlacesLoop: for (let { placeIds, place } of filePlaces) {
    const lat = place.latitude;
    const lng = place.longitude;
    const radiusM = 500;
    const radiusKm = radiusM / 1000;
    const textQuery = place.displayName?.text ?? place.name;
    const noIdExists = !placeIds && !place.place_id; // && !place.id;
    if (noIdExists) {
      console.log(`No Ids found for ${textQuery}`);
      // const { allPlaces, reqCount } = await placesTextSearch(
      //   [SKU_CATEGORIES.ID_ONLY],
      //   lat,
      //   lng,
      //   radiusM,
      //   textQuery
      // );
      // textSearchIdOnlySku.increment(reqCount);
      // placeIds = allPlaces ? allPlaces.map((place) => place.id) : [];
    }

    const categories = [
      SKU_CATEGORIES.ID_ONLY,
      SKU_CATEGORIES.ESSENTIALS,
      SKU_CATEGORIES.PRO,
    ];
    const fieldSkus = DEFAULT_PLACES_API_SKU_DATA.filter((sku) => {
      return sku.func === SKU_FUNCS.PLACE_DETAILS && categories.includes(sku.category);
    });
    const fields = fieldSkus.map((sku) => sku.fields).join(",");
    console.log(fields);
    let placesData;
    ifPlaceIds: if (placeIds.length === 1) {
      placesData = await getPlaceDetails(placeIds[0], fields);
    } else if (placeIds.length > 1 || noIdExists) {
      const placesFound = [];
      const name = place.name;
      const address = [
        place.housenumber ?? "",
        place.street ?? "",
        place.city ?? "",
        place.state ?? "",
        place.postcode ?? "",
      ].join(" ");

      let nameSim, addressSim, distance, lat2, lng2, name2, address2;
      placeIdsLoop: for (const id of placeIds) {
        let place;
        try {
          place = await getPlaceDetails(id, fields);
          placeDetailsProSku.increment();
        } catch (error) {
          console.error(error);
          continue placeIdsLoop;
        }
        name2 = place.displayName?.text;
        lat2 = place.location?.latitude;
        lng2 = place.location?.longitude;
        address2 = place.formattedAddress ?? "";
        nameSim = compareNames(name, name2);
        addressSim = compareNames(address, address2);
        distance = calcDistance(lat, lng, lat2, lng2);
        if (place) {
          placesFound.push({
            name2,
            address2,
            nameSim,
            addressSim,
            distance,
            place,
          });
        }
        if (nameSim === 1 && addressSim > 0 && distance <= 1) {
          placesData = place;
          // break ifPlaceIds;
        }
      }
      // if (!placesFound || !placesFound[0].place) break ifPlaceIds;

      // let matchNum = 0;
      // console.log("********** Matches **********");
      // for (const place of placesFound) {
      //   console.log(`${matchNum}: name: ${place.name2}, ${place.address2}`);
      //   console.log(
      //     `\t\tName: ${place.nameSim}, Address: ${place.addressSim}, Distance: ${place.distance}km`
      //   );
      //   matchNum++;
      // }
      // console.log("********** Original **********");
      // console.log(`name: ${name}, address: ${address}, lat: ${lat}, lng: ${lng}`);

      // placesData = await rl
      //   .question("Select match number: ")
      //   .then((answer) => {
      //     console.log(`Answer: ${answer}`);
      //     try {
      //       if (answer) return placesFound[Number(answer)].place;
      //       else return null;
      //     } catch (error) {
      //       console.error(error);
      //     }
      //   })
      //   .catch((error) => console.error(error));
    }
    if (!placesData) {
      placeConflicts.push({ placeIds, place });
      console.log(`No match found: ${place.name}`);
      continue filePlacesLoop;
    }
    try {
      await upsertPlace(new Place(placesData));
      upsertCount++;
      console.log(`Place #${upsertCount} upserted`);
    } catch (error) {
      console.error(`Upsert error: ${error}`);
    }
  }

  rl.close();

  await upsertPlacesApiSkuData(skuData);
  saveObjectToFile("sushi_places_conflicts_3.json", placeConflicts);

  console.log(`Places upserted: ${upsertCount}`);
  console.log(`Place conflicts: ${placeConflicts.length}`);
}

run();
