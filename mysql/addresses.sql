CREATE TABLE `addresses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `address` varchar(45) COLLATE utf8mb4_general_ci NOT NULL,
  `blockscout` smallint(1) DEFAULT '0',
  `verified` smallint(1) DEFAULT '0',
  `checked` smallint(1) DEFAULT '0',
  `failed` smallint(1) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18977 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
