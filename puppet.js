const puppeteer = require('puppeteer')
const address = '0x7b09fb91ed7015b99db9e9ac10a2dd38ac0c85e1'

async function makeRequest () {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.setRequestInterception(true)
  page.on('request', request => {
    if (request.resourceType() === 'script') { request.abort() } else { request.continue() }
  })
  await page.goto('https://etherscan.io/address/' + address, { waitUntil: 'load' })
  let sourceCode = await page.evaluate(() => document.querySelector('.js-sourcecopyarea').textContent)
  let contractName = await page.evaluate(() => document.querySelector('#ContentPlaceHolder1_contractCodeDiv > div:nth-child(2) > table > tbody > tr:nth-child(1) > td:nth-child(2)').innerText)
  let solidityVersion = await page.evaluate(() => document.querySelector('#ContentPlaceHolder1_contractCodeDiv > div:nth-child(2) > table > tbody > tr:nth-child(2) > td:nth-child(2)').textContent)
  let optimization = await page.evaluate(() => document.querySelector('#ContentPlaceHolder1_contractCodeDiv > div:nth-child(3) > table > tbody > tr:nth-child(1) > td:nth-child(2)').textContent)
  console.log(optimization.trim())

  await browser.close()
  sendPost(sourceCode, contractName.trim(), solidityVersion.trim(), optimization.trim())
}

async function sendPost (sourceCode, contractName, solidityVersion, optimization) {
  let opt
  if (optimization === 'Yes') {
    opt = '#smart_contract_optimization_true'
  } else {
    opt = '#smart_contract_optimization_false'
  }

  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto('https://blockscout.com/eth/mainnet/address/' + address + '/contract_verifications/new', { waitUntil: 'load' })
  console.log(page.url())
  await page.type('#smart_contract_name', contractName)
  await page.select('#smart_contract_compiler_version', solidityVersion)
  await page.click(opt)
  await page.type('#smart_contract_contract_source_code', sourceCode)
  await page.screenshot({ path: 'images/form-' + address + '.png', fullPage: true })
  await page.evaluate(() => {
    document.querySelector('.card-body button[type=submit]').click()
  })
  await page.screenshot({ path: 'images/before-' + address + '.png', fullPage: true })
  await sleep(5000)
  await page.screenshot({ path: 'images/done-' + address + '.png', fullPage: true })
  await browser.close()
}
makeRequest()

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
