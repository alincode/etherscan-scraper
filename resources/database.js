const mysql = require('mysql')

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'etherscan_contracts'
})

connection.connect()

module.exports = connection
