import fs from 'fs/promises'
import path from 'path'
import yaml from 'js-yaml'

async function checkDir(dirPath) {
  try {
    await fs.access(dirPath, fs.constants.F_OK)
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.mkdir(dirPath, { recursive: true })
    } else {
      throw error
    }
  }
}

// Function to save an object to a file
async function saveObjectToFile(filePath, object) {
  try {
    const jsonString = JSON.stringify(object, null, 2) // Convert object to JSON string with indentation
    await fs.writeFile(filePath, jsonString)
    console.log(`Object saved to ${filePath}`)
  } catch (error) {
    console.error(`Error saving object to ${filePath}:`, error)
  }
}

// Function to read an object from a file
async function readObjectFromFile(filePath) {
  try {
    const jsonString = await fs.readFile(filePath, 'utf-8')
    const object = JSON.parse(jsonString)
    console.log(`Object read from ${filePath}`)
    return object
  } catch (error) {
    console.error(`Error reading object from ${filePath}:`, error)
    return null
  }
}

async function readTextFromFile(filename) {
  try {
    const fileString = await fs.readFile(filename, { encoding: 'utf8' })
    return fileString
  } catch (error) {
    throw error
  }
}

async function writeTextToFile(dirPath, filename, text) {
  const filePath = path.join(dirPath, filename)
  try {
    await checkDir(dirPath)
    await fs.writeFile(filePath, text)
  } catch (error) {
    throw error
  }
}

async function readYamlFile(filePath) {
  try {
    const fileContents = await fs.readFile(filePath, { encoding: 'utf8' })
    const data = yaml.load(fileContents, { json: true })
    return data
  } catch (e) {
    console.error(e)
    return null
  }
}

async function writeYamlFile(filePath, data) {
  try {
    const fileContents = yaml.dump(data)
    await fs.writeFile(filePath, fileContents, { encoding: 'utf8' })
  } catch (e) {
    console.error(e)
    return null
  }
}

export {
  saveObjectToFile,
  readObjectFromFile,
  readTextFromFile,
  writeTextToFile,
  readYamlFile,
  writeYamlFile
}
