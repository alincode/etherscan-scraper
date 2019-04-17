const axios = require('./axios')
const cheerio = require('cheerio')

let url = 'https://etherscan.io/address/0xf9e5af7b42d31d51677c75bbbd37c1986ec79aee#code'
parsePage()

async function parsePage () {
  let data = await axios.fetchPage(url)
  console.log(data)
}
