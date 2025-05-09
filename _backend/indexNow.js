import https from 'https'
import fetch from 'node-fetch'
import convert from 'xml-js'
import { readYamlFile, readTextFromFile } from './lib/fileIO.js'
import 'dotenv/config'

// const endpoints = [
// 'www.bing.com'
// 'api.indexnow.org'
// 'searchadvisor.naver.com',
// 'search.seznam.cz',
// 'yandex.com',
// 'indexnow.yep.com'
// ]

async function extractUrls(filename) {
  const xmlString = await readTextFromFile(filename)
  const jsonString = convert.xml2json(xmlString, { compact: true, spaces: 2 })
  const json = JSON.parse(jsonString)
  const urlList = []
  for (const url of json.urlset.url) {
    urlList.push(url.loc._text)
  }
  return urlList
}

async function getJsonFromUrl(url) {
  try {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const json = await response.json()
    return json
  } catch (error) {
    console.error('Could not fetch data:', error)
    return null
  }
}

async function postReqest(endpoint, urlList) {
  const site = await readYamlFile('_config.yml')
  const indexNowKey = process.env.INDEX_NOW_KEY

  const data = JSON.stringify({
    host: site.domain,
    key: indexNowKey,
    keyLocation: `https://${site.domain}/${indexNowKey}.txt`,
    urlList: urlList
  })

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Length': data.length
    }
  }

  const req = https
    .request(endpoint, options, res => {
      let responseData = ''
      res.on('data', chunk => {
        responseData += chunk
      })

      res.on('end', () => {
        let response
        try {
          response = JSON.parse(responseData)
        } catch (error) {
          console.log(`JSON parse error: ${error}`, '\n')
          response = responseData
        } finally {
          console.log(`${endpoint} response:\n`, response, '\n')
        }
      })
    })
    .on('error', err => {
      console.log(`${endpoint} error:\n`, 'Error: ' + err.message, '\n')
    })

  req.write(data)
  req.end()
}

const endpoints = []
const metaUrls = await getJsonFromUrl('https://www.indexnow.org/searchengines.json')

if (metaUrls && Object.hasOwn(metaUrls, 'bing')) {
  for (const key in metaUrls) {
    const searchEngine = await getJsonFromUrl(metaUrls[key])
    endpoints.push(searchEngine.api)
    console.log(searchEngine.api)
  }

  const urlList = await extractUrls('_site/sitemap.xml')
  for (const endpoint of endpoints) {
    await postReqest(endpoint, urlList)
  }
}
