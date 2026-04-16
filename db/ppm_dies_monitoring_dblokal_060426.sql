-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               5.7.24 - MySQL Community Server (GPL)
-- Server OS:                    Win64
-- HeidiSQL Version:             12.5.0.6677
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for portal-itsa
CREATE DATABASE IF NOT EXISTS `portal-itsa` /*!40100 DEFAULT CHARACTER SET utf8mb4 */;
USE `portal-itsa`;

-- Dumping structure for table portal-itsa.asset_tf_notif
CREATE TABLE IF NOT EXISTS `asset_tf_notif` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `reg_fixed_asset_id` int(10) unsigned NOT NULL,
  `from_qty` int(11) DEFAULT NULL,
  `from_date_of_tf` datetime DEFAULT NULL,
  `from_io_no` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `to_receiving_dept_id` int(10) unsigned DEFAULT NULL,
  `to_cost_center_id` int(10) unsigned DEFAULT NULL,
  `to_location_id` int(10) unsigned DEFAULT NULL,
  `to_detail_area` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `to_qty` int(11) DEFAULT NULL,
  `to_pic_name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `to_effective_date` date DEFAULT NULL,
  `to_tf_fer_no_erp` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pic_support` text COLLATE utf8mb4_unicode_ci,
  `created_by` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_by` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `approval_by1` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `approval_date1` datetime DEFAULT NULL,
  `approval_status1` enum('0','1','2') COLLATE utf8mb4_unicode_ci DEFAULT '0',
  `remark_by1` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `approval_by2` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `approval_date2` datetime DEFAULT NULL,
  `approval_status2` enum('0','1','2') COLLATE utf8mb4_unicode_ci DEFAULT '0',
  `remark_by2` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `approval_by3` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `approval_date3` datetime DEFAULT NULL,
  `approval_status3` enum('0','1','2') COLLATE utf8mb4_unicode_ci DEFAULT '0',
  `remark_by3` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `approval_by4` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `approval_date4` datetime DEFAULT NULL,
  `approval_status4` enum('0','1','2') COLLATE utf8mb4_unicode_ci DEFAULT '0',
  `remark_by4` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `approval_by5` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `approval_date5` datetime DEFAULT NULL,
  `approval_status5` enum('0','1','2') COLLATE utf8mb4_unicode_ci DEFAULT '0',
  `remark_by5` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `approval_by6` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `approval_date6` datetime DEFAULT NULL,
  `approval_status6` enum('0','1','2') COLLATE utf8mb4_unicode_ci DEFAULT '0',
  `remark_by6` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table portal-itsa.asset_tf_notif: ~0 rows (approximately)

-- Dumping structure for table portal-itsa.companys
CREATE TABLE IF NOT EXISTS `companys` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `company_desc` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table portal-itsa.companys: ~2 rows (approximately)
REPLACE INTO `companys` (`id`, `company_desc`, `created_at`, `updated_at`) VALUES
	(1, 'Indonesia Thai Summit Auto', '2025-05-06 02:56:13', '2025-05-05 23:34:53'),
	(2, 'Indonesia Thai Summit Plastech', '2025-05-06 02:56:30', NULL);

-- Dumping structure for table portal-itsa.departments
CREATE TABLE IF NOT EXISTS `departments` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `description` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table portal-itsa.departments: ~20 rows (approximately)
REPLACE INTO `departments` (`id`, `description`, `created_at`, `updated_at`) VALUES
	(1, 'Accounting/Finance/CIC', '2025-05-06 02:55:22', NULL),
	(2, 'HQ Office', '2025-05-06 02:55:23', NULL),
	(3, 'HR/GA/HSE', '2025-05-06 02:55:24', NULL),
	(4, 'Maintenance', '2025-05-06 02:55:24', '2026-03-02 06:37:45'),
	(5, 'Marketing', '2025-05-06 02:55:25', NULL),
	(6, 'Production', '2025-05-06 02:55:26', NULL),
	(7, 'Engineering & MERD', '2025-05-06 02:55:26', NULL),
	(8, 'Purchasing', '2025-05-06 02:55:27', NULL),
	(9, 'Quality Assurance', '2025-05-06 02:55:28', NULL),
	(10, 'SYD/IT', '2025-05-06 02:55:29', NULL),
	(11, 'PPIC & SND (Outbound)', '2025-05-06 02:55:29', NULL),
	(12, 'PPIC & SND', '2025-05-06 02:55:30', NULL),
	(13, 'Maintenance Dies\r\n', '2025-05-06 02:55:31', NULL),
	(14, 'Production Engineering', '2025-05-06 02:55:32', NULL),
	(15, 'Personal Assistant', '2025-05-06 02:55:33', NULL),
	(16, 'Warehouse Delivery', '2025-05-06 02:55:33', '2026-03-03 05:52:03'),
	(17, 'PPIC', '2025-05-06 02:55:34', NULL),
	(18, 'Managing Director', '2025-06-17 09:11:59', '2026-03-03 07:24:46'),
	(21, 'Rack Center', '2026-03-03 04:40:34', '2026-03-03 04:40:34'),
	(22, 'Assembly Plant 1', '2026-03-03 08:40:33', '2026-03-03 08:40:33');

-- Dumping structure for table portal-itsa.distribution_dar_depts
CREATE TABLE IF NOT EXISTS `distribution_dar_depts` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `dept_id` bigint(20) DEFAULT NULL,
  `reqdar_id` bigint(20) DEFAULT NULL,
  `master_docs_id` bigint(20) DEFAULT NULL,
  `effective_date` date DEFAULT NULL,
  `current_status` enum('pending','distributed','received','returned','overdue') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `last_action_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table portal-itsa.distribution_dar_depts: ~15 rows (approximately)
REPLACE INTO `distribution_dar_depts` (`id`, `dept_id`, `reqdar_id`, `master_docs_id`, `effective_date`, `current_status`, `last_action_date`, `created_at`, `updated_at`) VALUES
	(1, 9, NULL, 2, '2025-08-14', NULL, NULL, '2025-08-13 04:35:03', NULL),
	(2, 13, NULL, 2, '2025-08-14', NULL, '2025-09-02', '2025-08-13 04:35:03', '2025-09-02 06:15:53'),
	(3, 9, NULL, 3, '2025-08-14', NULL, NULL, '2025-08-13 06:40:14', NULL),
	(4, 13, NULL, 3, '2025-08-14', NULL, '2025-09-02', '2025-08-13 06:40:14', '2025-09-02 06:15:53'),
	(14, 4, 3, 7, '2025-08-20', 'received', NULL, '2025-08-19 09:21:57', '2025-09-03 03:38:50'),
	(15, 9, 3, 7, '2025-08-20', 'returned', NULL, '2025-08-19 09:21:57', '2025-09-03 04:57:51'),
	(16, 13, 3, 7, '2025-08-20', 'received', NULL, '2025-08-19 09:21:57', '2025-09-03 03:34:24'),
	(17, 6, NULL, 8, '2024-12-30', 'pending', NULL, '2026-02-23 06:57:27', NULL),
	(20, 12, NULL, 11, '2024-04-25', 'pending', NULL, '2026-02-25 02:00:34', NULL),
	(21, 7, NULL, 12, '2024-11-08', 'pending', NULL, '2026-02-25 02:02:55', NULL),
	(22, 12, NULL, 13, '2024-07-11', 'pending', NULL, '2026-02-25 02:03:48', NULL),
	(24, 12, NULL, 15, '2024-12-05', 'pending', NULL, '2026-02-25 02:05:44', NULL),
	(25, 5, NULL, 16, '2025-03-12', 'pending', NULL, '2026-02-25 02:07:04', NULL),
	(26, 9, NULL, 17, '2024-06-06', 'pending', NULL, '2026-02-25 02:07:43', NULL),
	(28, 10, NULL, 19, '2024-05-03', 'pending', NULL, '2026-02-25 03:52:35', NULL);

-- Dumping structure for table portal-itsa.document_control_logs
CREATE TABLE IF NOT EXISTS `document_control_logs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `distribution_id` bigint(20) unsigned NOT NULL,
  `request_dar_id` bigint(20) unsigned NOT NULL,
  `dept_id` bigint(20) unsigned NOT NULL,
  `action_type` enum('distributed','received','returned','overdue') COLLATE utf8mb4_unicode_ci NOT NULL,
  `action_date` date NOT NULL,
  `receiver_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `receiver_signature` text COLLATE utf8mb4_unicode_ci COMMENT 'base64 atau path file',
  `position` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `return_receiver` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `return_date` date DEFAULT NULL,
  `prepared_by` text COLLATE utf8mb4_unicode_ci,
  `prepared_date` date DEFAULT NULL,
  `approved_by` text COLLATE utf8mb4_unicode_ci,
  `approved_date` date DEFAULT NULL,
  `remarks` text COLLATE utf8mb4_unicode_ci,
  `created_by` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `document_control_logs_distribution_id_index` (`distribution_id`),
  KEY `document_control_logs_request_dar_id_index` (`request_dar_id`),
  KEY `document_control_logs_dept_id_index` (`dept_id`),
  KEY `document_control_logs_action_type_index` (`action_type`),
  KEY `document_control_logs_action_date_index` (`action_date`),
  CONSTRAINT `document_control_logs_dept_id_foreign` FOREIGN KEY (`dept_id`) REFERENCES `departments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `document_control_logs_distribution_id_foreign` FOREIGN KEY (`distribution_id`) REFERENCES `distribution_dar_depts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `document_control_logs_request_dar_id_foreign` FOREIGN KEY (`request_dar_id`) REFERENCES `request_dar` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table portal-itsa.document_control_logs: ~3 rows (approximately)
REPLACE INTO `document_control_logs` (`id`, `distribution_id`, `request_dar_id`, `dept_id`, `action_type`, `action_date`, `receiver_name`, `receiver_signature`, `position`, `return_receiver`, `return_date`, `prepared_by`, `prepared_date`, `approved_by`, `approved_date`, `remarks`, `created_by`, `created_at`, `updated_at`) VALUES
	(8, 15, 3, 9, 'returned', '2025-09-03', 'Abiyansyah Nur Pratama', 'signatures/received_signatures/signature_1756869072_68b7b1d0d3eed.png', 'Manager', 'signatures/returned_signatures/signature_1756875471_68b7cacf5998a.png', '2025-09-03', 'signatures/prepared_signatures/signature_1756871212_68b7ba2c26f83.png', '2025-09-03', 'signatures/approved_signatures/signature_1756871359_68b7babf73482.png', '2025-09-03', NULL, '17', '2025-09-03 03:11:12', '2025-09-03 04:57:51'),
	(9, 16, 3, 13, 'received', '2025-09-03', 'Ma\'mun Murod Ashari', 'signatures/received_signatures/signature_1756870413_68b7b70d270ff.png', 'Manager', NULL, NULL, 'signatures/prepared_signatures/signature_1756871212_68b7ba2c26f83.png', '2025-09-03', 'signatures/approved_signatures/signature_1756871359_68b7babf73482.png', '2025-09-03', NULL, '20', '2025-09-03 03:33:33', '2025-09-03 03:49:19'),
	(10, 14, 3, 4, 'received', '2025-09-03', 'User PLA', 'signatures/received_signatures/signature_1756870679_68b7b817c77ca.png', 'Manager', NULL, NULL, 'signatures/prepared_signatures/signature_1756871212_68b7ba2c26f83.png', '2025-09-03', 'signatures/approved_signatures/signature_1756871359_68b7babf73482.png', '2025-09-03', NULL, '24', '2025-09-03 03:37:59', '2025-09-03 03:49:19');

-- Dumping structure for table portal-itsa.failed_jobs
CREATE TABLE IF NOT EXISTS `failed_jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table portal-itsa.failed_jobs: ~0 rows (approximately)

-- Dumping structure for table portal-itsa.master_asset_cost_centers
CREATE TABLE IF NOT EXISTS `master_asset_cost_centers` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `cost_center_name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cost_center_code` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `company_id` int(12) NOT NULL DEFAULT '0',
  `created_by` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_by` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=490 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table portal-itsa.master_asset_cost_centers: ~207 rows (approximately)
