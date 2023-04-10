import { readFile } from 'fs/promises'
import { Parser } from 'n3'
import { resolve } from 'path'
import rdf from 'rdf-ext'

import StreamClient from 'sparql-http-client/StreamClient.js'
import { sparqlConfig } from './config.js'

const client = new StreamClient(sparqlConfig)

async function put ({ dataset, namedGraph }) {
  if (!namedGraph) {
    throw Error('Requires namedGraph')
  }

  const rewrite = (quad) => rdf.quad(quad.subject, quad.predicate, quad.object,
    namedGraph)

  // Sets the namedGraph
  const payload = rdf.dataset().addAll([...dataset].map(rewrite))

  await client.store.put(payload.toStream())
  console.log(`Loaded ${payload.size} into ${namedGraph.value}`)
}

async function deleteGraph ({ namedGraph }) {
  if (!namedGraph) {
    throw Error('Requires namedGraph')
  }
  const deleteAll = `DELETE {
  GRAPH <${namedGraph.value}> {
    ?s ?p ?o .
  }
}
WHERE {
  GRAPH <${namedGraph.value}> {
    ?s ?p ?o .
  }
}
`
  return await client.query.update(deleteAll)
}

async function doAsk () {
  return await client.query.ask(`ASK
WHERE {
  ?s ?p ?o .
}
`)
}

function createClient () {
  return {
    loadData: async ({ dataset, namedGraph }) => {
      await put({ dataset, namedGraph })
    }, loadFile: async ({ filePath, namedGraph }) => {
      const path = resolve(filePath)
      const str = await readFile(path, 'utf8')
      const parser = new Parser({ factory: rdf })
      const dataset = rdf.dataset().addAll(parser.parse(str))
      await put({ dataset, namedGraph })
    }, deleteGraph, doAsk,
  }
}

export { createClient }
