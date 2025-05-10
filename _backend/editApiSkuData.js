import { getCurrentSkuData, SkuData } from './lib/Sku.js'
import readline from 'readline/promises'
import columnify from 'columnify'
import DB from './lib/db.js'
const db = new DB()

const changeMenuItems = [
  { num: 0, column: 'free_limit_hit' },
  { num: 1, column: 'cumm_cost' },
  { num: 2, column: 'request_count' }
]

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

function filterSkuDataObjs(data) {
  return data.map((sku, index) => {
    return {
      num: index,
      sku: sku.sku,
      func: sku.func,
      category: sku.category,
      freeLimit: sku.free_limit_hit,
      cost: sku.cumm_cost,
      reqCount: sku.request_count
    }
  })
}

function printMenuItems(data) {
  const menuColumns = columnify(data)
  console.log('\n', menuColumns)
  return data.length
}

async function askQuestion(question = '') {
  return await rl
    .question(question)
    .then(answer => {
      if (!answer) return
      return answer
    })
    .catch(error => console.error(error))
}

let dataModified = false
async function run() {
  const skuData = await SkuData.init()
  let quit = false

  while (!quit) {
    console.clear()
    const numSkuOptions = printMenuItems(filterSkuDataObjs(skuData.skuObjs))
    const option = await askQuestion('\nEnter option number or enter to exit: ')

    if (!option)
      break // Exits on enter
    else if (0 > Number(option) > numSkuOptions) continue // Option number invalid

    const sku = skuData.skuObjs[Number(option)]
    console.log(
      `Sku ${sku.sku} free_limit: ${sku.free_limit_hit}, cost: ${sku.cumm_cost}, req_count: ${sku.request_count}`
    )

    const numChangeOptions = printMenuItems(changeMenuItems)
    const changeOption = await askQuestion(`\nEnter column number: `)

    if (!changeOption) break
    if (0 > Number(changeOption) > numChangeOptions) continue // Option number invalid

    const value = await askQuestion('Enter new value: ')
    sku[changeMenuItems[changeOption].column] = value

    if (!dataModified && value) dataModified = !dataModified
    if (!option || !changeOption || !value) quit = true
  }

  if (dataModified) await skuData.save()
  db.end()
  rl.close()
  process.exit(0)
}

run()
