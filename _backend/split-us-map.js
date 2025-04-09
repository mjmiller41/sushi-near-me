import fs from 'fs/promises'
import path from 'path'
import * as cheerio from 'cheerio'
import SVGPathCommander from 'svg-path-commander'
import { STATES } from './lib/constants.js'
import { slugify } from './lib/utils.js'
const __dirname = import.meta.dirname

function normalizeSVGPath(path) {
  const commands = path.match(/[MLHVCSQTAZmlhvcsqtaz]|-?\d*\.?\d+/g) || []

  let currentX = 0
  let currentY = 0
  let prevX = 0
  let prevY = 0
  let prevControlX = null
  let prevControlY = null

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  const points = []

  function addPoint(x, y) {
    currentX = x
    currentY = y
    points.push({ x, y })
    minX = Math.min(minX, x)
    minY = Math.min(minY, y)
    maxX = Math.max(maxX, x)
    maxY = Math.max(maxY, y)
  }

  function addCurvePoints(x0, y0, x1, y1, x2, y2, x3, y3) {
    for (let t = 0; t <= 1; t += 0.1) {
      const t2 = t * t
      const t3 = t2 * t
      const mt = 1 - t
      const mt2 = mt * mt
      const mt3 = mt2 * mt

      const x = mt3 * x0 + 3 * mt2 * t * x1 + 3 * mt * t2 * x2 + t3 * x3
      const y = mt3 * y0 + 3 * mt2 * t * y1 + 3 * mt * t2 * y2 + t3 * y3

      minX = Math.min(minX, x)
      minY = Math.min(minY, y)
      maxX = Math.max(maxX, x)
      maxY = Math.max(maxY, y)
    }
    addPoint(x3, y3)
  }

  let i = 0
  while (i < commands.length) {
    const cmd = commands[i]

    if (cmd === 'M' || cmd === 'm') {
      const isRelative = cmd === 'm'
      const x = parseFloat(commands[++i])
      const y = parseFloat(commands[++i])
      addPoint(isRelative ? currentX + x : x, isRelative ? currentY + y : y)
    } else if (cmd === 'L' || cmd === 'l') {
      const isRelative = cmd === 'l'
      const x = parseFloat(commands[++i])
      const y = parseFloat(commands[++i])
      addPoint(isRelative ? currentX + x : x, isRelative ? currentY + y : y)
    } else if (cmd === 'H' || cmd === 'h') {
      const isRelative = cmd === 'h'
      const x = parseFloat(commands[++i])
      addPoint(isRelative ? currentX + x : x, currentY)
    } else if (cmd === 'V' || cmd === 'v') {
      const isRelative = cmd === 'v'
      const y = parseFloat(commands[++i])
      addPoint(currentX, isRelative ? currentY + y : y)
    } else if (cmd === 'C' || cmd === 'c') {
      const isRelative = cmd === 'c'
      const x1 = parseFloat(commands[++i])
      const y1 = parseFloat(commands[++i])
      const x2 = parseFloat(commands[++i])
      const y2 = parseFloat(commands[++i])
      const x = parseFloat(commands[++i])
      const y = parseFloat(commands[++i])
      const absX1 = isRelative ? currentX + x1 : x1
      const absY1 = isRelative ? currentY + y1 : y1
      const absX2 = isRelative ? currentX + x2 : x2
      const absY2 = isRelative ? currentY + y2 : y2
      const absX = isRelative ? currentX + x : x
      const absY = isRelative ? currentY + y : y
      addCurvePoints(currentX, currentY, absX1, absY1, absX2, absY2, absX, absY)
      prevControlX = absX2
      prevControlY = absY2
    }
    // Handle other commands (S, Q, T, A, Z) similarly...
    // [Previous code for S, Q, T, A, Z omitted for brevity, but should be included]

    prevX = currentX
    prevY = currentY
    i++
  }

  const width = maxX - minX
  const height = maxY - minY

  // Normalize all coordinates to start at (0,0)
  let normalizedPath = ''
  i = 0
  while (i < commands.length) {
    const cmd = commands[i]

    if (cmd === 'M' || cmd === 'm') {
      const isRelative = cmd === 'm'
      const x = parseFloat(commands[++i])
      const y = parseFloat(commands[++i])
      const absX = isRelative ? currentX + x : x
      const absY = isRelative ? currentY + y : y
      currentX = absX
      currentY = absY
      normalizedPath += `M${(absX - minX).toFixed(1)} ${(absY - minY).toFixed(1)}`
    } else if (cmd === 'L' || cmd === 'l') {
      const isRelative = cmd === 'l'
      const x = parseFloat(commands[++i])
      const y = parseFloat(commands[++i])
      const absX = isRelative ? currentX + x : x
      const absY = isRelative ? currentY + y : y
      currentX = absX
      currentY = absY
      normalizedPath += `L${(absX - minX).toFixed(1)} ${(absY - minY).toFixed(1)}`
    } else if (cmd === 'H' || cmd === 'h') {
      const isRelative = cmd === 'h'
      const x = parseFloat(commands[++i])
      const absX = isRelative ? currentX + x : x
      currentX = absX
      normalizedPath += `H${(absX - minX).toFixed(1)}`
    } else if (cmd === 'V' || cmd === 'v') {
      const isRelative = cmd === 'v'
      const y = parseFloat(commands[++i])
      const absY = isRelative ? currentY + y : y
      currentY = absY
      normalizedPath += `V${(absY - minY).toFixed(1)}`
    } else if (cmd === 'Z' || cmd === 'z') {
      normalizedPath += 'Z'
      currentX = prevX
      currentY = prevY
    }
    // Add handling for C, S, Q, T, A if needed
    i++
  }

  return {
    width: width.toFixed(1),
    height: height.toFixed(1),
    normalizedPath: normalizedPath
  }
}

const svgText = await fs.readFile(
  path.join(__dirname, '../_includes/us-map.svg'),
  { encoding: 'utf8' }
)

let stateCount = 0
for (const value of Object.values(STATES)) {
  const $ = cheerio.load(svgText)
  const svgPath = $(`#${slugify(value)} > path`).attr('d')

  if (svgPath) {
    const result = normalizeSVGPath(svgPath)
    console.log('Width:', result.width)
    console.log('Height:', result.height)
    console.log('Normalized Path:', result.normalizedPath)

    // const result2 = SVGPathCommander.normalizePath(path).toString()
    // console.log('Normalized Path:', result2, '\n')
    const length = Math.max(result.width, result.height)
    const translateX = (length - result.width) / 2
    const translatey = (length - result.height) / 2
    const stateSvgText = `<svg id="${slugify(value)}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 ${length} ${length}">
  <path fill="currentColor" transform="translate(${translateX}, ${translatey})" d="${result.normalizedPath}" />
</svg>`

    console.log(stateSvgText)

    await fs.writeFile(
      path.join(__dirname, `../assets/images/${slugify(value)}.svg`),
      stateSvgText
    )
    stateCount++
  }
}
console.log(stateCount)
