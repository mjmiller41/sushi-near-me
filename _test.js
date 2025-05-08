const keyWords = `
keywords:
  - sushi near me
  - sushi restaurants
  - sushi close to me
  - best sushi near me
  - sushi restaurants near me
  - japanese places near me
  - sushi places near me
  - I love sushi
  - top rated sushi`
let summary = `### Discover Tokio Sake in Deer Park, IL\n\nTokio Sake in Deer Park, IL, stands out as a welcoming Japanese restaurant specializing in fresh sushi and maki rolls, ideal for anyone searching for \"sushi near me\" or \"sushi restaurants near me.\" The spot features a subdued, cozy atmosphere with a bar that enhances the dining experience, making it perfect for casual evenings or intimate gatherings at top-rated sushi places. Accessibility is a key highlight, with options like wheelchair-accessible parking, entrances, restrooms, and seating, ensuring everyone can enjoy the menu's diverse kitchen dishes and beverages. Operating from late afternoon into the evening, it offers convenient hours for those craving \"best sushi near me,\" including outdoor seating and a variety of drinks like beer, wine, and cocktails. This establishment combines authentic flavors with a relaxed vibe, making it a go-to destination for Japanese cuisine enthusiasts in the area.\n\n### Summarizing the Buzz Around Tokio Sake\n\nFolks chatting about Tokio Sake often highlight the fresh and creatively presented sushi rolls that are generous in size and perfect for sharing, which really hits the spot for sushi lovers. Many mention the cozy atmosphere and solid food quality, with standout dishes like specialty rolls leaving a positive impression on diners stopping by for a meal. Service tends to be friendly and attentive overall, though it can vary a bit depending on the visit, adding a casual element to the experience. The restaurant's ambiance and overall vibe come up as a favorite for groups or special occasions, drawing in repeat customers who appreciate the value. All in all, it's clear that visitors enjoy the combination of tasty options and welcoming setting, making it a solid pick for anyone exploring \"sushi places near me.\"`

summary = summary.replaceAll('### ', '') // replace open"/close"/###
// summary = summary.replaceAll(/\\"/g,'"')
const summaryArr = summary.split('\n')
const generative_summary = `<h3>${summaryArr[0]}</h3>\n${summaryArr[2]}`
const generative_disclosure = 'Summarized by AI using the Grok-3-Mini model.'
const review_summary = `<h3>${summaryArr[4]}</h3>\n${summaryArr[6]}`
const review_disclosure = 'Summarized by AI using the Grok-3-Mini model.'
const place = { test: 1, testing: { a: 1, b: 2 } }
const userContent = `${generative_summary}\n${keyWords}\n${JSON.stringify(place, null, 2)}`
console.log(userContent)

// console.log(`
// <div>
//   <p>
//     ${generative_summary}
//   </p>
//   <p>
//     ${review_summary}
//   </p>
//   <p>
//     <cite>${generative_disclosure}</cite>
//   </p>
// </div>`)