REPLACE INTO `master_asset_cost_centers` (`id`, `cost_center_name`, `cost_center_code`, `company_id`, `created_by`, `updated_by`, `created_at`, `updated_at`) VALUES
	(35, 'HQ OFFICE', '60003000', 1, 'admin', NULL, NULL, NULL),
	(36, 'Administration', '60030000', 1, 'admin', NULL, NULL, NULL),
	(37, 'MD OFFICE', '60036000', 1, 'admin', NULL, NULL, NULL),
	(38, 'Accounting & Finance', '60041300', 1, 'admin', NULL, NULL, NULL),
	(39, 'Purchasing', '60041400', 1, 'admin', NULL, NULL, NULL),
	(40, 'HRGA & LEGAL', '60041500', 1, 'admin', NULL, NULL, NULL),
	(41, 'CIC', '60041600', 1, 'admin', NULL, NULL, NULL),
	(42, 'IT & System Development', '60041700', 1, 'admin', NULL, NULL, NULL),
	(43, 'Marketing', '60043000', 1, 'admin', NULL, NULL, NULL),
	(44, 'HRM CENTER', '60090001', 1, 'admin', NULL, NULL, NULL),
	(45, 'PLANT CENTER', '60090002', 1, 'admin', NULL, NULL, NULL),
	(46, 'Logistic & Sale', '61032000', 1, 'admin', NULL, NULL, NULL),
	(47, 'Engineering', '61034000', 1, 'admin', NULL, NULL, NULL),
	(48, 'Inbound Section', '61042010', 1, 'admin', NULL, NULL, NULL),
	(49, 'Outbound Section', '61042020', 1, 'admin', NULL, NULL, NULL),
	(50, 'Quality Assurance', '61044100', 1, 'admin', NULL, NULL, NULL),
	(51, 'Project Engineering', '61045000', 1, 'admin', NULL, NULL, NULL),
	(52, 'Maintenance', '61045600', 1, 'admin', NULL, NULL, NULL),
	(53, 'Press Production', '61046100', 1, 'admin', NULL, NULL, NULL),
	(54, 'Assembly A', '61047010', 1, 'admin', NULL, NULL, NULL),
	(55, 'Assembly B', '61047020', 1, 'admin', NULL, NULL, NULL),
	(56, 'Sale', '61052100', 1, 'admin', NULL, NULL, NULL),
	(57, 'Material Plan&SupllierControl', '61052210', 1, 'admin', NULL, NULL, NULL),
	(58, 'Production Planning', '61052220', 1, 'admin', NULL, NULL, NULL),
	(59, 'Store', '61052400', 1, 'admin', NULL, NULL, NULL),
	(60, 'Warehouse&Delivery', '61052600', 1, 'admin', NULL, NULL, NULL),
	(61, 'Rack Center', '61052800', 1, 'admin', NULL, NULL, NULL),
	(62, 'Customer Quality Service - CQS', '61054100', 1, 'admin', NULL, NULL, NULL),
	(63, 'Incoming Quality Assurance-IQA', '61054110', 1, 'admin', NULL, NULL, NULL),
	(64, 'Process Quality Assurance -PQA', '61054170', 1, 'admin', NULL, NULL, NULL),
	(65, 'Final Quality Assurance - FQA', '61054180', 1, 'admin', NULL, NULL, NULL),
	(66, 'NewProj.Quality Assurance-NQA', '61054190', 1, 'admin', NULL, NULL, NULL),
	(67, 'Production Engineering', '61054600', 1, 'admin', NULL, NULL, NULL),
	(68, 'Project Engineering 1', '61055010', 1, 'admin', NULL, NULL, NULL),
	(69, 'Project Engineering 2', '61055020', 1, 'admin', NULL, NULL, NULL),
	(70, 'Project Engineering 3', '61055030', 1, 'admin', NULL, NULL, NULL),
	(71, 'MERD Tooling Cost', '61055090', 1, 'admin', NULL, NULL, NULL),
	(72, 'Die Maintenance', '61055910', 1, 'admin', NULL, NULL, NULL),
	(73, 'Press Line C - 250T', '61056130', 1, 'admin', NULL, NULL, NULL),
	(74, 'Press Line A - 800T', '61056210', 1, 'admin', NULL, NULL, NULL),
	(75, 'Press Line B - 1200T', '61056230', 1, 'admin', NULL, NULL, NULL),
	(76, 'AssyL.A1-StationarySpotWelding', '61057110', 1, 'admin', NULL, NULL, NULL),
	(77, 'Assy Line A2 - Robot Spot', '61057120', 1, 'admin', NULL, NULL, NULL),
	(78, 'Assy Line A3 - Assembly', '61057130', 1, 'admin', NULL, NULL, NULL),
	(79, 'AssyL.B1-StationarySpotWelding', '61057210', 1, 'admin', NULL, NULL, NULL),
	(80, 'Assy Line B2 - Robot Spot', '61057220', 1, 'admin', NULL, NULL, NULL),
	(81, 'Assy Line B3 - Sealer Machine', '61057230', 1, 'admin', NULL, NULL, NULL),
	(82, 'Assy Line B4 - Stud Welding', '61057240', 1, 'admin', NULL, NULL, NULL),
	(83, 'Store Raw Material', '61062410', 1, 'admin', NULL, NULL, NULL),
	(84, 'Store Semi', '61062430', 1, 'admin', NULL, NULL, NULL),
	(85, 'C1 - Press 250T Progressive', '61066131', 1, 'admin', NULL, NULL, NULL),
	(86, 'C2 - Press 250T Tandem', '61066132', 1, 'admin', NULL, NULL, NULL),
	(87, 'C3 - Press 250T Tandam', '61066133', 1, 'admin', NULL, NULL, NULL),
	(88, 'C4 - Press 250T Tandem', '61066134', 1, 'admin', NULL, NULL, NULL),
	(89, 'C5 - Press 250T Tandem', '61066135', 1, 'admin', NULL, NULL, NULL),
	(90, 'C6 - Press 250T Tandem', '61066136', 1, 'admin', NULL, NULL, NULL),
	(91, 'A1 - Press 800T', '61066211', 1, 'admin', NULL, NULL, NULL),
	(92, 'A2 - Press 800T', '61066212', 1, 'admin', NULL, NULL, NULL),
	(93, 'A3 - Press 500T', '61066213', 1, 'admin', NULL, NULL, NULL),
	(94, 'A4 - Press 500T', '61066214', 1, 'admin', NULL, NULL, NULL),
	(95, 'A5 - Press 500T', '61066215', 1, 'admin', NULL, NULL, NULL),
	(96, 'B1 - Press 1200T', '61066231', 1, 'admin', NULL, NULL, NULL),
	(97, 'B2 - Press 800T', '61066232', 1, 'admin', NULL, NULL, NULL),
	(98, 'B3 - Press 500T', '61066233', 1, 'admin', NULL, NULL, NULL),
	(99, 'B4 - Press 500T', '61066234', 1, 'admin', NULL, NULL, NULL),
	(100, 'A1.1 Spot Weld', '61067111', 1, 'admin', NULL, NULL, NULL),
	(101, 'A1.2 Spot Nut', '61067112', 1, 'admin', NULL, NULL, NULL),
	(102, 'A1.3 Spot Bolt', '61067113', 1, 'admin', NULL, NULL, NULL),
	(103, 'A2.1 Robot Welding', '61067121', 1, 'admin', NULL, NULL, NULL),
	(104, 'A2.2 Robot Spot Welding', '61067122', 1, 'admin', NULL, NULL, NULL),
	(105, 'A3.1 BendPress PiercingDrill', '61067131', 1, 'admin', NULL, NULL, NULL),
	(106, 'A3.2 CNC Drill Chamfering', '61067132', 1, 'admin', NULL, NULL, NULL),
	(107, 'A3.3 Bushing Caulking', '61067133', 1, 'admin', NULL, NULL, NULL),
	(108, 'A3.4 Buffing Touch up', '61067134', 1, 'admin', NULL, NULL, NULL),
	(109, 'A3.5 Apply Grease Inspection', '61067135', 1, 'admin', NULL, NULL, NULL),
	(110, 'B1.1 Spot Nut', '61067211', 1, 'admin', NULL, NULL, NULL),
	(111, 'B1.2 Spot Bolt', '61067212', 1, 'admin', NULL, NULL, NULL),
	(112, 'B2.1 Robot Spot Welding', '61067221', 1, 'admin', NULL, NULL, NULL),
	(113, 'B2.2 Pad Gun Spot', '61067222', 1, 'admin', NULL, NULL, NULL),
	(114, 'B3.1 Robot Sealer', '61067231', 1, 'admin', NULL, NULL, NULL),
	(115, 'B3.2 Manual Sealer', '61067232', 1, 'admin', NULL, NULL, NULL),
	(116, 'B4.1 Manual Stud Bolt', '61067241', 1, 'admin', NULL, NULL, NULL),
	(117, 'Production', '61836000', 1, 'admin', NULL, NULL, NULL),
	(366, 'HQ OFFICE', '60603000', 2, 'admin', NULL, NULL, NULL),
	(367, 'ADMINISTRATION', '60630000', 2, 'admin', NULL, NULL, NULL),
	(368, 'Engineering (Project Eng.)', '60634000', 2, 'admin', NULL, NULL, NULL),
	(369, 'MANUFACTURING OFFICE (CEO)', '60636000', 2, 'admin', NULL, NULL, NULL),
	(370, 'Accounting Sec', '60641300', 2, 'admin', NULL, NULL, NULL),
	(371, 'Purchasing Sec', '60641400', 2, 'admin', NULL, NULL, NULL),
	(372, 'HR&GA Sec', '60641500', 2, 'admin', NULL, NULL, NULL),
	(373, 'Central Inventory Control(CIC)', '60641600', 2, 'admin', NULL, NULL, NULL),
	(374, 'System Development Sec', '60641800', 2, 'admin', NULL, NULL, NULL),
	(375, 'Logistic Sec', '60642000', 2, 'admin', NULL, NULL, NULL),
	(376, 'Ware house & Delivery Sec', '60642900', 2, 'admin', NULL, NULL, NULL),
	(377, 'Sales & Mkt Sec', '6064300', 2, 'admin', NULL, NULL, NULL),
	(378, 'Marketing Sec', '60643000', 2, 'admin', NULL, NULL, NULL),
	(379, 'QA Sec', '60644100', 2, 'admin', NULL, NULL, NULL),
	(380, 'QA KIIC Div.', '60644101', 2, 'admin', NULL, NULL, NULL),
	(381, 'Eng. 1 - Others Customers (TMM', '60645010', 2, 'admin', NULL, NULL, NULL),
	(382, 'Eng. 2 - MMKI 1', '60645020', 2, 'admin', NULL, NULL, NULL),
	(383, 'Eng. 3 - MMKI 2', '60645030', 2, 'admin', NULL, NULL, NULL),
	(384, 'Eng. 4 - Engineering Design', '60645040', 2, 'admin', NULL, NULL, NULL),
	(385, 'Maintenance', '60645600', 2, 'admin', NULL, NULL, NULL),
	(386, 'Purchasing Div', '60651400', 2, 'admin', NULL, NULL, NULL),
	(387, 'HR&GA Div', '60651500', 2, 'admin', NULL, NULL, NULL),
	(388, 'PPIC Div', '60652010', 2, 'admin', NULL, NULL, NULL),
	(389, 'Sales', '60652100', 2, 'admin', NULL, NULL, NULL),
	(390, 'Ware house KIIC Div', '60652601', 2, 'admin', NULL, NULL, NULL),
	(391, 'Ware house GIIC Div', '60652602', 2, 'admin', NULL, NULL, NULL),
	(392, 'Rack center Div', '60652800', 2, 'admin', NULL, NULL, NULL),
	(393, 'Marketing Div', '60653000', 2, 'admin', NULL, NULL, NULL),
	(394, 'Marketing', '60653100', 2, 'admin', NULL, NULL, NULL),
	(395, 'QA 1 - KIIC Div', '60654101', 2, 'admin', NULL, NULL, NULL),
	(396, 'QA 1 - GIIC Div', '60654102', 2, 'admin', NULL, NULL, NULL),
	(397, 'Eng. 1 - Others Customers (TMM', '60655011', 2, 'admin', NULL, NULL, NULL),
	(398, 'Engineering 2 Div - MMKI', '60655020', 2, 'admin', NULL, NULL, NULL),
	(399, 'Eng. 2 - IP (MMKI 1)', '60655021', 2, 'admin', NULL, NULL, NULL),
	(400, 'Eng. 2 - Console (MMKI 1)', '60655022', 2, 'admin', NULL, NULL, NULL),
	(401, 'Eng. 2 - Exterior (MMKI 1)', '60655023', 2, 'admin', NULL, NULL, NULL),
	(402, 'Engineering 3 Div - HMMI', '60655030', 2, 'admin', NULL, NULL, NULL),
	(403, 'Eng. 3 - DT (MMKI 2)', '60655031', 2, 'admin', NULL, NULL, NULL),
	(404, 'Eng. 3 - RT & Others (MMKI 2)', '60655032', 2, 'admin', NULL, NULL, NULL),
	(405, 'Eng. 4 - Eng. Design', '60655041', 2, 'admin', NULL, NULL, NULL),
	(406, 'Utility Maintenance Div', '60655600', 2, 'admin', NULL, NULL, NULL),
	(407, 'Mold Maintnance Div', '60655910', 2, 'admin', NULL, NULL, NULL),
	(408, 'IT&SYD Section (KIIC)', '60661801', 2, 'admin', NULL, NULL, NULL),
	(409, 'Sales Section', '60662100', 2, 'admin', NULL, NULL, NULL),
	(410, 'Planning', '60662200', 2, 'admin', NULL, NULL, NULL),
	(411, 'Store 1 - KIIC', '60662401', 2, 'admin', NULL, NULL, NULL),
	(412, 'Store 2 - GIIC', '60662402', 2, 'admin', NULL, NULL, NULL),
	(413, 'WH - MMKI regular part', '60662611', 2, 'admin', NULL, NULL, NULL),
	(414, 'WH - MMKI', '60662612', 2, 'admin', NULL, NULL, NULL),
	(415, 'WH - KD & Spare parts', '60662621', 2, 'admin', NULL, NULL, NULL),
	(416, 'WH - HMMI', '60662622', 2, 'admin', NULL, NULL, NULL),
	(417, 'WH - TMMIN', '60662631', 2, 'admin', NULL, NULL, NULL),
	(418, 'WH - 2W', '60662632', 2, 'admin', NULL, NULL, NULL),
	(419, 'Supplier Improvement (SIP)', '60662800', 2, 'admin', NULL, NULL, NULL),
	(420, 'Rack center 1 -  KIIC', '60662801', 2, 'admin', NULL, NULL, NULL),
	(421, 'Rack center 2 - GIIC', '60662802', 2, 'admin', NULL, NULL, NULL),
	(422, 'QA 1 - Incoming', '60664111', 2, 'admin', NULL, NULL, NULL),
	(423, 'QA 2 - Incoming', '60664112', 2, 'admin', NULL, NULL, NULL),
	(424, 'QA 1 - In-process', '60664171', 2, 'admin', NULL, NULL, NULL),
	(425, 'QA 2 - In-process', '60664172', 2, 'admin', NULL, NULL, NULL),
	(426, 'QA 1 - Final', '60664181', 2, 'admin', NULL, NULL, NULL),
	(427, 'QA 2 - Final', '60664182', 2, 'admin', NULL, NULL, NULL),
	(428, 'QA 1 - New model', '60664191', 2, 'admin', NULL, NULL, NULL),
	(429, 'QA 2 - New model', '60664192', 2, 'admin', NULL, NULL, NULL),
	(430, 'HRM Center', '60690001', 2, 'admin', NULL, NULL, NULL),
	(431, 'Plant 1 - KIIC', '6163600', 2, 'admin', NULL, NULL, NULL),
	(432, 'Production Plant 1 - KIIC', '61646010', 2, 'admin', NULL, NULL, NULL),
	(433, 'Injection 1', '61656100', 2, 'admin', NULL, NULL, NULL),
	(434, 'Assembly 1.1 - MMKI', '61657100', 2, 'admin', NULL, NULL, NULL),
	(435, 'Asembly 1.2 - Other Customer', '61657200', 2, 'admin', NULL, NULL, NULL),
	(436, 'Painting 1', '61657500', 2, 'admin', NULL, NULL, NULL),
	(437, 'Injection 1 -  450-550T', '61666170', 2, 'admin', NULL, NULL, NULL),
	(438, 'Laser Score & Welding', '61666180', 2, 'admin', NULL, NULL, NULL),
	(439, 'Injection 1 - 650-850T', '61666190', 2, 'admin', NULL, NULL, NULL),
	(440, 'Injection 1 - 1300T', '61666210', 2, 'admin', NULL, NULL, NULL),
	(441, 'Injection 1 -  2500T', '61666240', 2, 'admin', NULL, NULL, NULL),
	(442, 'Assy Line I/P', '61667110', 2, 'admin', NULL, NULL, NULL),
	(443, 'Assy Line Glove Box', '61667120', 2, 'admin', NULL, NULL, NULL),
	(444, 'Assy Line Trim QTR LWR', '61667130', 2, 'admin', NULL, NULL, NULL),
	(445, 'Assy Line Trim QTR UPR', '61667140', 2, 'admin', NULL, NULL, NULL),
	(446, 'Assy 1 - Finish/Lid', '61667150', 2, 'admin', NULL, NULL, NULL),
	(447, 'Assy Line - General Part', '61667160', 2, 'admin', NULL, NULL, NULL),
	(448, 'Assy Line TMMIN', '61667210', 2, 'admin', NULL, NULL, NULL),
	(449, 'Assy Line Honda', '61667220', 2, 'admin', NULL, NULL, NULL),
	(450, 'Loading & Wipping', '61667510', 2, 'admin', NULL, NULL, NULL),
	(451, 'Painting', '61667520', 2, 'admin', NULL, NULL, NULL),
	(452, 'Painting - Silver', '61667530', 2, 'admin', NULL, NULL, NULL),
	(453, 'Painting - Piano Black', '61667540', 2, 'admin', NULL, NULL, NULL),
	(454, 'Buffing', '61667550', 2, 'admin', NULL, NULL, NULL),
	(455, 'PLANT 1 CENTER', '61690002', 2, 'admin', NULL, NULL, NULL),
	(456, 'Dummy Plant 1', '61699000', 2, 'admin', NULL, NULL, NULL),
	(457, 'Plant 2 - GIIC', '6263600', 2, 'admin', NULL, NULL, NULL),
	(458, 'Plant 2 - GIIC', '62636000', 2, 'admin', NULL, NULL, NULL),
	(459, 'Production Plant 2 - GIIC', '62646020', 2, 'admin', NULL, NULL, NULL),
	(460, 'Injection 2.1 - HMMI', '62656100', 2, 'admin', NULL, NULL, NULL),
	(461, 'Injection 2.2 - MMKI', '62656200', 2, 'admin', NULL, NULL, NULL),
	(462, 'Assembly 2', '62657200', 2, 'admin', NULL, NULL, NULL),
	(463, 'Assembly 2.1 - MMKI', '62657210', 2, 'admin', NULL, NULL, NULL),
	(464, 'Assembly 2.2 - HMMI', '62657300', 2, 'admin', NULL, NULL, NULL),
	(465, 'Assembly 2.3 - Other', '62657400', 2, 'admin', NULL, NULL, NULL),
	(466, 'Production 2W Div', '62657700', 2, 'admin', NULL, NULL, NULL),
	(467, 'Seat Assembly Section', '62657710', 2, 'admin', NULL, NULL, NULL),
	(468, 'Injection 2.1- 1800T', '62666220', 2, 'admin', NULL, NULL, NULL),
	(469, 'Injection 2.2-1800T', '62666230', 2, 'admin', NULL, NULL, NULL),
	(470, 'Injection 2.2- 2500T', '62666240', 2, 'admin', NULL, NULL, NULL),
	(471, 'Injection 2.1- 3000T', '62666250', 2, 'admin', NULL, NULL, NULL),
	(472, 'Injection 2.2- 3000T', '62666260', 2, 'admin', NULL, NULL, NULL),
	(473, 'Emblem Drilling', '62666300', 2, 'admin', NULL, NULL, NULL),
	(474, 'Seat Assembly', '62667110', 2, 'admin', NULL, NULL, NULL),
	(475, 'Assy 2.1  Line Garnih FR Deck', '62667220', 2, 'admin', NULL, NULL, NULL),
	(476, 'Assy 2.1 Line Box Cargo', '62667230', 2, 'admin', NULL, NULL, NULL),
	(477, 'Assy 2.1 Line Trim Tail Gate', '62667240', 2, 'admin', NULL, NULL, NULL),
	(478, 'Assy 2.1 Line Console', '62667250', 2, 'admin', NULL, NULL, NULL),
	(479, 'Assy 2.1 Line Door Trim', '62667260', 2, 'admin', NULL, NULL, NULL),
	(480, 'Assy 2.1 Line Trim QTR LWR', '62667270', 2, 'admin', NULL, NULL, NULL),
	(481, 'Assy 2.1 Line General Part', '62667280', 2, 'admin', NULL, NULL, NULL),
	(482, 'Assembly 2.2 - HMMI', '62667300', 2, 'admin', NULL, NULL, NULL),
	(483, 'Assy 2.2 Line Door Trim', '62667310', 2, 'admin', NULL, NULL, NULL),
	(484, 'Wrapping', '62667320', 2, 'admin', NULL, NULL, NULL),
	(485, 'Assy 2.2 Line Console', '62667330', 2, 'admin', NULL, NULL, NULL),
	(486, 'Assy 2.3 - Line SGMW', '62667410', 2, 'admin', NULL, NULL, NULL),
	(487, 'Foam', '62667710', 2, 'admin', NULL, NULL, NULL),
	(488, 'PLANT 2 CENTER', '62690002', 2, 'admin', NULL, NULL, NULL),
	(489, 'Dummy Plant 2', '62699000', 2, 'admin', NULL, NULL, NULL);

