import { readFile } from 'fs/promises'
import { resolve } from 'path'
import { createTriplifier } from 'vault-triplifier'
import { vaultPath } from './config.js'

const triplifier = await createTriplifier(vaultPath)

const ignoreFiles = new Set([
  'excalibrain.md'])

function toIndex (file) {

  if (file.startsWith('_resources/NotIndexed')) {
    return false
  }

  return !ignoreFiles.has(file)
}

// Create an array to store the file sizes
const fileSizes = []

// Loop over the markdown files and get their sizes
for (const file of triplifier.getMarkdownFiles().
  filter(toIndex)) {

  const text = await readFile(resolve(vaultPath, file), 'utf8')
  fileSizes.push({ size: text.length, name: file })
}

// Sort the file sizes in descending order
fileSizes.sort((a, b) => b.size - a.size)

// Display the 10 biggest files
for (let i = 0; i < 10 && i < fileSizes.length; i++) {
  const { size, name } = fileSizes[i]
  console.log(`${size} - ${name}`)
}
