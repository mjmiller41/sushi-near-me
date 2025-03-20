// updateUSMap.mjs
import { readFile, writeFile } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

// Debugging: Log the current directory
console.log("Current directory:", dirname(fileURLToPath(import.meta.url)));

// Mapping of state abbreviations to full names
const stateNames = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming",
  DC: "District of Columbia",
};

const __dirname = dirname(fileURLToPath(import.meta.url));

// Input and output file paths
const inputFile = join(__dirname, "usMap.jsx");
const outputFile = join(__dirname, "newUSMap.jsx");

async function updateFile() {
  try {
    console.log("Attempting to read:", inputFile);
    // Read the input file
    const data = await readFile(inputFile, "utf8");
    console.log("File read successfully, length:", data.length);

    // Insert <title> in place of <span className="tooltip">
    let matchCount = 0;
    const updatedData = data.replace(
      /<a href="\/([A-Z]{2})" id="\1" className="state">\s*<path[^>]*>\s*<span className="tooltip">([^<]+)<\/span>/g,
      (match, stateAbbr, tooltipText) => {
        const fullName = stateNames[stateAbbr] || stateAbbr;
        matchCount++;
        return `<a href="/${stateAbbr}" id="${stateAbbr}" className="state">
            ${match.match(/<path[^>]*>/)[0].replace(">", "")}>
            <title>${fullName}</title>`;
      }
    );
    console.log("Number of replacements:", matchCount);
    console.log("Replacement performed, updated length:", updatedData.length);

    // Write the updated content
    console.log("Attempting to write to:", outputFile);
    await writeFile(outputFile, updatedData, "utf8");
    console.log("File written successfully! Check usMapUpdated.jsx");

    // Verify the file exists after writing
    const writtenData = await readFile(outputFile, "utf8");
    console.log("Verified: Output file exists, length:", writtenData.length);
  } catch (err) {
    console.error("Error processing file:", err.message);
    if (err.code === "ENOENT") {
      console.error("File not found. Ensure usMap.jsx exists in:", __dirname);
    }
  }
}

// Run the function
updateFile();
