var connection = require('./database')

module.exports = {
  insertAddress: async (address) => {
    let results = await new Promise((resolve, reject) =>
      connection.query('SELECT * from addresses WHERE address = ?', [address], (err, res) => {
        if (err) {
          reject(err)
        } else {
          if (res.length === 0) {
            if (address) {
              console.log('Inserting ' + address + ' into the DB...')
              connection.query('INSERT INTO addresses (address) VALUES (?)', [address])
            }
          }
        }
      })
    )
    return results
  },
  lastBlockIndexed: async () => {
    let results = await new Promise((resolve, reject) =>
      connection.query('SELECT * FROM blocks ORDER BY block DESC LIMIT 1', (err, res) => {
        if (err) {
          reject(err)
        } else {
          if (res.length > 0) {
            resolve(res[0].block)
          } else {
            resolve(0)
          }
        }
      })
    )
    return results
  },
  insertIndexedBlock: async (block) => {
    let results = await new Promise((resolve, reject) =>
      connection.query('INSERT INTO blocks (block) VALUES (?)', [block], (err, res) => {
        if (err) {
          reject(err)
        } else {
          resolve(res)
        }
      })
    )
    return results
  }
}
