import PouchDB from 'pouchdb'

/* eslint-disable */
import memoryAdapter from 'pouchdb-adapter-memory'
import search from 'pouchdb-quick-search'
import PouchdbFind from 'pouchdb-find'
/* eslint-enable */

PouchDB.plugin(search)
PouchDB.plugin(memoryAdapter)
PouchDB.plugin(PouchdbFind)

function createDb(name: string) {
  // Support both Vite (import.meta.env) and legacy (process.env) for compatibility
  const isTest = import.meta.env.MODE === 'test' || 
                 (typeof process !== 'undefined' && process.env?.NODE_ENV === 'test')
  const apiUrl = import.meta.env.VITE_HOSPITALRUN_API || 
                 (typeof process !== 'undefined' && process.env?.REACT_APP_HOSPITALRUN_API) || 
                 'http://localhost:3000'

  if (isTest) {
    return new PouchDB(name, { adapter: 'memory' })
  }

  const db = new PouchDB(name)
  db.sync(`${apiUrl}/_db/${name}`, {
    live: true,
    retry: true,
  }).on('change', (info) => {
    console.log(info)
  })

  return db
}

export const patients = createDb('patients')
export const appointments = createDb('appointments')
export const labs = createDb('labs')
