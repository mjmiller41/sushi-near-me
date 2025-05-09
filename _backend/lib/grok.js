import OpenAI from 'openai'
import { config } from './config.js'
import { readYamlFile } from '_config.yml'

const site = readYamlFile('_config.yml')

const keyWords = site.keywords
const generativePrompt = headingMaxLen => {
  return `
- Write two 4 to 5 sentence paragraphs based on the following json data which represents a place retrieved from the Google Places API. The first paragraph is a description (not a review) it should be a description of the place's finer points. If the data includes generative_summary text, use that to inform the final description. In the first sentence of paragraph one, always mention the name, city and state of the place. Do not mention people's names and do not plagiarize.
- For paragraph two, write a 4 to 5 sentence summary of the reviews in the following json data. Extract a general summary based on what the reviewers are saying. If no reviews are included use any publicly available reviews for the place. Do not mention reviewer names and do not plagiarize directly from the review. Use a casual style of writing, and a neutral point of view. Be generous but honest in the review summary. Word your reviews in a way that honestly informs the reader, while keeping a positive tone.
- Always include a heading for each paragraph, and each heading must be a maximum of ${headingMaxLen} characters.
- Alway keep SEO in mind by including keywords and following Google SEO best practices. You do not need to use the keywords verbatim. Work them into the text so they sound natural. If a keyword does not fit, do not use it.
- Always format your response like the following, while replacing "Heading (num)" and "Paragraph (num)" with your generated text:
### Heading 1"
Paragraph 1...
### Headeing 2
Paragraph 2...`
}
const systemContent =
  'You are a marketing and SEO expert. You write descriptions of places for use in online references for potential customers to read and get an idea of what the place is like.'

async function generativeSummary(place, headingMaxLen) {
  const API_KEY = config.openAiApiKey
  const client = new OpenAI({ apiKey: API_KEY, baseURL: 'https://api.x.ai/v1' })

  const userContent = `${generativePrompt(headingMaxLen)}\n${keyWords}\n${JSON.stringify(place, null, 2)}`
  const completion = await client.chat.completions.create({
    model: 'grok-3-mini-beta',
    messages: [
      { role: 'system', content: systemContent },
      { role: 'user', content: userContent }
    ]
  })

  return completion
}

export default { generativeSummary }
