# Docker

```sh
docker pull mysql:5.7
docker run --name mysql -p 3306:3306 -v /tmp:/tmp -e MYSQL_ROOT_PASSWORD=password -d mysql:5.7
docker exec -it mysql bash

# mysql -u root -p
# ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password';
# FLUSH PRIVILEGES;

CREATE DATABASE etherscan_contracts;

mysql -u root -p -h localhost etherscan_contracts < /tmp/etherscan_contracts_addresses.sql
mysql -u root -p -h localhost etherscan_contracts < /tmp/etherscan_contracts_blocks.sql

SELECT * FROM etherscan_contracts.addresses where sourceCode != 'null'
```