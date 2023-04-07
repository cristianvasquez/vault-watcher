import { resolve } from 'path'
import minimist from 'minimist'
import { indexBySha } from './check-changes.js'

//  Made by ChatGPT

// Parse command-line arguments
const args = minimist(process.argv.slice(2))
const vaultPath = args.d || '/home/cvasquez/obsidian/workspace'
const interval = args.i || 3000 // Default interval is 3 seconds

// Resolve the absolute path to the repository
const repoPath = resolve(vaultPath, '.git')
const shaFilePath = './last-sha'

// Schedule the function to be executed periodically
setInterval(function () {
  console.log('Watching', new Date())
  indexBySha({ vaultPath, repoPath, shaFilePath })
}, interval)
