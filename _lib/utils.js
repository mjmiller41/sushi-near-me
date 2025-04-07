import { convert, revert } from "url-slug";
const dictionary = {
  "&": "and",
  "@": "at",
  "#": "number",
  "%": "percent",
  "+": "plus",
  "’": "", // For possessives or contractions (e.g., "Bob’s")
  "!": "",
  é: "e", // Common in cuisine-related names
  ñ: "n", // For Spanish-influenced names
  "(": "", // For parenthetical info
  ")": "",
  ".": "dot", // For abbreviations or stylized names
};

export function slugify(name) {
  if (!name || typeof name !== "string") return "";
  return convert(name.trim(), { transformer: false, dictionary });
}

export function deslugify(slug) {
  if (!slug || typeof slug !== "string") return "";
  return revert(slug.trim());
}

// src/lib/utils.js (add this at the bottom or in a new section)
export const stateAbbreviations = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  BC: "Baha California, MX",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DC: "Washington, DC",
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
  PR: "Puerto Rico",
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
};

// Optional: Add a helper function to get the full state name
export function getFullStateName(abbreviation) {
  return stateAbbreviations[abbreviation.toUpperCase()] || abbreviation;
}
