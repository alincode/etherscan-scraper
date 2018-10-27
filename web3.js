// var Web3 = require('web3')
const rp = require('request-promise')
// const https = require('https')
// var web3 = new Web3(new Web3.providers.HttpProvider('https://core-trace.poa.network'))

async function sendTrace () {
  var options = {
    uri: 'https://ropsten-trace-i24bw.poa.network',
    method: 'POST',
    json: {
      'method': 'eth_getBlockByNumber',
      'params': ['0xDF2EE', true],
      'id': 0,
      'jsonrpc': '2.0'
    }
  }

  let res = await rp(options)
    .then(($) => {
      // console.log($)
      return $
    })
    .catch((err) => {
      return err
    })
  console.log(res)
}

sendTrace()
