const puppeteer = require('puppeteer')
const fs = require('fs')
const json2csv = require('json2csv').parse
const address = '0x3508c3bc1735ACF77854C8102b55752a6528E299'
let constructor

makeRequest()

async function makeRequest () {
  // Create an object to hold the smart contract variables
  let contractObject = {}

  // Launch Puppeteer
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.setRequestInterception(true)
  page.on('request', request => {
    if (request.resourceType() === 'script') { request.abort() } else { request.continue() }
  })
  // Pass the address of the contract we want to fetch
  await page.goto('https://etherscan.io/address/' + address, { waitUntil: 'load' })

  // Use the copy button to extract the exact source code. I've found issues with copying the source code otherwise
  contractObject.sourceCode = await page.evaluate(() => document.querySelector('.js-sourcecopyarea').textContent)

  // Copy the contract name, solidity version, and optimization from the source code
  contractObject.contractName = await page.evaluate(() => document.querySelector('#ContentPlaceHolder1_contractCodeDiv > div:nth-child(2) > table > tbody > tr:nth-child(1) > td:nth-child(2)').innerText)
  contractObject.solidityVersion = await page.evaluate(() => document.querySelector('#ContentPlaceHolder1_contractCodeDiv > div:nth-child(2) > table > tbody > tr:nth-child(2) > td:nth-child(2)').textContent)
  contractObject.optimization = await page.evaluate(() => document.querySelector('#ContentPlaceHolder1_contractCodeDiv > div:nth-child(3) > table > tbody > tr:nth-child(1) > td:nth-child(2)').textContent)

  // Copy the constructor arguments
  let constructorArgs = await page.evaluate(() => document.querySelector('#dividcode > pre:nth-child(8)').textContent)

  if (constructorArgs) {
    // If the constructor arguments exist split the encoded view from the raw constructor
    constructor = constructorArgs.split('-----Encoded View---------------')
    if (constructor[0]) {
      // pass the constructor to the object if it exsists
      contractObject.constructor = constructor[0]
    }
  }
  if (constructor) {
    // if the constructor exists the libraries will be located in the 11th child
    contractObject.libraries = await page.evaluate(() => document.querySelector('#dividcode > pre:nth-child(11)').textContent)
  }
  await browser.close()
  exportToCSV(contractObject)
}

function exportToCSV (contractObject) {
  if (contractObject) {
    console.log('Contract Name', contractObject.contractName)
    console.log('Solidity Version', contractObject.solidityVersion)
    console.log('Optimization', contractObject.optimization)
    console.log('Source Code', contractObject.sourceCode)
    console.log('Constructor Arguments', contractObject.constructor)
    console.log('Libraries', contractObject.libraries)

    let newLine = '\r\n'

    let fields = ['ContractName', 'SolidityVersion', 'Optimization', 'SourceCode', 'ConstructorArguments', 'Libraries']

    let appendThis = [
      {
        'ContractName': contractObject.contractName,
        'SolidityVersion': contractObject.solidityVersion,
        'Optimization': contractObject.optimization,
        'SourceCode': contractObject.sourceCode,
        'ConstructorArguments': contractObject.constructor,
        'Libraries': contractObject.libraries
      }
    ]

    var toCsv = {
      data: appendThis,
      fields: fields,
      hasCSVColumnTitle: false
    }

    fs.stat('contracts.csv', function (err, stat) {
      if (err == null) {
        console.log('File exists')

        // write the actual data and end with newline
        var csv = json2csv(toCsv) + newLine

        fs.appendFile('contracts.csv', csv, function (err) {
          if (err) throw err
          console.log('The "data to append" was appended to file!')
        })
      } else {
        // write the headers and newline
        console.log('New file, just writing headers')
        fields = (fields + newLine)

        fs.writeFile('contracts.csv', fields, function (err, stat) {
          if (err) throw err
          console.log('file saved')
        })
      }
    })
  } else {
    console.log('Object is empty')
  }
}
