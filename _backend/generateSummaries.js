import DB from './lib/db.js'
import { readObjectFromFile, saveObjectToFile } from './lib/fileIO.js'
import grok from './lib/grok.js'
import { Place } from './lib/Place.js'
import { log } from './lib/logger.js'

async function saveNPrintUsage(curr) {
  const filename = '_backend/_grok-usage.json'
  let prev
  try {
    prev = await readObjectFromFile(filename)
  } catch (error) {
    console.error(error)
  }
  let pmptTkns = prev.usage.prompt
  let compTkns = prev.usage.completion
  let rsngTkns = prev.usage.reasoning
  let pmptCost = prev.cost.prompt
  let compCost = prev.cost.completion
  let rsngCost = prev.cost.reasoning
  const pmptPerMil = prev.cost_per_mil.prompt
  const compPerMil = prev.cost_per_mil.completion
  const rsngPerMil = prev.cost_per_mil.reasoning
  const currPmptTkns = curr.prompt_tokens
  const currCompTkns = curr.completion_tokens
  const currRsngTkns = curr.completion_tokens_details.reasoning_tokens
  prev = {
    usage: {
      prompt: (pmptTkns += currPmptTkns),
      reasoning: (rsngTkns += currRsngTkns),
      completion: (compTkns += currCompTkns),
      total: pmptTkns + compTkns + rsngTkns
    },
    cost: {
      prompt: (pmptCost += (currPmptTkns / 1000000) * pmptPerMil),
      reasoning: (rsngCost += (currRsngTkns / 1000000) * rsngPerMil),
      completion: (compCost += (currCompTkns / 1000000) * compPerMil),
      total: pmptCost + compCost + rsngCost
    },
    cost_per_mil: { prompt: 0.3, completion: 0.5, reasoning: 0.5 },
    updated_at: Date()
  }
  console.log(JSON.stringify(prev, null, 2))
  try {
    await saveObjectToFile(filename, prev)
  } catch (error) {
    console.error(error)
  }
}

function extractContent(summary, maxLen) {
  summary = summary.replaceAll('### ', '')
  const summaryArr = summary.split('\n')
  let heading1, heading2, content1, content2
  for (const el of summaryArr) {
    if (el.length > 0 && el.length <= maxLen) {
      if (!heading1) heading1 = el.trim()
      else heading2 = el.trim()
    } else if (el.length > maxLen) {
      if (!content1) content1 = el.trim()
      else content2 = el.trim()
    }
  }
  console.log(summary)
  console.log(heading1, '\n')
  console.log(content1, '\n')
  console.log(heading2, '\n')
  console.log(content2, '\n')
  return { heading1, heading2, content1, content2 }
}

async function run() {
  const db = new DB()

  const { rows, rowCount } = await db.getAllPlaces('0')
  console.log(`${rowCount} rows read from database.`)

  let upsertCount = 0
  let placeCount = 0
  for (const row of rows) {
    const disclosure = 'Summarized by AI using the Grok-3-Mini model.'
    const headingMaxLen = 100
    let place
    try {
      place = new Place(row)
      placeCount++
      console.log(`Processing row: ${place.name}, ${place.city}, ${place.state}`)

      const genResponse = await grok.generativeSummary(place, headingMaxLen)
      await saveNPrintUsage(genResponse.usage)

      let summary = genResponse.choices[0].message.content.trim()
      const { heading1, heading2, content1, content2 } = extractContent(
        summary,
        headingMaxLen
      )

      place.generative_summary = `${heading1}$$$${content1}`
      place.generative_disclosure = disclosure
      place.review_summary = `${heading2}$$$${content2}`
      place.review_disclosure = disclosure

      await db.upsertPlace(place)
      upsertCount++
    } catch (error) {
      console.error(error)
      let err_text = `${error}\n`
      err_text += `${place.place_id}\n${place.name}\n${place.city}, ${place.state}\n`
      err_text += '*'.repeat(80)
      console.error(`\x1b[31m${'*'.repeat(88)}\x1b[0m`)
      log('_backend/logs/grok.log', err_text)
      continue
    }
  }

  console.log(`${upsertCount} of ${placeCount} places upserted`)
}

run()
