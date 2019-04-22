CREATE TABLE `etherscan_contracts`.`proxies` (
  `pid` INT NOT NULL AUTO_INCREMENT,
  `proxy` VARCHAR(45) NULL,
  `port` INT NULL,
  PRIMARY KEY (`pid`));