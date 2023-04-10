import fs from 'fs'
import { exec } from 'child_process'
import * as sparqlIndexer from './indexSparql.js'

/**
 * Stuff below was written by ChatGPT
 */
async function updateLast ({ vaultPath, repoPath, shaFilePath }) {

  if (await sparqlIndexer.canIndex()) {
    try {
      const currentSha = fs.readFileSync(shaFilePath, 'utf8').trim()
      await update({ vaultPath, repoPath, currentSha, shaFilePath },
        sparqlIndexer.updateChanges)
    } catch (err) {
      console.log('Init SHA')
      exec(`git rev-parse HEAD`, { cwd: repoPath },
        async (err, stdout, stderr) => {
          if (err) {
            console.error(`Error getting SHA: ${err}`)
            return
          }
          await sparqlIndexer.updateAll({ vaultPath })
          const newSha = stdout.trim()
          fs.writeFileSync(shaFilePath, newSha, 'utf8')
        })
    }
  }

}

// Read the current SHA from the file, or set it to the first SHA of the repository if the file doesn't exist

function update (
  { vaultPath, repoPath, currentSha, shaFilePath }, updateChanges) {

// Get the SHA of the latest commit
  exec(`git rev-parse HEAD`, { cwd: repoPath }, (err, stdout, stderr) => {
    if (err) {
      console.error(`Error getting SHA: ${err}`)
      return
    }

    const newSha = stdout.trim()

    // Compare the new SHA to the current one
    if (newSha !== currentSha) {
      console.log(`New commit detected: ${newSha}`)

      exec(
        `git -c core.quotepath=false diff --name-status ${currentSha} ${newSha}`,
        { cwd: repoPath }, async (err, stdout, stderr) => {
          if (err) {
            console.error(`Error getting diff: ${err}`)
            return
          }
          console.log(stdout)

          const changes = stdout.trim().split('\n')

          const created = []
          const modified = []
          const deleted = []
          changes.forEach(change => {
            const [status, ...paths] = change.split('\t')

            switch (status) {
              case 'A':
                created.push(paths[0])
                break
              case 'M':
                modified.push(paths[0])
                break
              case 'D':
                deleted.push(paths[0])
                break
              default:
                if (status.startsWith('R')) {
                  deleted.push(paths[0])
                  if (!paths[1].startsWith('.trash')) {
                    created.push(paths[1])
                  }
                } else {
                  console.warn(`Unknown change status: ${status}`)
                }
            }
          })
          try {
            await updateChanges({
              vaultPath, created: created, modified: modified, deleted: deleted,
            })
            console.log('writing sha', newSha)
            fs.writeFileSync(shaFilePath, newSha, 'utf8')
          } catch (error) {
            console.log(error)
          }
        })
    }
  })
}

export { updateLast }

