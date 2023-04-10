import { exec } from 'child_process'

// Read the current SHA from the file, or set it to the first SHA of the repository if the file doesn't exist
function getChanges ({ repoPath, lastSeenSha }) {
  return new Promise((resolve, reject) => {
    exec(`git rev-parse HEAD`, { cwd: repoPath }, (err, stdout, stderr) => {
      if (err) {
        console.error(`Error getting SHA: ${err}`)
        return reject(err)
      }

      const newSha = stdout.trim()

      if (newSha !== lastSeenSha) {
        console.log(`New commit detected: ${newSha}`)

        exec(
          `git -c core.quotepath=false diff --name-status ${lastSeenSha} ${newSha}`,
          { cwd: repoPath }, async (err, stdout, stderr) => {
            if (err) {
              console.error(`Error getting diff: ${err}`)
              return reject(err)
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

            resolve({
              needsIndexing: true, currentSha: newSha, changes: {
                created: created, modified: modified, deleted: deleted,
              },
            })
          })
      } else {
        resolve({
          needsIndexing: false, currentSha: lastSeenSha, changes: {
            created: [], modified: [], deleted: [],
          },
        })
      }
    })
  })
}

export { getChanges }

