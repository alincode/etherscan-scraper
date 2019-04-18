CREATE TABLE `blocks` (
  `block_id` int(11) NOT NULL AUTO_INCREMENT,
  `block` int(11) DEFAULT NULL,
  PRIMARY KEY (`block_id`),
  UNIQUE KEY `block_UNIQUE` (`block`)
) ENGINE=InnoDB AUTO_INCREMENT=8009 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
