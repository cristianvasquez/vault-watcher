import { readFile } from 'fs/promises'
import { resolve } from 'path'
import { createTriplifier } from 'vault-triplifier'
import ns from 'vault-triplifier/src/namespaces.js'
import { createClient } from './sparqlClient.js'

const client = createClient()

const triplifyOptions = {
  baseNamespace: ns.ex,
  addLabels: true,
  includeWikipaths: false,
  splitOnHeader: true,
  namespaces: ns,
  customMappings: {
    'lives in': ns.schema.address,
  },
}

async function canIndex () {
  return await client.doAsk()
}

async function updateTriplestore ({ triplifier, vaultPath, file }) {
  const text = await readFile(resolve(vaultPath, file), 'utf8')
  const pointer = triplifier.toRDF(text, { path: file }, triplifyOptions)
  const namedGraph = triplifier.termMapper.pathToUri(file, triplifyOptions)
  console.log(file)
  try {
    await client.loadData({ dataset: pointer.dataset, namedGraph })
  } catch (error) {
    console.log(error)
  }
}

async function updateChanges ({ vaultPath, created, modified, deleted }) {
  console.log(
    `Index ${created.length} created files, ${modified.length} modified files, and ${deleted.length} deleted files:`)

  const triplifier = await createTriplifier(vaultPath)
  for (const file of [...modified, ...created]) {
    await updateTriplestore({ triplifier, vaultPath, file })
  }
  for (const file of deleted) {
    const namedGraph = triplifier.termMapper.pathToUri(resolve(vaultPath, file),
      triplifyOptions)
    await client.deleteGraph({ namedGraph })
  }
}

async function updateAll ({ vaultPath }) {
  console.log('Indexing all ', vaultPath)
  const triplifier = await createTriplifier(vaultPath)

  for (const file of [
    ...triplifier.getMarkdownFiles(), ...triplifier.getCanvasFiles()]) {
    await updateTriplestore({ triplifier, vaultPath, file })
  }
}

export { updateChanges, updateAll, canIndex }
