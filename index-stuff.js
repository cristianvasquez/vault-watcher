function indexStuff ({ created, modified, deleted }) {
  console.log(
    `Trying to index ${created.length} created files, ${modified.length} modified files, and ${deleted.length} deleted files:`)
  console.log(`Created files:\n${created.join('\n')}`)
  console.log(`Modified files:\n${modified.join('\n')}`)
  console.log(`Deleted files:\n${deleted.join('\n')}`)
  // throw Error('Not implemented')
}

function indexAll ({ vaultPath }) {
  console.log('Indexing all ', vaultPath)
}

export { indexStuff, indexAll }
