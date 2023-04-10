import { readFile } from 'fs/promises'
import { resolve } from 'path'
import { createTriplifier } from 'vault-triplifier'
import { vaultPath, canIndex } from './config.js'

const triplifier = await createTriplifier(vaultPath)

// Create an array to store the file sizes
const fileSizes = []

// Loop over the markdown files and get their sizes
for (const file of triplifier.getMarkdownFiles().
  filter(canIndex)) {

  const text = await readFile(resolve(vaultPath, file), 'utf8')
  fileSizes.push({ size: text.length, name: file })
}

const sizeLimit = 8000

// Sort the file sizes in descending order
fileSizes.sort((a, b) => b.size - a.size)

const bigOnes = fileSizes.filter(a => a.size > sizeLimit)
for (const { size, name } of bigOnes) {
  console.log(`${size} - ${name}`)
}
console.log('Total:', bigOnes.length)


