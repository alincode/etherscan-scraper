const puppeteer = require('puppeteer')
const axios = require('./axios')
const proxy = require('./proxies')

let self = module.exports = {
  checkBlockScoutVerification: async (address) => {
    let results = await new Promise(async (resolve, reject) => {
      try {
        let url = 'https://blockscout.com/eth/mainnet/address/' + address + '/contracts'
        let host = proxy.generateProxy()
        let data = await axios.fetchPage(url, host)
        if (data === false) {
          resolve(404)
        } else {
          let res = isVerified(data)
          resolve(res)
        }
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
  },
  puppetVerify: async (address, data, compiler = 'byzantium') => {
    let results = await new Promise(async (resolve, reject) => {
      let optimized
      if (data.optimization === true) {
        optimized = '#smart_contract_optimization_true'
      } else {
        optimized = '#smart_contract_optimization_false'
      }
      // console.log(compiler)
      const browser = await puppeteer.launch()
      const page = await browser.newPage()
      await page.goto('https://blockscout.com/eth/mainnet/address/' + address + '/contract_verifications/new', { waitUntil: 'load' })
      // console.log(page.url())
      await page.type('#smart_contract_name', data.contractName)
      await page.select('#smart_contract_compiler_version', data.compilerVersion)
      await page.click(optimized)
      const runsInput = await page.$('#optimization_runs')
      await runsInput.click({ clickCount: 3 })
      await runsInput.type(data.runs)
      await page.select('#evm_version_evm_version', compiler)
      await page.$eval('#smart_contract_contract_source_code', (el, value) => el.value = value, data.sourceCode)
      if (data.constructorArguments) {
        await page.type('#smart_contract_constructor_arguments', data.constructorArguments)
      }
      if (data.libraries) {
        for (let i = 0; i < data.libraries.length; i++) {
          let selectorNumber = i + 1
          await page.type('#external_libraries_library' + selectorNumber + '_name', data.libraries[i].name)
          await page.type('#external_libraries_library' + selectorNumber + '_address', data.libraries[i].address)
        }
      }
      await page.screenshot({ path: 'images/form-' + address + '-' + compiler + '.png', fullPage: true })
      await page.evaluate(() => {
        document.querySelector('div.smart-contract-form-buttons > button:nth-child(2)').click()
      })
      // await page.screenshot({ path: 'images/before-' + address + '.png', fullPage: true })
      await page.waitForSelector('.navbar-brand').catch(err => { console.log(err) })
      // await page.screenshot({ path: 'images/done-' + address + '-' + compiler + '.png', fullPage: true })
      await browser.close()

      let status = await self.checkBlockScoutVerification(address)
      if (status === true) {
        resolve(status)
      } else {
        /*
        wait for issue https://github.com/poanetwork/blockscout/issues/1786 to be fixed
        if (compiler === 'byzantium') {
          console.log('Failed but trying Constantinople EVM')
          await sleep(2000)
          self.puppetVerify(address, data, 'constantinople')
        } else if (compiler === 'constantinople') {
          await sleep(2000)
          console.log('Failed but trying Petersburg EVM')
          self.puppetVerify(address, data, 'petersburg')
        }
        */
        resolve(false)
      }
    }).catch((error) => {
      if (error) {
        console.log(error)
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

async function sleep (millis) {
  return new Promise(resolve => setTimeout(resolve, millis))
}
