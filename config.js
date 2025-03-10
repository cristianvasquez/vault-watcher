import { resolve } from 'path'
import rdf from 'rdf-ext'


const ignoreFiles = new Set([
  'excalibrain.md'])

function canIndex (file) {
  if (file.startsWith('_resources/NotIndexed')) {
    return false
  }
  return !ignoreFiles.has(file)
}

const triplestore = 'http://localhost:3030/obsidian'
const vaultPath = '/home/cvasquez/obsidian/workspace'
const repoPath = resolve(vaultPath, '.git')

const sparqlConfig = {
  endpointUrl: triplestore,
  updateUrl: triplestore,
  storeUrl: triplestore,
  user: 'public',
  password: 'public',
  factory: rdf,
}

export { sparqlConfig, vaultPath, repoPath, canIndex }
