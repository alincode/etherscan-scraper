CREATE TABLE `etherscan_contracts`.`blocks` (
  `block_id` INT NOT NULL AUTO_INCREMENT,
  `block` INT NULL,
  PRIMARY KEY (`block_id`),
  UNIQUE INDEX `block_UNIQUE` (`block` ASC) VISIBLE);