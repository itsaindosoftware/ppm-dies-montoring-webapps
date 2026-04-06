-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               8.0.30 - MySQL Community Server - GPL
-- Server OS:                    Win64
-- HeidiSQL Version:             12.11.0.7065
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for ppm_dies_monitoring
CREATE DATABASE IF NOT EXISTS `ppm_dies_monitoring` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;
USE `ppm_dies_monitoring`;

-- Dumping structure for table ppm_dies_monitoring.users
CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nik` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'production',
  `photo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `remember_token` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  UNIQUE KEY `users_nik_unique` (`nik`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table ppm_dies_monitoring.users: ~10 rows (approximately)
DELETE FROM `users`;
INSERT INTO `users` (`id`, `name`, `nik`, `email`, `role`, `photo`, `is_active`, `email_verified_at`, `password`, `remember_token`, `created_at`, `updated_at`) VALUES
	(1, 'Administrator', '000.00.00', 'admin@gmail.com', 'admin', 'photos/users/BOlil4n4GgP1sh3RupmbDJQehjlNsUhS1dgGCpxH.jpg', 1, NULL, '$2y$12$AZRbOyrHCJIzJMkef/OC4OOokyjCG8IxSrRgFKx8iIE.M.zKv5n7C', NULL, '2026-01-21 10:42:09', '2026-03-09 23:53:20'),
	(2, 'Rydha Ramlan Gunawan', '243.09.10', 'maintenance.dies@thaisummit.co.id', 'mtn_dies', NULL, 1, NULL, '$2y$12$x.59xKVhZKzu3mrMQepGKupPeAwH2LJLEOZ88N6VfhyEg96ww5rc.', 'RvT62uxl0EtbSlihll6keg9Ljc94FJJNkiXAbOT61R6ofjIbubKrxaSItahC', '2026-01-21 20:14:36', '2026-03-13 01:48:23'),
	(3, 'Yadi Heryadi', '072.05.08', 'production.eng@thaisummit.co.id', 'pe', 'photos/users/KKUo96jmJS04AepaPbN5LTVZi1tIbRcqziN8mGZn.jpg', 1, NULL, '$2y$12$AZRbOyrHCJIzJMkef/OC4OOokyjCG8IxSrRgFKx8iIE.M.zKv5n7C', NULL, '2026-01-21 20:25:16', '2026-03-09 23:44:38'),
	(4, 'Pakpoom Luedee', '838.01.23', 'testing@thaisummit.co.id', 'md', NULL, 1, NULL, '$2y$12$j1mhiV7NfS6YTuiqZYZx..2G4GeF9UERKsVdDTl2AAB88S7ZLcTEa', NULL, '2026-01-30 01:16:02', '2026-03-11 19:34:11'),
	(5, 'Sakti Oktaviani', '941.03.25', 'ppic-09@thaisummit.co.id', 'ppic', NULL, 1, NULL, '$2y$12$UYydkLbn7.Xq70IyR6LweeZmlIyH9471Jr8NQ2psGKoJtKPaeiQmK', NULL, '2026-02-15 20:46:47', '2026-03-16 05:04:43'),
	(7, 'Indriani', '578.09.13', 'production-02@thaisummit.co.id', 'production', 'photos/users/JyRmLeN8N6Wz1tVT6U5gXOK7QetdwAfIhjuQn4TG.png', 1, NULL, '$2y$12$0MPww6BCw/Imaj.pr1hekOKCo5UbHg.w7/vFSOFw4tyU1CZOTvO5y', 'jUZooD9gtwwG2AAbb3e2Vsy7cBwRs0YCj7ee1VN1NDJIPHgik00lBcR7wZI9', '2026-03-09 00:24:55', '2026-03-09 23:44:17'),
	(8, 'Didin Jahrudin', '630.07.14', 'it-01@thaisummit.co.id', 'admin', NULL, 1, NULL, '$2y$12$5vAWuSSz5skbf5mHnQTxx.b2dutyVzW9hUbvphwftn8FrgiJwIik6', NULL, '2026-03-09 00:26:13', '2026-03-09 00:26:13'),
	(9, 'Wildan Fathur Rohman', '943.04.25', 'it-03@thaisummit.co.id', 'production', 'photos/users/J9rGjSQiNmW2drCaFA9PHf2QB0uDUXj31bQPV9vP.jpg', 1, NULL, '$2y$12$f3Izh661VP9L1fScmsBDN.WnnaXM.YhpJUvni3QzeDV8kIhF5tQ3G', NULL, '2026-03-09 23:22:23', '2026-03-09 23:22:23'),
	(10, 'Idham Basir', '631.08.14', 'testing2@thaisummit.co.id', 'mgr_gm', 'photos/users/k4TXLPmJXqjlslgL1YiDvQbSnw5cPSxeRnU31xdB.jpg', 1, NULL, '$2y$12$IY0VQm2l5aARhY0IE602Zuq/iC0PZFPNvErStqsWbDP5DHN.2rKma', NULL, '2026-03-09 23:46:36', '2026-03-09 23:47:19'),
	(11, 'Iyan Supadiyanto', '606.10.13', 'production-01@thaisummit.co.id', 'pe', 'photos/users/3BvQDCI3ERb4ajHyGHvNxfx3eJCiiLE9tKy0OXFC.jpg', 1, NULL, '$2y$12$XHZkKfEQHLgYK196./TPr..vxaDFq3oR7HxLo/VZafYI2NvsKQb9y', NULL, '2026-03-09 23:48:16', '2026-03-09 23:48:16');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
