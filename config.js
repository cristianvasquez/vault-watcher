import { resolve } from 'path'
import rdf from 'rdf-ext'

const triplestore = 'http://localhost:3030/obsidian'

const vaultPath = '/home/cvasquez/obsidian/workspace'
const repoPath = resolve(vaultPath, '.git')
const shaFilePath = './last-sha'
const watchInterval = 3000
const sparqlConfig = {
  endpointUrl: triplestore,
  updateUrl: triplestore,
  storeUrl: triplestore,
  user: 'public',
  password: 'public',
  factory: rdf,
}

export { watchInterval, sparqlConfig, vaultPath, repoPath, shaFilePath }
