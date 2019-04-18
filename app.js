const axios = require('./resources/axios')
const parser = require('./resources/parser')
const blockscout = require('./resources/blockscout')
const cheerio = require('cheerio')
let start = 1
let totalBlocks = 200
let verfiedContractPageEnd = 40
const totalTransactionsOnPage = 50
let blockURL = 'https://etherscan.io/txs?block='
let verifiedContractPage = 'https://etherscan.io/contractsVerified/'

let mysql = require('./resources/mysql')

startApp()

async function startApp () {
  // before looking for new addresses we check for existing verified contracts
  importSourceCode()

  let currentBlock = await latestBlock()
  console.log('Current Block Number on Mainnet: ', currentBlock)
  let finalBlock = await mysql.lastBlockIndexed()
  console.log('Last Block Indexed from DB: ', finalBlock)
  if (finalBlock === 0) {
    console.log('No blocks found indexed in DB')
    finalBlock = currentBlock - totalBlocks
    console.log('Indexing blocks ' + currentBlock + ' - ' + finalBlock)
  }

  // loop through transactions pages looking for verified contracts
  for (let i = currentBlock; i > finalBlock; i--) {
    scrapeBlockPage(i)
    mysql.insertIndexedBlock(i)
    await sleep(3000)
  }

  // loop through verified contracts page
  for (let y = start; y <= verfiedContractPageEnd; y++) {
    scrapeVerifiedContracts(y)
    await sleep(2000)
  }
  // check Transaction page every minute
  checkNewBlocks()
  // check verified contract page every minute
  checkVerifiedContractsPage(1)
}

async function checkNewBlocks () {
  console.log('Checking for new blocks...')
  let currentBlock = await latestBlock()
  let finalBlock = await mysql.lastBlockIndexed()
  for (let i = currentBlock; i > finalBlock; i--) {
    scrapeBlockPage(i)
    mysql.insertIndexedBlock(i)
    await sleep(3000)
  }
  await sleep(60000)
  console.log('Sleeping for 60 seconds...')
  checkNewBlocks()
}

async function checkVerifiedContractsPage (p) {
  console.log('Rechecking Verified Contract page #', p)
  scrapeVerifiedContracts(1)
  await sleep(1800000)
  p++
  checkVerifiedContractsPage(p)
}

async function scrapeVerifiedContracts (page) {
  console.log('Scraping Verified Contracts page ' + page + '...')
  let verifiedContractURL = verifiedContractPage + page
  let data = await axios.fetchPage(verifiedContractURL)
  return data
}

async function scrapeBlockPage (block) {
  console.log('Scraping Page 1 of Block #' + block + '...')
  let blockPageURL = blockURL + block
  let data = await axios.fetchPage(blockPageURL)
  let totalTransactions = getBlockPages(data)
  let totalpages = Math.ceil(totalTransactions / totalTransactionsOnPage)
  parseTransactionsTable(data)
  if (totalpages > 1) {
    for (let i = 2; i < totalpages; i++) {
      await sleep(1000)
      console.log('Scraping Page ' + i + ' of Block #' + block + '...')
      let blockPagePaginated = blockURL + block + '&p=' + i
      let paginatedData = await axios.fetchPage(blockPagePaginated)
      parseTransactionsTable(paginatedData)
    }
  }
}

function parseVerifiedContractPage (data) {
  let addressArray = []
  let $ = cheerio.load(data)
  $('tbody > tr > td').each(function (i, element) {
    let res = $(this)
    let parsedData = res.children().text()
    if (parsedData !== null) {
      if (parsedData) {
        let address = parsedData.trim()
        addressArray.push(address)
      }
    }
  })
  storeAddresses(addressArray)
}

function parseTransactionsTable (data) {
  let addressArray = []
  let $ = cheerio.load(data)
  $('tbody > tr > td').each(function (i, element) {
    let res = $(this)
    let parsedData = res.children().html()
    if (parsedData !== null) {
      if (parsedData.includes('fa-file-alt')) {
        let address = callback(parsedData)
        addressArray.push(address)
      }
    }
  })
  storeAddresses(addressArray)
}

function storeAddresses (addresses) {
  let data = removeDuplicates(addresses)
  data.forEach(function (val) {
    mysql.insertAddress(val)
  })
}

function callback (data) {
  var re = new RegExp('href="/address/(.*?)">', 'i')
  let address = data.match(re)[1]
  if (address) {
    return address
  }
}

function removeDuplicates (array) {
  // Use hashtable to remove duplicate addresses
  var seen = {}
  return array.filter(function (item) {
    return seen.hasOwnProperty(item) ? false : (seen[item] = true)
  })
}

async function sleep (millis) {
  return new Promise(resolve => setTimeout(resolve, millis))
}

async function latestBlock () {
  // fetch latest block from etherscan
  let esLastBlockURL = 'https://api.etherscan.io/api?module=proxy&action=eth_blockNumber&apikey=YourApiKeyToken'
  let block = await axios.fetchPage(esLastBlockURL)
  return parseInt(block.result, 16)
}

function getBlockPages (data) {
  var re = new RegExp('A total of(.*?)transactions found', 'i')
  let total = data.match(re)[1]
  if (total) {
    return parseInt(total.trim())
  }
}

async function importSourceCode () {
  let addresses = await mysql.checkAddresses()
  if (addresses.length > 0) {
    for (let i = 0; i < addresses.length; i++) {
      let importAddress = addresses[i].address
      // let importAddress = '0x3644ab79a793244abdbca44189a01756042db2e3'
      let etherscanCodeURL = 'https://etherscan.io/address/' + importAddress + '#code'
      let verifiedContract = await parser.parsePage(etherscanCodeURL)
      if (verifiedContract) {
        if (await blockscout.checkBlockScoutVerification(importAddress) === true) {
          console.log('Contract ' + importAddress + ' already verified...')
          // update DB to blockscout verified
          mysql.updateAddresses(importAddress, 1, 1, 1, 0)
        } else {
          console.log('Contract ' + importAddress + ' not verified...')
          let blockscoutImport = await blockscout.verifyContract(importAddress, verifiedContract)
          console.log(blockscoutImport)
        }
      } else {
        // mark contract as not verified on Etherscan
        mysql.updateAddresses(importAddress, 0, 0, 1, 0)
      }
      console.log(importAddress)
    }
  }
}
