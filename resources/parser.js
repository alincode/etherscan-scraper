const axios = require('./axios')
const cheerio = require('cheerio')

module.exports = {
  parsePage: async (url) => {
    let results = await new Promise(async (resolve, reject) => {
      try {
        let data = await axios.fetchPage(url)
        if (contractVerified(data)) {
          // we know the contract is verified, let's get the source code, name, solidity version, optimization, constructors and libraries
          let object = parseVerifiedContract(data)
          resolve(object)
        } else {
          resolve(false)
        }
      } catch (error) {
        reject(error)
      }
    })
    return results
  }
}

function contractVerified (data) {
  let $ = cheerio.load(data)
  let verified = $('#ContentPlaceHolder1_contractCodeDiv > h3 > strong').text()
  if (verified.indexOf('Contract Source Code Verified') > -1) {
    return true
  } else {
    return false
  }
}

function parseVerifiedContract (data) {
  let contractObject = {}
  let $ = cheerio.load(data)
  contractObject.contractName = $('#ContentPlaceHolder1_contractCodeDiv > div.row.mx-gutters-lg-1.mb-5 > div:nth-child(1) > div.row.align-items-center > div.col-7.col-lg-8 > span').text()
  contractObject.compilerVersion = $('#ContentPlaceHolder1_contractCodeDiv > div.row.mx-gutters-lg-1.mb-5 > div:nth-child(1) > div:nth-child(3) > div.col-7.col-lg-8 > span').text()
  contractObject.optimization = parseOptimization($('#ContentPlaceHolder1_contractCodeDiv > div.row.mx-gutters-lg-1.mb-5 > div:nth-child(2) > div:nth-child(1) > div.col-7.col-lg-8 > span').text())
  contractObject.runs = $('#ContentPlaceHolder1_contractCodeDiv > div.row.mx-gutters-lg-1.mb-5 > div:nth-child(2) > div:nth-child(3) > div.col-7.col-lg-8 > span').text()
  contractObject.sourceCode = $('pre.js-sourcecopyarea').text()
  if (data.indexOf('Constructor Arguments') > -1) {
    contractObject.constructorArguments = parseConstructorArguments($('#dividcode > div:nth-child(4) > pre').text())
  }
  if (data.indexOf('Constructor Arguments') > -1 && data.indexOf('Library Used') > -1) {
    contractObject.libraries = parseLibraries($('#dividcode > div:nth-child(5) > pre').text())
  } else if (data.indexOf('Library Used') > -1) {
    // find library only verified contract
  }
  return contractObject
}

function parseOptimization (data) {
  if (data === 'No') {
    return false
  } else {
    return true
  }
}

function parseConstructorArguments (data) {
  if (data) {
    var re = new RegExp('(.*?)-----Encoded View---------------', 'i')
    let start = data.match(re)[1]
    if (start) {
      return start
    }
  }
}

function parseLibraries (data) {
  let libraries = []
  let split = data.split(':')
  if (split.length > 0) {
    for (let i = 1; i < split.length; i += 2) {
      libraries.push(split[i].trim())
    }
  }
  return libraries
}
