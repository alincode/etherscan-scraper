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
  },
  checkAddresses: async () => {
    let results = await new Promise((resolve, reject) =>
      connection.query('SELECT * FROM addresses WHERE checked = ? AND blockscout = ? LIMIT 1', [0, 0], (err, res) => {
        if (err) {
          reject(err)
        } else {
          resolve(res)
        }
      })
    )
    return results
  },
  updateAddresses: async (address, blockscout, verified, checked, failed) => {
    let results = await new Promise((resolve, reject) =>
      connection.query('UPDATE addresses SET blockscout = ?, verified = ?, checked = ?, failed = ? WHERE address = ?', [blockscout, verified, checked, failed, address], (err) => {
        if (err) {
          reject(err)
        } else {
          resolve(true)
        }
      })
    )
    return results
  }
}
