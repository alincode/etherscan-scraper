# Etherscan Contract Scraper

## Verified Contract Stats
| Verified      | Failed    | Total Contracts Checked  |
| ------------- |:---------:| ------------------------:|
| 43,332        | 16,288    | 166,272                  |

## Project Goals
The goal of this project is to scrape verified contracts from Etherscan.io and import them onto Blockscout.com. Without the ability to scrape more than 1,000 records from the verified smart contracts page (https://etherscan.io/contractsVerified) on Etherscan, we need to check every contract address from every block. 

After the initial catch-up period, the script will check https://etherscan.io/contractsVerified and monitor this page every hour looking for new verified contracts. 

The script will also check all new incoming blocks for any verified contracts. 

## Requirements
* MYSQL (`brew install mysql`)
* NODEJS 10+ (`brew install node`)

## Installation

* Setup MYSQL Database
  * From the command line, `CREATE DATABASE etherscan_contracts;`
  * `USE etherscan_contracts;`
  * Create the [addresses](https://github.com/acravenho/etherscan-scraper/blob/master/mysql/addresses.sql) and [blocks](https://github.com/acravenho/etherscan-scraper/blob/master/mysql/bblocks.sql) tables
  * Edit the MYSQL connection configuration located [here](https://github.com/acravenho/etherscan-scraper/blob/master/resources/database.js) 
* Run the script, `node app.js`

## How it Works

1. First, the script will check the DB for any pending addresses. 
  * Checks Etherscan.io to obtain the source code. If the address is not verified, the `checked` column in the DB is updated to `1`. This address will not be checked again (can be changed in the future). 
  * If the contract is verified on Etherscan, the source code, name, compiler version, and optimizations are extracted from the page.
  * The verified contract is then imported into BlockScout (https://github.com/acravenho/etherscan-scraper/issues/2)
2. The script will do an initial indexing from the last block that was indexed. All smart contract addresses are entered into the DB by each block.
3. All 40 pages of the Verified Contracts pages are indexed
4. Every hour the Verified Smart Contracts page is monitored
5. Every minute new blocks are checked for smart contracts.
