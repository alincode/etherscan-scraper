const axios = require('./axios')

module.exports = {
  checkBlockScoutVerification: async (address) => {
    let results = await new Promise(async (resolve, reject) => {
      try {
        let url = 'https://blockscout.com/eth/mainnet/address/' + address + '/contracts'
        let data = await axios.fetchPage(url)
        let res = isVerified(data)
        resolve(res)
      } catch (error) {
        reject(error)
      }
    })
    return results
  },
  verifyContract: async (address, data) => {
    let results = await new Promise(async (resolve, reject) => {
      try {
        if (data) {
          let url = 'https://blockscout.com/eth/mainnet/api?module=contract&action=verify&addressHash=' + address + '&name=' + data.contractName + '&compilerVersion=' + data.compilerVersion + '&optimization=' + data.optimization + '&contractSourceCode=' + data.sourceCode
          console.log(url)
          let result = await axios.fetchPage(url)
          console.log(result)
          resolve(result)
        }
      } catch (error) {
        reject(error)
      }
    })
    return results
  }
}

function isVerified (data) {
  if (data.indexOf('Contract source code') > -1) {
    return true
  } else {
    return false
  }
}
