const fs = require('fs').promises

function toLocalISOString(date) {
  const timezoneOffset = date.getTimezoneOffset() * 60 * 1000
  const adjustedDate = new Date(date.getTime() - timezoneOffset)
  let isoString = adjustedDate.toISOString()
  const offsetHours = (date.getTimezoneOffset() / 60).toString().padStart(2, 0)
  isoString = isoString.replace('Z', `-${offsetHours}`)
  return isoString
}

const logFile = 'api_request_costs.log'
const sessionId = Date.now().toString()
// const skuCosts = {}; // Track costs by SKU ID

async function logRequest(sku, request_count, extra = '') {
  const entry = `[${toLocalISOString(
    new Date()
  )}] Session: ${sessionId} | SKU: ${sku} | Count: ${request_count}\n\t${extra}\n`

  // Track SKU stats
  // if (!skuCosts[sku]) {
  //   skuCosts[sku] = { description: description, request_count: 0, cumm_cost: 0 };
  // }
  // skuCosts[sku].request_count += request_count;
  // skuCosts[sku].cumm_cost += cumm_cost;

  await fs.appendFile(logFile, entry)
}

async function logSummary(currentSkuData) {
  let summary = `[${toLocalISOString(new Date())}] Cost Summary: ${sessionId}\n`
  let totalCost = 0
  for (const { sku, description, request_count, cumm_cost } of Object.values(
    currentSkuData
  )) {
    summary += `  SKU ID: ${sku} | ${description}: ${request_count} requests, at $${cumm_cost.toFixed(
      2
    )} cost.\n`
    totalCost += cumm_cost
  }
  summary += `\tTotal Cost: $${totalCost.toFixed(2)}\n`
  await fs.appendFile(logFile, summary)
}

export { logRequest, logSummary }