-- Dumping structure for table portal-itsa.master_asset_groups
CREATE TABLE IF NOT EXISTS `master_asset_groups` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `asset_group_name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `asset_group_code` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_by` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `master_asset_groups_asset_group_name_unique` (`asset_group_name`),
  UNIQUE KEY `master_asset_groups_asset_group_code_unique` (`asset_group_code`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table portal-itsa.master_asset_groups: ~14 rows (approximately)
REPLACE INTO `master_asset_groups` (`id`, `asset_group_name`, `asset_group_code`, `created_by`, `updated_by`, `created_at`, `updated_at`) VALUES
	(1, 'Landa', NULL, 'admin', NULL, '2025-06-16 06:44:53', NULL),
	(2, 'Building', NULL, 'admin', NULL, '2025-06-16 06:45:05', NULL),
	(3, 'Insfrastructure', NULL, 'admin', NULL, '2025-06-16 06:45:25', NULL),
	(4, 'Machine', NULL, 'admin', NULL, '2025-06-16 06:45:38', NULL),
	(5, 'Vehicle', NULL, 'admin', NULL, '2025-06-16 06:45:58', NULL),
	(6, 'Furniture', NULL, 'admin', NULL, '2025-06-16 06:46:28', NULL),
	(7, 'Equipment', NULL, 'admin', NULL, '2025-06-16 06:46:43', NULL),
	(8, 'Rack & Palet', NULL, 'admin', NULL, '2025-06-16 06:47:10', NULL),
	(9, 'Computer', NULL, 'admin', NULL, '2025-06-16 06:47:34', NULL),
	(10, 'Software', NULL, 'admin', NULL, '2025-06-16 06:47:50', NULL),
	(11, 'Hardware', NULL, 'admin', NULL, '2025-06-16 06:48:05', NULL),
	(12, 'Office Equipment', NULL, 'admin', NULL, '2025-06-16 06:48:33', NULL),
	(13, 'Tooling (Not Sale to Customer', NULL, 'admin', NULL, '2025-06-16 06:49:05', NULL),
	(14, 'Tooling Lumsum', NULL, 'admin', NULL, '2025-06-16 06:49:23', NULL);

-- Dumping structure for table portal-itsa.master_asset_locations
CREATE TABLE IF NOT EXISTS `master_asset_locations` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `asset_location_name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_by` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_by` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `master_asset_locations_asset_location_name_unique` (`asset_location_name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table portal-itsa.master_asset_locations: ~4 rows (approximately)
REPLACE INTO `master_asset_locations` (`id`, `asset_location_name`, `created_by`, `updated_by`, `created_at`, `updated_at`) VALUES
	(1, 'Office KIIC ', 'admin', NULL, '2025-06-16 06:49:46', NULL),
	(2, 'Office GIIC', 'admin', NULL, '2025-06-16 06:50:08', NULL),
	(3, 'Factory KIIC', 'admin', NULL, '2025-06-16 06:50:26', NULL),
	(4, 'Factory GIIC ( UTILITY )', 'admin', NULL, '2025-06-16 06:50:57', NULL);

-- Dumping structure for table portal-itsa.master_documents
CREATE TABLE IF NOT EXISTS `master_documents` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `file` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `type_doc_id` int(11) NOT NULL DEFAULT '0',
  `effective_date` date DEFAULT NULL,
  `is_archived` enum('new','archived') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `archived_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table portal-itsa.master_documents: ~12 rows (approximately)
REPLACE INTO `master_documents` (`id`, `title`, `description`, `file`, `type_doc_id`, `effective_date`, `is_archived`, `archived_date`, `created_at`, `updated_at`) VALUES
	(8, 'SP-02-004 Production (Rev.7)', 'Additional rule for checking illumination in the quality checking area', 'public/reqdar/master-documents/2026-02/SP-02-004 Production (Rev.7).pdf', 6, '2024-12-30', 'new', '2024-12-30', '2026-02-23 06:57:27', NULL),
	(9, 'SP-02-001 Contract  Review (Rev.4)', 'SP-02-001 Contract  Review (Rev.4)', 'public/reqdar/master-documents/2026-02/SP-02-001 Contract  Review (Rev.4).pdf', 6, '2024-11-19', 'new', '2024-11-19', '2026-02-23 07:18:36', NULL),
	(10, 'SP-02-002 Advance Product Quality Planning (Rev. 9) - APQP', 'Change of criteria special characteristics', 'public/reqdar/master-documents/2026-02/SP-02-002 Advance Product Quality Planning (Rev. 9) v4r.pdf', 6, '2025-12-22', 'new', '2025-12-22', '2026-02-24 09:05:50', NULL),
	(11, 'SP-02-003 Production Planning (Rev.6)', 'Change document number based on new BPM', 'public/reqdar/master-documents/2026-02/SP-02-003 Production Planning (Rev.6).pdf', 6, '2024-04-25', 'new', '2024-04-25', '2026-02-25 02:00:34', NULL),
	(12, 'SP-02-006 Engineering Change (Rev.7)', '-', 'public/reqdar/master-documents/2026-02/SP-02-006 Engineering Change (Rev.7).pdf', 6, '2024-11-08', 'new', '2024-11-08', '2026-02-25 02:02:55', NULL),
	(13, 'SP-02-007 Storage and Warehouse (Rev.9)', '-', 'public/reqdar/master-documents/2026-02/SP-02-007 Storage and Warehouse (Rev.9).pdf', 6, '2024-07-11', 'new', '2024-07-11', '2026-02-25 02:03:48', NULL),
	(14, 'SP-02-008 Non Conforming Product Handling (Rev.7)', '-', 'public/reqdar/master-documents/2026-03/SP-02-008 Non Conforming Product Handling (Rev. 7)  v4r.pdf', 6, '2024-11-06', 'new', '2024-11-06', '2026-02-25 02:04:35', NULL),
	(15, 'SP-02-009 Delivery (Rev.4)', '-', 'public/reqdar/master-documents/2026-02/SP-02-009 Delivery (Rev.4).pdf', 6, '2024-12-05', 'new', '2024-12-05', '2026-02-25 02:05:44', NULL),
	(16, 'SP-02-010 Customer Claim (Rev.5)', '-', 'public/reqdar/master-documents/2026-02/SP-02-010 Customer Claim (Rev.5).pdf', 6, '2025-03-12', 'new', '2025-03-12', '2026-02-25 02:07:04', NULL),
	(17, 'SP-02-011 Control of External Property (Rev.6)', '-', 'public/reqdar/master-documents/2026-02/SP-02-011 Control of External Property (Rev.6).pdf', 6, '2024-06-06', 'new', '2024-06-06', '2026-02-25 02:07:43', NULL),
	(18, 'SP-01-001 Business Plan (Rev.6)', '-', 'public/reqdar/master-documents/2026-02/SP-01-001 Business Plan (Rev.6).pdf', 6, '2024-05-03', 'new', '2024-05-03', '2026-02-25 03:47:27', NULL),
	(19, 'SP-01-002 Management Review(Rev.5)', '-', 'public/reqdar/master-documents/2026-02/SP-01-002 Management Review(Rev.5).pdf', 6, '2024-05-03', 'new', '2024-05-03', '2026-02-25 03:52:35', NULL);

-- Dumping structure for table portal-itsa.migrations
CREATE TABLE IF NOT EXISTS `migrations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table portal-itsa.migrations: ~28 rows (approximately)
REPLACE INTO `migrations` (`id`, `migration`, `batch`) VALUES
	(1, '2014_10_12_000000_create_users_table', 1),
	(2, '2014_10_12_100000_create_password_resets_table', 1),
	(3, '2019_08_19_000000_create_failed_jobs_table', 1),
	(4, '2022_05_13_015148_laratrust_setup_tables', 1),
	(5, '2022_05_13_020037_create_module_table', 1),
	(6, '2022_05_13_025220_create_modules_table', 1),
	(7, '2025_05_05_033006_create_departments_table', 2),
	(8, '2025_05_05_033441_create_positions_table', 2),
	(9, '2025_05_05_033759_create_companys_table', 2),
	(10, '2025_05_06_012615_create_type_of_reqforms_table', 3),
	(11, '2025_05_06_083954_create_request_dar_table', 4),
	(12, '2025_05_08_073335_create_request_type_desc_table', 5),
	(13, '2025_05_08_083122_create_request_desc_table', 6),
	(14, '2025_05_23_022011_create_service_table', 7),
	(15, '2025_05_23_022227_create_news_table', 8),
	(16, '2025_06_16_032548_create_registration_fixed_asset_table', 9),
	(17, '2025_06_16_035635_create_master_asset_groups_table', 9),
	(18, '2025_06_16_035652_create_master_asset_locations_table', 9),
	(19, '2025_06_16_035708_create_master_asset_cost_centers_table', 9),
	(20, '2025_06_16_074050_add_column_status_to_registration_fixed_assets', 10),
	(21, '2025_06_16_082926_add_column_received_date_to_registration_fixed_assets', 11),
	(22, '2025_06_16_083742_add_column_io_no_to_registration_fixed_assets', 12),
	(23, '2025_06_16_084939_add_column_created_by_and_updated_by_to_registration_fixed_assets', 13),
	(24, '2025_06_24_071905_create_asset_tf_notif_table', 14),
	(25, '2025_06_25_045014_add_field_pic_additional_table', 15),
	(26, '2025_07_06_041501_create_master_documents_table', 16),
	(27, '2025_08_07_102101_create_distribution_dar_depts_table', 17),
	(28, '2025_08_20_095934_create_document_control_logs', 18),
	(32, '2026_02_06_000001_add_asset_photo_to_registration_fixed_assets', 19),
	(33, '2026_03_06_091257_create_user_departments_table', 20),
	(34, '2026_04_06_091439_add_status_entry_and_transfer_status_to_registration_fixed_assets', 20),
	(35, '2026_04_06_095019_remove_unique_constraint_from_registration_fixed_assets', 20);

-- Dumping structure for table portal-itsa.modules
CREATE TABLE IF NOT EXISTS `modules` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `modules_name_unique` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table portal-itsa.modules: ~14 rows (approximately)
REPLACE INTO `modules` (`id`, `name`, `created_at`, `updated_at`) VALUES
	(1, 'Module Setting', '2022-05-17 00:26:49', '2022-05-18 00:47:08'),
	(2, 'Module', '2022-05-17 00:26:49', '2022-05-17 00:26:49'),
	(3, 'Module Permission', '2022-05-17 00:26:49', '2022-05-17 00:26:49'),
	(4, 'Module User', '2022-05-17 00:26:49', '2022-05-17 00:26:49'),
	(5, 'Module Role', '2022-05-17 00:26:49', '2022-05-17 00:26:49'),
	(13, 'Document Action Request', '2025-05-02 00:51:13', '2025-05-02 00:51:13'),
	(14, 'Module Company', '2025-05-05 21:51:03', '2025-05-05 21:51:03'),
	(15, 'Module Department', '2025-05-05 21:51:13', '2025-05-05 21:51:13'),
	(16, 'Module Position', '2025-05-05 21:51:24', '2025-05-05 21:51:24'),
	(17, 'Portal ITSA ( News )', '2025-05-22 21:02:28', '2025-05-22 21:03:22'),
	(18, 'Portal ITSA ( Service )', '2025-05-22 21:03:36', '2025-05-22 21:03:36'),
	(19, 'Asset Managements Apps', '2025-06-13 00:12:12', '2026-02-09 06:40:46'),
	(20, 'Master Documents', '2025-07-06 18:26:27', '2025-07-06 18:26:27'),
	(21, 'Document Control Tracking', '2025-08-20 02:22:25', '2025-08-20 02:22:25');

-- Dumping structure for table portal-itsa.news
CREATE TABLE IF NOT EXISTS `news` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `users_id` int(11) NOT NULL,
  `dept_id` int(11) NOT NULL,
  `role_id` int(11) NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `excerpt` text COLLATE utf8mb4_unicode_ci,
  `pic` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `meta_description` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('active','inactive','draft') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `published_at` timestamp NULL DEFAULT NULL,
  `views_count` int(11) DEFAULT NULL,
  `created_by` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_by` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table portal-itsa.news: ~1 rows (approximately)
REPLACE INTO `news` (`id`, `users_id`, `dept_id`, `role_id`, `title`, `slug`, `excerpt`, `pic`, `description`, `meta_description`, `category`, `status`, `published_at`, `views_count`, `created_by`, `created_at`, `updated_by`, `updated_at`) VALUES
	(1, 1, 0, 1, 'Champions Soccer KIIC Sport', 'champions-soccer-kiic-sport', 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type a...', '2.png', 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries', NULL, 'event', 'active', '2025-05-26 02:10:00', 0, 'admin-itsa', '2025-05-25 19:10:20', 'admin-itsa', NULL);

-- Dumping structure for table portal-itsa.password_resets
CREATE TABLE IF NOT EXISTS `password_resets` (
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  KEY `password_resets_email_index` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table portal-itsa.password_resets: ~0 rows (approximately)

-- Dumping structure for table portal-itsa.permissions
CREATE TABLE IF NOT EXISTS `permissions` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `module_id` bigint(20) unsigned NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `permissions_name_unique` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=115 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table portal-itsa.permissions: ~75 rows (approximately)
REPLACE INTO `permissions` (`id`, `name`, `display_name`, `description`, `module_id`, `created_at`, `updated_at`) VALUES
	(1, 'manage-setting', 'Manage Setting', 'Bisa Memanage Setting', 1, '2022-05-17 00:26:49', '2022-05-17 00:26:49'),
	(2, 'create-setting', 'Create Setting', 'Bisa Membuat Setting', 1, '2022-05-17 00:26:49', '2022-05-17 00:26:49'),
	(3, 'edit-setting', 'Edit Setting', 'Bisa Mengedit Setting', 1, '2022-05-17 00:26:49', '2022-05-17 00:26:49'),
	(4, 'manage-module', 'Manage Module', 'Bisa Memanage Module', 2, '2022-05-17 00:26:49', '2022-05-17 00:26:49'),
	(5, 'create-module', 'Create Module', 'Bisa Membuat Module', 2, '2022-05-17 00:26:49', '2022-05-17 00:26:49'),
	(6, 'edit-module', 'Edit Module', 'Bisa Mengedit Module', 2, '2022-05-17 00:26:49', '2022-05-17 00:26:49'),
	(7, 'delete-module', 'Delete Module', 'Bisa Menghapus Module', 2, '2022-05-17 00:26:49', '2022-05-17 00:26:49'),
	(8, 'manage-permission', 'Manage Permission', 'Bisa Memanage Permission', 3, '2022-05-17 00:26:49', '2022-05-17 00:26:49'),
	(9, 'edit-permission', 'Edit Permission', 'Bisa Mengedit Permission', 3, '2022-05-17 00:26:49', '2022-05-17 00:26:49'),
	(10, 'manage-user', 'Manage User', 'Bisa Memanage User', 4, '2022-05-17 00:26:49', '2022-05-17 00:26:49'),
	(11, 'create-user', 'Create User', 'Bisa Membuat User', 4, '2022-05-17 00:26:49', '2022-05-17 00:26:49'),
	(12, 'edit-user', 'Edit User', 'Bisa Mengedit User', 4, '2022-05-17 00:26:49', '2022-05-17 00:26:49'),
	(13, 'reset-password', 'Reset Password User', 'Bisa Mengganti Password User', 4, '2022-05-17 00:26:49', '2022-05-17 00:26:49'),
	(14, 'manage-account', 'Manage Account Profile', 'Bisa Memanage Profile', 4, '2022-05-17 00:26:49', '2022-05-17 00:26:49'),
	(15, 'edit-account', 'Edit Account Profile', 'Bisa Mengedit Profile', 4, '2022-05-17 00:26:49', '2022-05-17 00:26:49'),
	(16, 'change-password-account', 'Reset Password Profile', 'Bisa Mengganti Password Profile', 4, '2022-05-17 00:26:49', '2022-05-17 00:26:49'),
	(17, 'manage-role', 'Manage Role', 'Bisa Memanage Role', 5, '2022-05-17 00:26:49', '2022-05-17 00:26:49'),
	(18, 'create-role', 'Create Role', 'Bisa Membuat Role', 5, '2022-05-17 00:26:49', '2022-05-17 00:26:49'),
	(19, 'edit-role', 'Edit Role', 'Bisa Mengedit Role', 5, '2022-05-17 00:26:49', '2022-05-17 00:26:49'),
	(22, 'create-permission', 'Create permission', 'Bisa menambahkan permission', 3, '2022-05-17 21:35:20', '2022-05-17 21:35:20'),
	(24, 'delete-permission', 'Delete Permission', 'Bisa menghapus permission', 3, '2022-05-17 21:39:22', '2022-05-17 21:39:22'),
	(25, 'delete-role', 'Delete Role', 'Bisa menghapus Role', 5, '2022-05-17 21:42:23', '2022-05-17 21:42:52'),
	(26, 'delete-user', 'Delete user', 'Bisa menghapus user', 4, '2022-05-17 21:44:50', '2022-05-17 21:44:50'),
	(63, 'manage-dar-system', 'manage dar system', 'list manage dar system', 13, '2025-05-02 00:54:57', '2025-05-02 00:54:57'),
	(64, 'manage-company', 'manage company', 'untuk list data company', 14, '2025-05-05 22:57:49', '2025-05-05 22:57:49'),
	(65, 'manage-department', 'manage department', 'untuk list data department', 15, '2025-05-05 22:58:51', '2025-05-05 22:58:51'),
	(66, 'manage-position', 'manage position', 'untuk list data position', 16, '2025-05-05 22:59:19', '2025-05-05 22:59:19'),
	(67, 'create-company', 'create company', 'add company', 14, '2025-05-05 23:13:34', '2025-05-05 23:13:34'),
	(68, 'edit-company', 'edit company', 'untuk perubahan company', 14, '2025-05-05 23:29:38', '2025-05-05 23:29:38'),
	(69, 'delete-company', 'delete company', 'untuk menghapus company', 14, '2025-05-05 23:30:05', '2025-05-05 23:30:05'),
	(70, 'create-department', 'create department', 'untuk menambahkan data department', 15, '2025-05-05 23:39:06', '2025-05-05 23:39:06'),
	(71, 'edit-department', 'edit department', 'untuk mengubah data department', 15, '2025-05-05 23:39:37', '2025-05-05 23:39:37'),
	(72, 'delete-department', 'delete department', 'untuk menghapus department', 15, '2025-05-05 23:40:01', '2025-05-05 23:40:01'),
	(73, 'create-position', 'create position', 'untuk menambahkan position', 16, '2025-05-05 23:55:35', '2025-05-05 23:55:35'),
	(74, 'edit-position', 'edit position', 'untuk mengubah position', 16, '2025-05-05 23:56:01', '2025-05-05 23:56:01'),
	(75, 'delete-position', 'delete position', 'untuk menghapus position', 16, '2025-05-05 23:56:38', '2025-05-05 23:56:38'),
	(76, 'show-use', 'show user', 'detail users', 4, '2025-05-06 00:19:09', '2025-05-06 00:22:01'),
	(77, 'create-reqdar', 'create reqdar', 'add request dar system', 13, '2025-05-07 20:26:34', '2025-05-07 20:26:34'),
	(78, 'show-dar', 'show dar', 'untuk show data dar', 13, '2025-05-09 02:01:48', '2025-05-09 02:01:48'),
	(79, 'edit-dar', 'edit dar', 'untuk mengubah dar', 13, '2025-05-12 23:19:18', '2025-05-12 23:19:18'),
	(80, 'approved-by1', 'approved by1', 'persetujuan atasan', 13, '2025-05-17 09:10:26', '2025-05-17 09:10:26'),
	(81, 'rejected-appr1', 'rejected appr1', 'penolakan dari approval 1', 13, '2025-05-17 11:32:16', '2025-05-17 11:32:16'),
	(82, 'approved-by2', 'approved by2', 'approved sysdev', 13, '2025-05-19 02:57:01', '2025-05-19 02:57:01'),
	(83, 'rejected-appr2', 'rejected appr2', 'rejected sysdev', 13, '2025-05-19 02:57:41', '2025-05-19 02:57:41'),
	(84, 'approved-by3', 'approved by3', 'approval terakhir', 13, '2025-05-19 18:40:00', '2025-05-19 18:40:00'),
	(85, 'rejected-by3', 'rejected by3', 'reject dari manager it', 13, '2025-05-19 18:42:20', '2025-05-19 18:42:20'),
	(86, 'delete-dar', 'delete dar', 'menghapus dar pengajuan', 13, '2025-05-19 23:14:45', '2025-05-19 23:14:45'),
	(87, 'manage-portalitsa-service', 'manage portalitsa service', 'manage portalitsa service', 18, '2025-05-22 21:21:19', '2025-05-22 21:21:19'),
	(88, 'create-portalitsa-service', 'create portalitsa service', 'create portalitsa service', 18, '2025-05-22 21:21:35', '2025-05-22 21:21:35'),
	(89, 'show-portalitsa-service', 'show portalitsa service', 'show portalitsa service', 18, '2025-05-22 21:21:50', '2025-05-22 21:21:50'),
	(90, 'edit-portalitsa-service', 'edit portalitsa service', 'edit portalitsa service', 18, '2025-05-22 21:22:24', '2025-05-22 21:22:24'),
	(91, 'delete-portalitsa-service', 'delete portalitsa service', 'delete portalitsa service', 18, '2025-05-22 21:23:58', '2025-05-22 21:23:58'),
	(92, 'manage-portalitsa-news', 'manage portalitsa news', 'manage portalitsa news', 17, '2025-05-22 21:25:44', '2025-05-22 21:25:44'),
	(93, 'create-portalitsa-news', 'create portalitsa news', 'create portalitsa news', 17, '2025-05-22 21:26:48', '2025-05-22 21:26:48'),
	(94, 'show-portalitsa-news', 'show portalitsa news', 'show portalitsa news', 17, '2025-05-22 21:27:12', '2025-05-22 21:27:12'),
	(95, 'edit-portalitsa-news', 'edit portalitsa news', 'edit portalitsa news', 17, '2025-05-22 21:29:58', '2025-05-22 21:29:58'),
	(96, 'delete-portalitsa-news', 'delete portalitsa news', 'delete portalitsa news', 17, '2025-05-22 21:30:16', '2025-05-22 21:30:16'),
	(97, 'manage-digital-assets', 'Manage Digital Assets', 'untuk manajemen digital assets registration', 19, '2025-06-15 18:50:22', '2025-06-15 18:50:22'),
	(98, 'create-digital-assets-reg', 'Create Digital assets Reg', 'untuk create digital assets registration', 19, '2025-06-15 18:51:42', '2025-06-15 18:51:42'),
	(99, 'show-digital-assets', 'show digital assets', 'detail digital assets', 19, '2025-06-15 18:52:37', '2025-06-15 18:52:37'),
	(100, 'edit-digital-assets', 'edit digital assets', 'untuk mengubah digital assets registration', 19, '2025-06-15 18:53:19', '2025-06-15 18:53:19'),
	(101, 'destroy-digital-assets', 'destroy digital assets', 'untuk menghapus request registration digital assets', 19, '2025-06-15 18:54:24', '2025-06-15 18:54:24'),
	(102, 'manage-asset-tf-notification', 'manage asset tf notification', 'manage asset tf notification', 19, '2025-06-23 23:10:32', '2025-06-24 02:09:09'),
	(103, 'create-asset-tf-notif', 'create asset tf notif', 'create asset tf notif', 19, '2025-06-23 23:11:31', '2025-06-24 02:09:32'),
	(104, 'detail-ast-tf-notif', 'detail ast tf notif', 'detail ast tf notif', 19, '2025-06-23 23:11:57', '2025-06-24 02:09:43'),
	(105, 'edit-ast-tf-notif', 'edit ast tf notif', 'edit ast tf notif', 19, '2025-06-23 23:18:11', '2025-06-24 02:09:53'),
	(106, 'destroy-ast-tf-notif', 'destroy ast tf notif', 'destroy ast tf notif', 19, '2025-06-23 23:22:48', '2025-06-24 02:10:03'),
	(107, 'approve-transfer', 'approve transfer', 'approve transfer', 19, '2025-06-29 21:51:42', '2025-06-29 21:51:42'),
	(108, 'reject-transfer', 'reject transfer', 'reject transfer', 19, '2025-06-30 00:29:02', '2025-06-30 00:29:02'),
	(109, 'manage-masterdocs', 'Manage Masterdocs', 'manajemen master documents', 20, '2025-07-06 18:27:03', '2025-07-06 18:27:03'),
	(110, 'create-masterdocs', 'Create Masterdocs', 'untuk membuat master documents', 20, '2025-07-06 18:27:38', '2025-07-06 18:27:38'),
	(111, 'show-masterdocs', 'Show Masterdocs', 'untuk detail masterdocs', 20, '2025-07-06 18:28:04', '2025-07-06 18:28:04'),
	(112, 'edit-masterdocs', 'Edit Masterdocs', 'Untuk mengubah master co', 20, '2025-07-06 18:28:40', '2025-07-06 18:28:40'),
	(113, 'destroy-masterdocs', 'Destroy Masterdocs', 'untuk menghapus masterdocs', 20, '2025-07-06 18:29:20', '2025-07-06 18:29:20'),
	(114, 'index-document-con', 'index document con', 'untuk list document control tracking', 21, '2025-08-20 02:24:21', '2025-08-20 02:24:21');

-- Dumping structure for table portal-itsa.permission_role
CREATE TABLE IF NOT EXISTS `permission_role` (
  `permission_id` int(10) unsigned NOT NULL,
  `role_id` int(10) unsigned NOT NULL,
  PRIMARY KEY (`permission_id`,`role_id`),
  KEY `permission_role_role_id_foreign` (`role_id`),
  CONSTRAINT `permission_role_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `permission_role_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table portal-itsa.permission_role: ~162 rows (approximately)
REPLACE INTO `permission_role` (`permission_id`, `role_id`) VALUES
	(1, 1),
	(2, 1),
	(4, 1),
	(5, 1),
	(6, 1),
	(7, 1),
	(8, 1),
	(9, 1),
	(10, 1),
	(11, 1),
	(12, 1),
	(13, 1),
	(14, 1),
	(15, 1),
	(16, 1),
	(17, 1),
	(18, 1),
	(19, 1),
	(22, 1),
	(24, 1),
	(25, 1),
	(26, 1),
	(63, 1),
	(64, 1),
	(65, 1),
	(66, 1),
	(67, 1),
	(68, 1),
	(69, 1),
	(70, 1),
	(71, 1),
	(72, 1),
	(73, 1),
	(74, 1),
	(75, 1),
	(76, 1),
	(78, 1),
	(79, 1),
	(86, 1),
	(87, 1),
	(88, 1),
	(89, 1),
	(90, 1),
	(91, 1),
	(92, 1),
	(93, 1),
	(94, 1),
	(95, 1),
	(96, 1),
	(97, 1),
	(98, 1),
	(99, 1),
	(100, 1),
	(101, 1),
	(102, 1),
	(103, 1),
	(104, 1),
	(105, 1),
	(106, 1),
	(109, 1),
	(110, 1),
	(111, 1),
	(112, 1),
	(113, 1),
	(63, 3),
	(77, 3),
	(78, 3),
	(79, 3),
	(109, 3),
	(111, 3),
	(63, 4),
	(78, 4),
	(80, 4),
	(81, 4),
	(109, 4),
	(111, 4),
	(114, 4),
	(63, 5),
	(78, 5),
	(79, 5),
	(82, 5),
	(83, 5),
	(109, 5),
	(110, 5),
	(111, 5),
	(112, 5),
	(113, 5),
	(114, 5),
	(63, 6),
	(78, 6),
	(84, 6),
	(85, 6),
	(109, 6),
	(111, 6),
	(114, 6),
	(97, 7),
	(98, 7),
	(99, 7),
	(100, 7),
	(101, 7),
	(102, 7),
	(103, 7),
	(104, 7),
	(105, 7),
	(97, 8),
	(99, 8),
	(100, 8),
	(102, 8),
	(104, 8),
	(105, 8),
	(107, 8),
	(108, 8),
	(97, 9),
	(99, 9),
	(102, 9),
	(104, 9),
	(107, 9),
	(108, 9),
	(97, 10),
	(99, 10),
	(102, 10),
	(104, 10),
	(107, 10),
	(108, 10),
	(97, 11),
	(99, 11),
	(102, 11),
	(104, 11),
	(107, 11),
	(108, 11),
	(97, 12),
	(99, 12),
	(102, 12),
	(104, 12),
	(107, 12),
	(108, 12),
	(97, 13),
	(99, 13),
	(102, 13),
	(104, 13),
	(107, 13),
	(108, 13),
	(97, 14),
	(99, 14),
	(100, 14),
	(102, 14),
	(104, 14),
	(105, 14),
	(107, 14),
	(108, 14),
	(63, 15),
	(77, 15),
	(78, 15),
	(79, 15),
	(97, 15),
	(98, 15),
	(99, 15),
	(100, 15),
	(102, 15),
	(103, 15),
	(104, 15),
	(105, 15);

-- Dumping structure for table portal-itsa.permission_user
CREATE TABLE IF NOT EXISTS `permission_user` (
  `permission_id` int(10) unsigned NOT NULL,
  `user_id` int(10) unsigned NOT NULL,
  `user_type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`user_id`,`permission_id`,`user_type`),
  KEY `permission_user_permission_id_foreign` (`permission_id`),
  CONSTRAINT `permission_user_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table portal-itsa.permission_user: ~0 rows (approximately)

-- Dumping structure for table portal-itsa.positions
CREATE TABLE IF NOT EXISTS `positions` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `position_desc` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table portal-itsa.positions: ~19 rows (approximately)
REPLACE INTO `positions` (`id`, `position_desc`, `created_at`, `updated_at`) VALUES
	(1, 'Administration', '2025-05-06 02:59:15', NULL),
	(2, 'Assistant Manager', '2025-05-06 02:59:16', NULL),
	(3, 'Driver', '2025-05-06 02:59:16', NULL),
	(4, 'Engineer', '2025-05-06 02:59:20', NULL),
	(5, 'Foreman', '2025-05-06 02:59:20', NULL),
	(6, 'General Manager', '2025-05-06 02:59:21', NULL),
	(7, 'Inspector', '2025-05-06 02:59:22', NULL),
	(8, 'Leader', '2025-05-06 02:59:23', NULL),
	(9, 'Manager', '2025-05-06 02:59:23', NULL),
	(10, 'Managing Director', '2025-05-06 02:59:24', NULL),
	(11, 'Officer', '2025-05-06 02:59:25', NULL),
	(12, 'Operator', '2025-05-06 02:59:26', NULL),
	(13, 'Senior Officer', '2025-05-06 02:59:26', NULL),
	(14, 'Supervisor', '2025-05-06 02:59:27', NULL),
	(15, 'Technician', '2025-05-06 02:59:28', NULL),
	(16, 'Nurse', '2025-05-06 02:59:29', NULL),
	(17, 'Personal Assistant Executive', '2025-05-06 02:59:29', NULL),
	(18, 'Section Chief', '2025-05-06 02:59:30', NULL),
	(19, 'Advisor', '2025-05-06 02:59:30', NULL);

-- Dumping structure for table portal-itsa.registration_fixed_assets
CREATE TABLE IF NOT EXISTS `registration_fixed_assets` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `date` date DEFAULT NULL,
  `rfa_number` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `requestor_name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `issue_fixed_asset_no` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `production_code` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `product_name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `grn_no` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` int(10) unsigned NOT NULL,
  `department_id` int(10) unsigned DEFAULT NULL,
  `company_id` int(10) unsigned DEFAULT NULL,
  `asset_group_id` int(10) unsigned NOT NULL,
  `asset_location_id` int(10) unsigned NOT NULL,
  `asset_cost_center_id` int(10) unsigned NOT NULL,
  `remark` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `asset_photo` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `status_entry` enum('Process','Completed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Process',
  `io_no` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'IO Number',
  `received_date` date DEFAULT NULL,
  `approval_by1` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `approval_date1` datetime DEFAULT NULL,
  `approval_status1` enum('0','1','2') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `remark_approval_by1` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `approval_by2` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `approval_date2` datetime DEFAULT NULL,
  `approval_status2` enum('0','1','2') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `remark_approval_by2` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `approval_by3` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `approval_date3` datetime DEFAULT NULL,
  `approval_status3` enum('0','1','2') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `remark_approval_by3` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `created_by` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `updated_by` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `transfer_status` enum('pending','sent','completed','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `transfer_sent_at` date DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table portal-itsa.registration_fixed_assets: ~1 rows (approximately)
REPLACE INTO `registration_fixed_assets` (`id`, `date`, `rfa_number`, `requestor_name`, `issue_fixed_asset_no`, `production_code`, `product_name`, `grn_no`, `user_id`, `department_id`, `company_id`, `asset_group_id`, `asset_location_id`, `asset_cost_center_id`, `remark`, `asset_photo`, `status`, `status_entry`, `io_no`, `received_date`, `approval_by1`, `approval_date1`, `approval_status1`, `remark_approval_by1`, `approval_by2`, `approval_date2`, `approval_status2`, `remark_approval_by2`, `approval_by3`, `approval_date3`, `approval_status3`, `remark_approval_by3`, `created_at`, `updated_at`, `created_by`, `updated_by`, `transfer_status`, `transfer_sent_at`) VALUES
	(11, NULL, '-', 'Alfina Naditia Maharani (Rack Center)', '-', '900000001', 'WIP RACK GARN RR PLR LH RH', '126031422', 30, 21, 2, 8, 4, 392, 'GENBA AREA RACK CENTER', 'asset-photos/1775120163_(6) GARN ASSY RR.png', 'active', 'Process', '124050039', '2026-03-09', NULL, NULL, '0', NULL, NULL, NULL, '0', NULL, NULL, NULL, '0', NULL, '2026-04-02 08:56:04', NULL, 'Alfina Naditia Maharani', NULL, '', NULL),
	(13, NULL, '-', 'Alfina Naditia Maharani (Rack Center)', '-', 'TEST1234', 'TEST1234', 'TEST123/RPO/22/MAR/33544', 30, 21, 1, 5, 2, 457, 'test1234', 'asset-photos/1775630669_logo-hse.png', 'active', 'Process', 'TEST-IO-UP-20.1254', '2026-04-15', NULL, NULL, '0', NULL, NULL, NULL, '0', NULL, NULL, NULL, '0', NULL, '2026-04-06 02:56:55', '2026-04-08 06:44:29', 'Alfina Naditia Maharani', 'Alfina Naditia Maharani', '', NULL),
	(14, NULL, '-', 'Alfina Naditia Maharani (Rack Center)', '-', '7848476736', 'Test 123', '83783922', 30, 21, 1, 5, 1, 377, 'test 123', 'asset-photos/1775550638_logo-hse.png', 'active', 'Process', '83883927', '2026-04-09', NULL, NULL, '0', NULL, NULL, NULL, '0', NULL, NULL, NULL, '0', NULL, '2026-04-07 08:30:40', NULL, 'Alfina Naditia Maharani', NULL, '', NULL);

-- Dumping structure for table portal-itsa.request_dar
CREATE TABLE IF NOT EXISTS `request_dar` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `number_dar` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nik_req` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nik_atasan` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dept_id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL,
  `position_id` int(11) NOT NULL,
  `typereqform_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `request_desc_id` int(11) NOT NULL,
  `name_doc` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `no_doc` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `qty_pages` int(11) NOT NULL,
  `reason` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_by` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_date` datetime NOT NULL,
  `file_doc` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `storage_type` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rev_no_before` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rev_no_after` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `approval_by1` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `approval_date1` datetime DEFAULT NULL,
  `approval_status1` enum('0','1','2') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '0 = waiting approval\r\n1 = approval\r\n2 = reject',
  `remark_approval_by1` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `approval_by2` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `approval_date2` datetime DEFAULT NULL,
  `approval_status2` enum('0','1','2') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '0 = waiting approval',
  `remark_approval_by2` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `approval_by3` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `approval_date3` datetime DEFAULT NULL,
  `approval_status3` enum('0','1','2') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `remark_approval_by3` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_by_1` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_bydate_1` datetime DEFAULT NULL,
  `updated_by_2` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_bydate_2` datetime DEFAULT NULL,
  `status` enum('1','2') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '1 = Open, 2 = Close',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table portal-itsa.request_dar: ~1 rows (approximately)
REPLACE INTO `request_dar` (`id`, `number_dar`, `nik_req`, `nik_atasan`, `dept_id`, `company_id`, `position_id`, `typereqform_id`, `user_id`, `request_desc_id`, `name_doc`, `no_doc`, `qty_pages`, `reason`, `created_by`, `created_date`, `file_doc`, `storage_type`, `rev_no_before`, `rev_no_after`, `approval_by1`, `approval_date1`, `approval_status1`, `remark_approval_by1`, `approval_by2`, `approval_date2`, `approval_status2`, `remark_approval_by2`, `approval_by3`, `approval_date3`, `approval_status3`, `remark_approval_by3`, `updated_by_1`, `updated_bydate_1`, `updated_by_2`, `updated_bydate_2`, `status`) VALUES
	(3, '08/001', '243.09.10', NULL, 13, 1, 11, 6, 19, 3, 'Business Plan (Rev. 4)', 'SP-01-001', 6, 'ubah sajaaaaa', '243.09.10', '2025-08-19 02:32:32', 'public/dar_documents/2025-08/SP-01-001 Business Plan (Rev. 4) (1).pdf', NULL, '4', NULL, 'Manager', '2025-08-19 14:32:49', '1', NULL, 'Sys Dev', '2025-08-19 16:12:24', '1', '-', 'Manager SysDev & IT', '2025-08-19 16:12:44', '1', '-', '480.11.12', '2025-08-19 16:11:59', NULL, NULL, '2');

-- Dumping structure for table portal-itsa.request_desc
CREATE TABLE IF NOT EXISTS `request_desc` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `request_descript` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table portal-itsa.request_desc: ~3 rows (approximately)
REPLACE INTO `request_desc` (`id`, `request_descript`, `created_at`, `updated_at`) VALUES
	(1, 'NEW ISSUE', '2025-05-08 08:35:42', NULL),
	(2, 'OBSOLETE', '2025-05-08 08:36:20', NULL),
	(3, 'REVISE', '2025-05-08 08:36:33', NULL);

-- Dumping structure for table portal-itsa.roles
CREATE TABLE IF NOT EXISTS `roles` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `roles_name_unique` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table portal-itsa.roles: ~14 rows (approximately)
REPLACE INTO `roles` (`id`, `name`, `display_name`, `description`, `created_at`, `updated_at`) VALUES
	(1, 'admin', 'Administrator', 'Ini adalah Role Admin', '2022-05-17 00:26:49', '2022-05-17 00:26:49'),
	(3, 'user-employee', 'User Employee DAR', 'pengguna system dar', '2025-05-06 20:39:18', '2025-05-06 20:39:18'),
	(4, 'manager', 'Leader/Manager/Dept Head', 'approved 1', '2025-05-17 09:09:42', '2025-05-17 09:09:42'),
	(5, 'sysdev', 'Dept Syd & IT', 'sysdev pengecekan', '2025-05-19 02:56:24', '2025-05-19 02:56:24'),
	(6, 'manager-it', 'Manager Syd & IT', 'approved terakhir dari dar system', '2025-05-19 18:33:49', '2025-05-19 18:33:49'),
	(7, 'user-employee-digassets', 'user employee digassets', 'user employee digassets', '2025-06-15 19:23:27', '2025-06-15 19:23:27'),
	(8, 'user-acct-digassets', 'Acc/Finn', 'user acct digassets', '2025-06-16 21:55:40', '2025-06-16 21:55:40'),
	(9, 'user-mgr-dept-head', 'Leader/Manager/Dept Head', 'user mgr dept head', '2025-06-16 21:56:36', '2025-06-16 21:56:36'),
	(10, 'manager-directur', 'Manager Directur', 'manager directur', '2025-06-30 00:06:00', '2025-06-30 00:06:00'),
	(11, 'user-receive-sendnotif-dept', 'Receiving Department ', 'user receive sendnotif dept', '2025-06-30 20:19:53', '2025-06-30 20:19:53'),
	(12, 'user-mgr-receive-send-notif-dept', 'Receiving Department Head', 'user mgr receive send notif dept', '2025-06-30 21:14:17', '2025-06-30 21:14:17'),
	(13, 'user-gm-accfinn-sendnotif', 'GM Acc/Finn', 'user gm accfinn sendnotif', '2025-06-30 21:41:29', '2025-06-30 21:41:29'),
	(14, 'user-mgr-accounting', 'user mgr accounting', 'user mgr accounting', '2025-09-23 04:28:59', '2025-09-23 04:28:59'),
	(15, 'dar-asset', 'Dar  &Asset', 'user dar & asset', '2026-02-26 06:42:46', '2026-02-26 06:42:46');

-- Dumping structure for table portal-itsa.role_user
CREATE TABLE IF NOT EXISTS `role_user` (
  `role_id` int(10) unsigned NOT NULL,
  `user_id` int(10) unsigned NOT NULL,
  `user_type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`user_id`,`role_id`,`user_type`),
  KEY `role_user_role_id_foreign` (`role_id`),
  CONSTRAINT `role_user_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table portal-itsa.role_user: ~37 rows (approximately)
REPLACE INTO `role_user` (`role_id`, `user_id`, `user_type`) VALUES
	(1, 1, 'App\\User'),
	(3, 3, 'App\\User'),
	(3, 6, 'App\\User'),
	(3, 8, 'App\\User'),
	(3, 16, 'App\\User'),
	(3, 19, 'App\\User'),
	(3, 21, 'App\\User'),
	(3, 22, 'App\\User'),
	(4, 4, 'App\\User'),
	(4, 17, 'App\\User'),
	(4, 20, 'App\\User'),
	(4, 23, 'App\\User'),
	(4, 24, 'App\\User'),
	(4, 37, 'App\\User'),
	(4, 39, 'App\\User'),
	(5, 5, 'App\\User'),
	(5, 18, 'App\\User'),
	(6, 7, 'App\\User'),
	(7, 9, 'App\\User'),
	(7, 26, 'App\\User'),
	(7, 27, 'App\\User'),
	(7, 30, 'App\\User'),
	(7, 32, 'App\\User'),
	(7, 33, 'App\\User'),
	(7, 35, 'App\\User'),
	(7, 36, 'App\\User'),
	(7, 38, 'App\\User'),
	(8, 10, 'App\\User'),
	(9, 11, 'App\\User'),
	(9, 29, 'App\\User'),
	(9, 31, 'App\\User'),
	(9, 34, 'App\\User'),
	(10, 12, 'App\\User'),
	(11, 13, 'App\\User'),
	(12, 14, 'App\\User'),
	(13, 15, 'App\\User'),
	(14, 25, 'App\\User');

-- Dumping structure for table portal-itsa.service
CREATE TABLE IF NOT EXISTS `service` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_by` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `updated_by` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table portal-itsa.service: ~8 rows (approximately)
REPLACE INTO `service` (`id`, `title`, `description`, `created_by`, `created_at`, `updated_at`, `updated_by`) VALUES
	(1, 'Document Action Request', 'An efficient and structured system for submitting, approving and tracking company documents.', 'admin', '2025-05-23 03:39:44', NULL, NULL),
	(2, 'Asset Managements Apps', 'Management of corporate digital assets with high security and ease of access for authorized users.', 'admin', '2025-05-23 03:43:25', '2026-02-09 06:40:27', 'admin'),
	(3, 'IT Request Form', 'Submit and manage IT support requests', 'admin', '2025-08-26 01:41:09', NULL, NULL),
	(4, 'Maintenance Order Form', 'Submit and track equipment maintenance', 'admin', '2025-08-26 01:41:34', NULL, NULL),
	(5, 'IT Borrowing Goods', 'Request and manage IT equipment borrowing', 'admin', '2025-08-26 01:42:23', NULL, NULL),
	(6, 'BIPO', 'HRMS System V2', 'admin', '2025-09-02 01:36:02', NULL, NULL),
	(7, 'E-Memo', 'E-Memo System', 'admin', '2025-09-02 01:36:27', NULL, NULL),
	(8, 'CIC Control System', 'CIC Control System', 'admin', '2025-09-02 01:36:42', NULL, NULL);

-- Dumping structure for table portal-itsa.type_of_reqforms
CREATE TABLE IF NOT EXISTS `type_of_reqforms` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `request_type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table portal-itsa.type_of_reqforms: ~5 rows (approximately)
REPLACE INTO `type_of_reqforms` (`id`, `request_type`, `created_at`, `updated_at`) VALUES
	(5, 'Quality Manual (QM)', '2025-05-06 01:36:26', NULL),
	(6, 'System Procedure ( SP )', '2025-05-06 01:36:52', NULL),
	(7, 'Work Instruction ( WI )', '2025-05-06 01:37:22', NULL),
	(8, 'Form, Checkseet, Support Doc', '2025-05-06 01:37:42', NULL),
	(9, 'Other Doc', '2025-05-06 01:38:50', NULL);

-- Dumping structure for table portal-itsa.users
CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nik` varchar(12) COLLATE utf8mb4_unicode_ci NOT NULL,
  `department_id` int(11) NOT NULL DEFAULT '0',
  `position_id` int(11) NOT NULL DEFAULT '0',
  `company_id` int(11) NOT NULL DEFAULT '0',
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  UNIQUE KEY `users_username_unique` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table portal-itsa.users: ~38 rows (approximately)
REPLACE INTO `users` (`id`, `name`, `email`, `username`, `nik`, `department_id`, `position_id`, `company_id`, `email_verified_at`, `password`, `remember_token`, `created_at`, `updated_at`) VALUES
	(1, 'admin-itsa', 'admin@gmail.com', 'admin', '111.11.11', 0, 0, 0, NULL, '$2a$12$j79IuO0uswUoqNucloSnv.VNQdxUBqc9XB2zv2MH2J3VeEACOD.Ce', '45xxh9KlQu1khC97acUq7PXESRP5mxYZRm50gfZ1jM1z1JwE6JDA7On4ziEt', '2022-05-17 00:26:49', '2023-11-14 21:25:23'),
	(2, 'Wildan Fathur Rohman', '-', 'wildanfr', '943.04.25', 10, 11, 1, NULL, '$2y$10$erCl0A6vAO9m4jvBAr5bhOTY4b5Au1lv1BVi/blcMsr1ZAGopVjUK', NULL, '2025-05-05 20:30:05', '2025-05-05 21:07:00'),
	(3, 'User Sample', 'usersample@gmail.com', 'usersample', '999.99.99', 9, 11, 1, NULL, '$2y$10$uQnjMQuQtcMnVMsDv1pxRuOCKl/SeRdi6iaVi9Pqg13LtVvSIaQ0O', NULL, '2025-05-06 20:59:02', '2025-05-06 20:59:02'),
	(4, 'User Manager Sample', 'it-03@thaisummit.co.id', 'usermgrsample', '966.96.96', 9, 9, 1, NULL, '$2y$10$rGv5v8aPHb9Ie2B3X7g7Oeb3jWwG0irAiIVrFiCg0CaRU2ZH6zWfO', NULL, '2025-05-17 09:17:08', '2025-05-17 09:17:08'),
	(5, 'Ronal Rusdianto', 'syd-01@thaisummit.co.id', 'ronalrus', '480.11.12', 10, 11, 1, NULL, '$2y$10$rCzz/cwpd88aNVIQCUtxau9jNBoj4x9uKysgood3pURGLs6iET/Ka', NULL, '2025-05-19 02:58:43', '2026-03-30 02:40:57'),
	(6, 'user4', 'user4@thaisummit.co.id', 'user4', '777.77.77', 9, 11, 1, NULL, '$2y$10$lFDzjEMnW7dtxXa3MaR/Geqpg7Cw2Clcuw11fPyimyMiFgC2NeY3e', NULL, '2025-05-19 03:02:53', '2025-05-19 03:02:53'),
	(7, 'Wida Mustika Sari', 'wida.mus@thaisummit.co.id', 'widamus', '115.08.08', 10, 9, 1, NULL, '$2y$10$.edUAhDTAL.tFu.JogI02.kjWhBxHYSQ.nmqWICPyg/WNIMh9n8ey', NULL, '2025-05-19 18:37:03', '2025-05-19 18:37:03'),
	(8, 'Didin Jahrudin', 'it-01@thaisummit.co.id', 'didinjah', '630.07.14', 10, 13, 1, NULL, '$2a$12$SSXnoTzVWMXXbTWQLGe4SezeBL2kLSNeGnUp2wE9capEd5lgMnkfm', NULL, '2025-05-20 18:22:36', '2025-05-20 18:26:19'),
	(9, 'ramdhan', 'ramdhan@itsp.co.id', 'ramdhan', '065.12.06', 13, 11, 2, NULL, '$2a$12$8bs7lfxnjpHeQVG/tPazueL/v0JaJZFEJ39iv1j9CS5bG3N45xxX2', NULL, '2025-06-15 19:35:00', '2025-06-15 19:35:00'),
	(10, 'Pristine Hollysa', 'finance01@thaisummit.co.id', 'Pristine Hollysa', '657.06.21', 1, 11, 2, NULL, '$2y$10$b9BlNSSwLgUpGFOTbbSwY.gq426xMWx/u7fibwY5N7ZiXaYEDVPBm', NULL, '2025-06-16 23:22:49', '2026-03-02 06:32:23'),
	(11, 'Wuddhikrai Supinta', 'wuddhikrai.sup@thaisummit.co.id', 'Wuddhikrai Supinta', '004.02.16', 4, 9, 2, NULL, '$2y$10$9eYiqG13t44CB7SQAARc.OPJ5pAtDrGa6ChDeJorNqrNhdj7aml8y', NULL, '2025-06-17 02:16:06', '2026-03-02 06:36:17'),
	(12, 'Parinya Srisorasit', 'parinya.sri@thaisummit.co.id', 'Parinya Srisorasit', '339.01.18', 18, 10, 2, NULL, '$2y$10$6Cyr/S6O4s7PWRYILVoNXuEe5ql8VoHyDxagFowfbc.feSWOvAVcO', NULL, '2025-06-30 00:09:52', '2026-03-02 06:41:40'),
	(13, 'Sholeh Patoni', 'sholehpatoni@gmail.com', 'sholehpatoni', '017.09.16', 9, 8, 2, NULL, '$2a$12$8bs7lfxnjpHeQVG/tPazueL/v0JaJZFEJ39iv1j9CS5bG3N45xxX2', NULL, '2025-06-30 20:51:13', '2025-06-30 20:51:13'),
	(14, 'Ija Jaenudin', 'ija@gmail.com', 'ija', '049.05.07', 9, 8, 2, NULL, '$2a$12$8bs7lfxnjpHeQVG/tPazueL/v0JaJZFEJ39iv1j9CS5bG3N45xxX2', NULL, '2025-06-30 21:22:20', '2025-06-30 21:22:20'),
	(15, 'Laddaporn Kingngoen', 'laddaporn.kin@thaisummit.co.th', 'Laddaporn Kingngoen', '1377.02.26', 1, 6, 2, NULL, '$2y$10$qp8m38MgPyyXDMu0vGHWIu7CvEUUex3fL7.y4wAm5eJ15W0h/Tkhy', NULL, '2025-06-30 21:56:31', '2026-03-05 02:55:01'),
	(16, 'Susie Nurmalasary', 'quality05.4w@thaisummit.co.id', 'susienurmalasary', '707.07.18', 9, 11, 1, NULL, '$2y$10$GJC2s/rF/scjW6bdIMDlcO6MGFnSpFDcxgglNQwdkNOwvtfU2rFdm', NULL, '2025-08-05 03:41:38', '2025-08-13 01:54:56'),
	(17, 'Abiyansyah Nur Pratama', 'abiyansyah.nur@thaisummit.co.id', 'abiyansyah', '856.09.23', 9, 9, 1, NULL, '$2y$10$IZ0eGp2FAY3xRuKDwqep7.n39MNKqH9eufjDAM3I4scLhxjq3r47.', NULL, '2025-08-05 03:44:08', '2025-08-05 03:44:08'),
	(18, 'Dede Susilawati', 'dede.sus@thaisummit.co.id', 'dedesusilawati', '230.07.10', 10, 11, 1, NULL, '$2y$10$NYQae0X72DuX41p8nek5Ye3x2aGFYe.AvZ22zn10ieC13PXlD7VPy', NULL, '2025-08-05 06:25:02', '2025-08-05 06:25:02'),
	(19, 'Rydha Ramlan Gunawan', 'maintenance.dies@thaisummit.co.id', 'rydha', '243.09.10', 13, 11, 1, NULL, '$2y$10$HhE8.mLb0C1.YW90Pk5b5eSfCkFNOSobwjNCM78GEWZtTd/uUllei', NULL, '2025-08-13 01:59:44', '2025-08-13 01:59:44'),
	(20, 'Ma\'mun Murod Ashari', 'mamun.mur@thaisummit.co.id', 'mamun', '137.05.09', 13, 9, 1, NULL, '$2y$10$huShxNBFCt2.DoGtOTlcwuf4tLEGs9As3p1TrsbxsOrndldrkOfnS', NULL, '2025-08-13 02:02:32', '2025-08-13 02:02:32'),
	(21, 'Mokh Teguh Budimansyah. P', 'legal.hr@thaisummit.co.id', 'mohteguh', '945.06.25', 3, 14, 1, NULL, '$2y$10$MSJY3X7IiCavhX2.KwkfiOIcRF7e3cKhX9FWh3D5VFOkF6VDH2b/y', NULL, '2025-08-13 02:04:15', '2025-08-13 02:04:15'),
	(22, 'Fatkhurrohman', 'hse.itsa@thaisummit.co.id', 'fatkhurrohman', '374.07.12', 3, 11, 1, NULL, '$2y$10$o2OFVRcWF6FerzOh8i4tj.5qsPMsDkEOtpklaClFfvsGahGmsGBWe', NULL, '2025-08-13 02:05:37', '2025-08-13 02:05:37'),
	(23, 'Acep Andi Suhendi', 'andi.suh@thaisummit.co.id', 'acepandi', '942.04.25', 3, 9, 1, NULL, '$2y$10$NIozEP44YOR0jYb1z9mTIeUMaE9NLkZN8Vmbmq5oAsOLzd0AjDkgi', NULL, '2025-08-13 02:08:54', '2025-08-13 02:08:54'),
	(24, 'User PLA', 'userpla@gmail.com', 'userpla', '900.00.00', 4, 9, 1, NULL, '$2y$10$Lupf7L4ANAqgIjsEQB41PuraQvHJTtPUTvZdcAscpaiiMSxGyGHiG', NULL, '2025-09-02 04:56:42', '2025-09-02 04:56:42'),
	(25, 'Sukmawati', 'sukmawati@thaisummit.co.id', 'Sukmawati', '1146.12.24', 1, 9, 2, NULL, '$2y$10$MI.WpK8IzPVS.i2Ys3356OZMoXWQW2lHaqOESZiAF7UTuYmLWBpxm', NULL, '2025-09-23 04:41:41', '2026-03-05 08:30:34'),
	(26, 'Rafi Mukaffah', 'mtn02.itsp@thaisummit.co.id', 'Rafi Mukaffah', '1093.07.24', 4, 11, 2, NULL, '$2y$10$sdXM4tAgxt/fe/CImARdS.2/LCgl6ZqPEqm1.MoaGNB2RDawZc4Te', NULL, '2026-02-20 06:34:39', '2026-03-02 06:29:39'),
	(27, 'Suci Puspa Amalia', 'prd01.itsp@thaisummit.co.id', 'sucipuspa', '377.11.18', 6, 11, 2, NULL, '$2y$10$XiUzFiPeH0MRw/DmCNncsOYYFXjTMMkdFMpkBXdyhYDclnYdUcx4.', NULL, '2026-02-20 06:39:55', '2026-03-02 06:30:51'),
	(29, 'Agung Sedayu', 'agung.sed@thaisummit.co.id', 'Agung Sedayu', '090.03.17', 6, 2, 2, NULL, '$2y$10$nM2Vu/X.P/qY8Ghwph/.kO01X/pxhQDdZAP180wvQbBuXBuifDH7S', NULL, '2026-02-26 07:00:55', '2026-03-02 06:39:47'),
	(30, 'Alfina Naditia Maharani', 'pc29.itsp@thaisummit.co.id', 'Alfina Naditia Maharani', '662.06.21', 21, 11, 2, NULL, '$2y$10$w3N9aH3xozeYbMLn4vUnOu0MCBw0lN9m26c6sn.jy4heI1ou3c96K', NULL, '2026-03-03 04:42:00', '2026-04-02 07:59:40'),
	(31, 'Alfirandi Mulya', 'alfirandi.mul@thaisummit.co.id', 'Alfirandi Mulya', '119.07.17', 21, 2, 2, NULL, '$2y$10$mSEtjhbOASxO6rpCqgQgsORbsqYpJjKINswW1uOp46ApkDEhz.hA.', NULL, '2026-03-03 05:42:47', '2026-03-03 05:42:47'),
	(32, 'Azimatul Karimah Muchtar', 'pc26.itsp@thaisummit.co.id', 'Azimatul Karimah Muchtar', '552.09.20', 16, 1, 2, NULL, '$2y$10$PqmK1SI1G4Wno7hgJ54oSOvMldHvsIo2do0v/xPmKizXsV6nrgpPu', NULL, '2026-03-03 05:51:34', '2026-03-03 05:51:34'),
	(33, 'Mochammad Fariz Nashruddin', 'hrga01.itsp@thaisummit.co.id', 'Mochammad Fariz Nashruddin', '1057.03.24', 3, 11, 2, NULL, '$2y$10$VZ.gHm791PfEyGsgTYFJSO4HGmEP7c5llqhqx5ZD7Cj02IVVbIkZu', NULL, '2026-03-03 07:29:50', '2026-03-03 07:29:50'),
	(34, 'Kurniawan Wijaya Saputro', 'kurniawan.wij@thaisummit.co.id', 'Kurniawan Wijaya Saputro', '872.02.23', 3, 9, 2, NULL, '$2y$10$fZX8fec2zuK4aGrlirniJO6ZXT4QMv7CX75sGnMVdvMLmXEwEGKzC', NULL, '2026-03-03 07:31:28', '2026-03-03 07:31:28'),
	(35, 'Wisnu Agung Febriana', 'dcc-01.itsp@thaisummit.co.id', 'Wisnu Agung Febriana', '670.07.21', 10, 11, 2, NULL, '$2y$10$Vpg8slxGjif4zy1sMQAPT.Mr/G0SxElaG7dVyBfWgk000nI8V1fOu', NULL, '2026-03-03 07:34:51', '2026-03-03 07:34:51'),
	(36, 'Shifa Khairunissa Umbara', 'pe25.itsp@thaisummit.co.id', 'Shifa Khairunissa Umbara', '1122.10.24', 14, 11, 2, NULL, '$2y$10$rbf8JLZ2NL50UIBXI0NLCOdel5KaFmDKQUvO/hpYGbC88Zb53P90G', NULL, '2026-03-03 08:40:08', '2026-03-04 00:49:50'),
	(37, 'Thanphasut Chailinfa', 'thanphasut.cha@thaisummit.co.th', 'Thanphasut Chailinfa', '1185.05.25', 14, 6, 2, NULL, '$2y$10$wZvFPh8Syp/j4KtMdVI4pOBWF2EaEki3Z1CYhvVBlCVSAfElYl4Z.', NULL, '2026-03-03 08:46:26', '2026-03-03 08:46:26'),
	(38, 'Dwi Yudho Irianto', 'qa12.itsp@thaisummit.co.id', 'Dwi Yudho Irianto', '1021.01.24', 9, 4, 2, NULL, '$2y$10$sEvAX30qb72YWAfz06qlfeg2ZwhNvOVCKbJZdqJZqOhXeZpdftLfG', NULL, '2026-03-04 07:46:19', '2026-03-04 07:47:04'),
	(39, 'Jumnong Jinaval', 'jumnong.jin@thaisummit.co.id', 'Jumnong Jinaval', '473.03.19', 9, 9, 2, NULL, '$2y$10$e45.znxJFE2uiuqtByRYE..d95iaXbyWi7999iweu1m7cuiWCUTvW', NULL, '2026-03-04 07:49:07', '2026-03-04 07:49:07');

-- Dumping structure for table portal-itsa.user_departments
CREATE TABLE IF NOT EXISTS `user_departments` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `department_id` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_departments_user_id_department_id_unique` (`user_id`,`department_id`),
  KEY `user_departments_department_id_index` (`department_id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table portal-itsa.user_departments: ~26 rows (approximately)
REPLACE INTO `user_departments` (`id`, `user_id`, `department_id`, `created_at`, `updated_at`) VALUES
	(1, 2, 10, '2026-03-06 03:17:52', '2026-03-06 03:17:52'),
	(2, 3, 9, '2026-03-06 03:17:52', '2026-03-06 03:17:52'),
	(3, 4, 9, '2026-03-06 03:17:52', '2026-03-06 03:17:52'),
	(4, 5, 10, '2026-03-06 03:17:52', '2026-03-06 03:17:52'),
	(5, 6, 9, '2026-03-06 03:17:52', '2026-03-06 03:17:52'),
	(6, 7, 10, '2026-03-06 03:17:52', '2026-03-06 03:17:52'),
	(7, 8, 10, '2026-03-06 03:17:52', '2026-03-06 03:17:52'),
	(8, 9, 13, '2026-03-06 03:17:52', '2026-03-06 03:17:52'),
	(9, 10, 1, '2026-03-06 03:17:52', '2026-03-06 03:17:52'),
	(10, 11, 13, '2026-03-06 03:17:52', '2026-03-06 03:17:52'),
	(11, 12, 18, '2026-03-06 03:17:52', '2026-03-06 03:17:52'),
	(12, 13, 9, '2026-03-06 03:17:52', '2026-03-06 03:17:52'),
	(13, 14, 9, '2026-03-06 03:17:52', '2026-03-06 03:17:52'),
	(14, 15, 1, '2026-03-06 03:17:52', '2026-03-06 03:17:52'),
	(15, 16, 9, '2026-03-06 03:17:52', '2026-03-06 03:17:52'),
	(16, 17, 9, '2026-03-06 03:17:52', '2026-03-06 03:17:52'),
	(17, 18, 10, '2026-03-06 03:17:52', '2026-03-06 03:17:52'),
	(18, 19, 13, '2026-03-06 03:17:52', '2026-03-06 03:17:52'),
	(19, 20, 13, '2026-03-06 03:17:52', '2026-03-06 03:17:52'),
	(20, 21, 3, '2026-03-06 03:17:52', '2026-03-06 03:17:52'),
	(21, 22, 3, '2026-03-06 03:17:52', '2026-03-06 03:17:52'),
	(22, 23, 3, '2026-03-06 03:17:52', '2026-03-06 03:17:52'),
	(23, 24, 4, '2026-03-06 03:17:52', '2026-03-06 03:17:52'),
	(24, 25, 1, '2026-03-06 03:17:52', '2026-03-06 03:17:52'),
	(25, 26, 6, '2026-03-06 03:17:52', '2026-03-06 03:17:52'),
	(26, 27, 6, '2026-03-06 03:17:52', '2026-03-06 03:17:52');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
