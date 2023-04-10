import { exec } from 'child_process'
import fs from 'fs'
import { getChanges } from './git.js'
import {
  repoPath, vaultPath,
} from './config.js'
import { updateChanges, updateAll, canIndex } from './src/triplify.js'

const triplestoreSha = 'triplestore.sha'

async function indexAll () {
  console.log('Init SHA')
  exec(`git rev-parse HEAD`, { cwd: repoPath }, async (err, stdout, stderr) => {
    if (err) {
      console.error(`Error getting SHA: ${err}`)
      return
    }
    await updateAll({ vaultPath })
    const newSha = stdout.trim()
    fs.writeFileSync(triplestoreSha, newSha, 'utf8')
  })
}

async function updateLast () {
  if (!await canIndex()) {
    throw Error('Triplestore down')
  }

  const lastSeenSha = fs.readFileSync(triplestoreSha, 'utf8').trim()

  const { needsIndexing, currentSha, changes } = await getChanges(
    { repoPath, lastSeenSha })

  if (needsIndexing) {
    await updateChanges({ vaultPath }, changes)
    console.log('writing sha', currentSha)
    fs.writeFileSync(triplestoreSha, currentSha, 'utf8')
  } else {
    console.log('no changes')
  }

}

await updateLast()
