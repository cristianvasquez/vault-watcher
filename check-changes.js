import fs from 'fs'
import { exec } from 'child_process'
import { indexStuff } from './index-stuff.js'

const repoPath = '/home/cvasquez/obsidian/workspace'
const shaFilePath = './last-sha'

console.log('Running')
/**
 * Stuff below was written by ChatGPT
 */

// Read the current SHA from the file, or set it to the first SHA of the repository if the file doesn't exist
try {
  const currentSha = fs.readFileSync(shaFilePath, 'utf8').trim()
  checkChanges(currentSha)
} catch (err) {

  console.log('Init')
  exec(`git rev-parse HEAD`, { cwd: repoPath }, (err, stdout, stderr) => {
    if (err) {
      console.error(`Error getting SHA: ${err}`)
      return
    }
    console.log('Index all of the life')
    const newSha = stdout.trim()
    fs.writeFileSync(shaFilePath, newSha, 'utf8')

  })
}

function checkChanges (currentSha) {

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

      exec(`git diff --name-status ${currentSha} ${newSha}`, { cwd: repoPath },
        (err, stdout, stderr) => {
          if (err) {
            console.error(`Error getting diff: ${err}`)
            return
          }

          const changes = stdout.trim().split('\n')

          const created = []
          const modified = []
          const deleted = []

          changes.forEach(change => {
            const [status, file] = change.split('\t')

            switch (status) {
              case 'A':
                created.push(file)
                break
              case 'M':
                modified.push(file)
                break
              case 'D':
                deleted.push(file)
                break
              default:
                console.warn(`Unknown change status: ${status}`)
            }
          })

          try {
            indexStuff({ created, modified, deleted })
            console.log('writing sha', newSha)
            fs.writeFileSync(shaFilePath, newSha, 'utf8')
          } catch (error) {
            console.log(error)
          }

        })

    }
  })

}
