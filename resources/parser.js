const axios = require('./axios')
const cheerio = require('cheerio')
const proxy = require('./proxies')

module.exports = {
  parsePage: async (url) => {
    let results = await new Promise(async (resolve, reject) => {
      try {
        let host = proxy.generateProxy()
        let data = await axios.fetchPage(url, host)
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
  let verified = $('#ContentPlaceHolder1_contractCodeDiv > div.row.py-1 > div > h3 > strong').text()
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
  let opt = parseOptimization($('#ContentPlaceHolder1_contractCodeDiv > div.row.mx-gutters-lg-1.mb-5 > div:nth-child(2) > div:nth-child(1) > div.col-7.col-lg-8 > span').text())
  contractObject.optimization = opt.optimization
  contractObject.runs = opt.runs
  contractObject.evmVersion = $('#ContentPlaceHolder1_contractCodeDiv > div.row.mx-gutters-lg-1.mb-5 > div:nth-child(2) > div:nth-child(3) > div.col-7.col-lg-8 > span').text()
  let sourceCode = $('pre.js-sourcecopyarea').text()
  contractObject.sourceCode = parseSourceCode(sourceCode)
  contractObject.bytecode = $('#verifiedbytecode2').text()
  if (data.indexOf('Constructor Arguments') > -1) {
    contractObject.constructorArguments = parseConstructorArguments($('#dividcode > div:nth-child(4) > pre').text())
  } else {
    let checkBytecode = parseConstructorFromBytecode(contractObject.bytecode)
    if (checkBytecode) {
      contractObject.constructorArguments = checkBytecode
    }
  }
  if (data.indexOf('Constructor Arguments') > -1 && data.indexOf('Library Used') > -1) {
    contractObject.libraries = parseLibraries($('#dividcode > div:nth-child(5) > pre').html())
  } else if (data.indexOf('Library Used') > -1) {
    // find library only verified contract
  }
  return contractObject
}

function parseSourceCode (data) {
  if (data.indexOf('(UTC) */') > -1) {
    let split = data.split('(UTC) */')
    return split[1].trimLeft()
  } else {
    return data
  }
}

function parseConstructorFromBytecode (data) {
  let split = data.split('0029')
  if (split.length > 1) {
    return split[split.length - 1]
  } else {
    return false
  }
}

function parseOptimization (data) {
  let obj = {}
  if (data.indexOf('with') > -1) {
    let split = data.split('with')
    let runs = split[1].split(' ')

    if (split[0].trim() === 'No') {
      obj.optimization = false
    } else {
      obj.optimization = true
    }
    obj.runs = runs[1].trim()
  } else {
    obj.optimization = false
    obj.runs = 200
  }
  return obj
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
  if (data.indexOf('<br>') > -1) {
    let splitLibraries = data.split('<br>')
    for (let i = 0; i < splitLibraries.length; i++) {
      let obj = {}
      let splitNameAddress = splitLibraries[i].split(':')
      obj.name = splitNameAddress[0].trim()
      obj.address = extractAddress(splitNameAddress[1])
      if (obj.name && obj.address) {
        libraries.push(obj)
      }
    }
  }
  return libraries
}

function extractAddress (data) {
  if (data) {
    var re = new RegExp('href="/address/(.*?)">', 'i')
    let address = data.match(re)[1]
    if (address) {
      return address
    }
  }
  return false
}
