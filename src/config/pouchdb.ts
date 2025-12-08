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
  
  // Only sync if CouchDB is available, handle errors gracefully
  const syncHandler = db.sync(`${apiUrl}/_db/${name}`, {
    live: true,
    retry: true,
    back_off_function: (delay: number) => {
      // Exponential backoff, max 30 seconds
      return Math.min(delay * 2, 30000)
    },
  })
  
  syncHandler
    .on('change', (info) => {
      // Silently handle changes
    })
    .on('error', (err: any) => {
      // Silently handle sync errors - CouchDB may not be available
      // Only log if it's not a connection/auth error
      if (err?.status !== 401 && err?.status !== 404 && !err?.message?.includes('ECONNREFUSED')) {
        console.warn(`PouchDB sync error for ${name}:`, err)
      }
    })
    .on('paused', () => {
      // Sync paused (usually due to network issues)
    })
    .on('active', () => {
      // Sync resumed
    })

  return db
}

export const patients = createDb('patients')
export const appointments = createDb('appointments')
export const labs = createDb('labs')
