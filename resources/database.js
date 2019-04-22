const mysql = require('mysql')

var connection = mysql.createConnection({
  host: 'etherscan.cdl6z46qyrxn.us-east-1.rds.amazonaws.com',
  user: 'blockscout',
  password: 'Abelance9',
  database: 'etherscan_contracts'
})

connection.connect()

module.exports = connection
