import { updateLast } from './update.js'
import {
  watchInterval, repoPath, shaFilePath, vaultPath,
} from './config.js'

await updateLast({ vaultPath, repoPath, shaFilePath })
