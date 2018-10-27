const rp = require('request-promise')
const cheerio = require('cheerio')
const querystring = require('querystring')
const https = require('https')

const etherscan = {
  uri: 'https://etherscan.io/address/0x5c6d8bb345f4299c76f24fc771ef04dd160c4d36#code',
  transform: function (body) {
    return cheerio.load(body)
  }
}

const blockscout = {
  uri: 'https://blockscout.com/eth/mainnet/address/0x5c6d8bb345f4299c76f24fc771ef04dd160c4d36/contract_verifications/new',
  transform: function (body) {
    return cheerio.load(body)
  }
}

async function makeRequest () {
  let bs = await rp(blockscout).then(($) => {
    let token = $('[name=_csrf_token]').attr('value')
    return token
  })

  let es = await rp(etherscan)
    .then(($) => {
      let object = {}
      object.sourceCode = $('.panel-sourcecode').text()
      object.abi = $('.panel-ABI').text()
      object.address = $('a.address-tag').html().trim()
      object.contractName = $('#code .col-md-6 .table tr td').eq(1).text().trim()
      object.solidityVersion = $('#code .col-md-6 .table tr td').eq(3).text().trim()
      object.optimization = $('#code .col-md-6 .table tr:nth-child(1) td').eq(3).text().trim()
      return object
    })
    .catch(function (err) {
      console.log(err)
    })

  sendPost(bs, es)
}

async function sendPost (bs, es) {
  let opt
  if (es.optimization === 'Yes') {
    opt = true
  } else {
    opt = false
  }
  var postData = querystring.stringify({
    '_csrf_token': bs,
    '_utf8': '✓',
    'smart_contract[address_hash]': es.address,
    'smart_contract[name]': es.contractName,
    'smart_contract[compiler_version]': es.solidityVersion,
    'smart_contract[optimization]': opt,
    'smart_contract[contract_source_code]': es.sourceCode
  })

  var postOptions = {
    rejectUnauthorized: false,
    host: 'eth1p-explorer-ether-alb-351601772.us-east-1.elb.amazonaws.com',
    port: '443',
    path: '/address/' + es.address + '/contract_verifications',
    method: 'POST',
    headers: {
      'Accept-Encoding': 'gzip',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData)
    }
  }
  console.log(postOptions)

  var postReq = https.request(postOptions, function (res) {
    console.log('statusCode:', res.statusCode)
    // console.log('headers:', res.headers)

    res.on('data', (d) => {
      process.stdout.write(d)
    })
  })

  postReq.on('error', (e) => {
    console.error(e)
  })

  postReq.write(postData)
  postReq.end()
}

makeRequest()
