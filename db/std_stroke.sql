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
CREATE DATABASE IF NOT EXISTS `ppm_dies_monitoring` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `ppm_dies_monitoring`;

-- Dumping structure for table ppm_dies_monitoring.tonnage_standards
CREATE TABLE IF NOT EXISTS `tonnage_standards` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tonnage` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `grade` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `standard_stroke` int NOT NULL,
  `lot_size` int NOT NULL DEFAULT '2500',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table ppm_dies_monitoring.tonnage_standards: ~4 rows (approximately)
DELETE FROM `tonnage_standards`;
INSERT INTO `tonnage_standards` (`id`, `tonnage`, `grade`, `type`, `standard_stroke`, `lot_size`, `description`, `created_at`, `updated_at`) VALUES
	(1, '1200T', 'D', 'Tandem Auto', 5000, 600, '1200 Ton Press - Grade D', '2026-01-21 10:41:16', '2026-03-03 19:48:57'),
	(3, '250T Progressive', 'A', 'Progressive', 10000, 600, '250T Progressive - Grade A', '2026-01-21 10:41:16', '2026-03-03 19:54:35'),
	(4, '250T', 'B', 'Tandem', 7000, 600, '250 Ton Press - Grade B (Tandem)', '2026-01-21 10:41:16', '2026-03-03 19:55:22'),
	(5, '800T', 'C', 'Tandem Auto', 7000, 600, NULL, '2026-03-03 19:45:17', '2026-03-03 19:45:17');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
