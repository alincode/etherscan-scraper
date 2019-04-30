var connection = require('./database')

let self = module.exports = {
  insertAddress: async (address, isVerified) => {
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
          } else {
            if (isVerified === true && res[0].blockscout === 0 && res[0].failed === 0) {
              self.updateAddresses(res[0].address, 0, 0, 0, 0)
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
      connection.query('SELECT * FROM addresses WHERE checked = ? AND blockscout = ? AND id > ? ORDER BY id ASC LIMIT 1000', [0, 0, 0], (err, res) => {
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
  },
  checkStartBlock: async (start) => {
    let results = await new Promise((resolve, reject) => {
      connection.query('SELECT * FROM blocks ORDER BY block ASC', (err, results) => {
        if (err) {
          console.log(err)
        }
        if (results[0].block === start) {
          resolve(true)
        } else {
          connection.query('INSERT INTO blocks (block) VALUES (?)', [start], (error) => {
            if (error) {
              console.log(error)
            }
            resolve(true)
          })
        }
      })
    })
    return results
  },
  blockGaps: async () => {
    let results = await new Promise((resolve, reject) => {
      connection.query('SELECT (t1.block + 1) as gap_starts_at, (SELECT MIN(t3.block) -1 FROM blocks t3 WHERE t3.block > t1.block) as gap_ends_at FROM blocks t1 WHERE NOT EXISTS (SELECT t2.block FROM blocks t2 WHERE t2.block = t1.block + 1) HAVING gap_ends_at IS NOT NULL', (err, res) => {
        if (err) {
          console.log(err)
        }
        resolve(res)
      })
    })
    return results
  },
  storeSource: async (address, contract) => {
    let results = await new Promise((resolve, reject) => {
      connection.query('UPDATE addresses SET name = ?, compiler = ?, optimization = ?, runs = ?, source = ?, constructor = ?, libraries = ?, bytecode = ? WHERE address = ?', [contract.contractName, contract.compilerVersion, contract.optimization, contract.runs, contract.sourceCode, contract.constructorArguments, contract.libraries, contract.bytecode, address], (err, res) => {
        if (err) {
          console.log(err)
          reject(err)
        } else {
          resolve(true)
        }
      })
    })
    return results
  }
}
