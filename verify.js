const solc = require('solc')
// const source = require('./contracts/tokenContract.sol')

let version = 'v0.4.11+commit.68ef5810'

var sourceCode = process.argv[2];
var optimize = process.argv[4];

var compiled_code = solc.loadRemoteVersion(version, function (err, solcSnapshot) {
  if (err) {
    console.log(JSON.stringify(err));
  } else {
    const input = {
      language: 'Solidity',
      sources: {
        'New.sol': {
          content: sourceCode
        }
      },
      settings: {
        evmVersion: 'byzantium',
        optimizer: {
          enabled: optimize == '1',
          runs: 200
        },
        outputSelection: {
          '*': {
            '*': ['*']
          }
        }
      }
    }

    const output = JSON.parse(solcSnapshot.compile(JSON.stringify(input)))
    /** Older solc-bin versions don't use filename as contract key */
    const response = output.contracts['New.sol'] || output.contracts['']
    console.log(JSON.stringify(response));
  }
})
