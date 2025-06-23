-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 19, 2025 at 08:56 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `nixty`
--

-- --------------------------------------------------------

--
-- Table structure for table `announcements`
--

CREATE TABLE `announcements` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `is_new` tinyint(1) DEFAULT 1,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `announcements`
--

INSERT INTO `announcements` (`id`, `title`, `content`, `image_url`, `is_new`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Microsoft Office 2021 Now Available', 'Microsoft Office Professional Plus 2021 is now available with new features, improved performance, and modern design. Get the latest productivity suite today!', '/api/announcements/1/image', 1, 'active', '2025-06-18 07:25:23', '2025-06-18 07:25:23'),
(2, 'Special Pricing for Microsoft Products', 'Get authentic Microsoft software at competitive prices. All products come with genuine licenses and full support.', '/api/announcements/2/image', 1, 'active', '2025-06-18 07:25:23', '2025-06-18 07:25:23'),
(3, 'Microsoft Project & Visio Professional', 'Professional project management and diagramming tools now available. Perfect for businesses and professionals who need advanced planning capabilities.', '/api/announcements/3/image', 1, 'active', '2025-06-18 07:25:23', '2025-06-18 07:25:23'),
(4, 'Office 365 Subscription Benefits', 'Subscribe to Office 365 and get regular updates, cloud storage, and always up-to-date features. Best value for continuous productivity.', '/api/announcements/4/image', 1, 'active', '2025-06-18 07:25:23', '2025-06-18 07:25:23'),
(5, 'Genuine Microsoft Software Guarantee', 'All our Microsoft products are 100% genuine with valid licenses. Get authentic software with full Microsoft support and updates.', '/api/announcements/5/image', 0, 'active', '2025-06-18 07:25:23', '2025-06-18 07:25:23');

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `slug`, `description`, `created_at`) VALUES
(1, 'Microsoft Office', 'microsoft-office', 'Microsoft Office Professional Plus suite with Word, Excel, PowerPoint, and more', '2025-06-18 07:25:23'),
(2, 'Microsoft Project', 'microsoft-project', 'Microsoft Project Professional for project management and planning', '2025-06-18 07:25:23'),
(3, 'Microsoft Visio', 'microsoft-visio', 'Microsoft Visio Professional for diagramming and flowcharts', '2025-06-18 07:25:23');

-- --------------------------------------------------------

--
-- Table structure for table `deals`
--

CREATE TABLE `deals` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `old_price` decimal(10,2) DEFAULT NULL,
  `new_price` decimal(10,2) NOT NULL,
  `discount_percentage` int(11) DEFAULT NULL,
  `badge` varchar(100) DEFAULT NULL,
  `background_image_url` varchar(500) DEFAULT NULL,
  `is_featured` tinyint(1) DEFAULT 0,
  `status` enum('active','inactive','expired') DEFAULT 'active',
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `deals`
--

INSERT INTO `deals` (`id`, `title`, `description`, `product_id`, `old_price`, `new_price`, `discount_percentage`, `badge`, `background_image_url`, `is_featured`, `status`, `expires_at`, `created_at`, `updated_at`) VALUES
(1, 'Microsoft Office 2021 Special Price', 'Get Microsoft Office Professional Plus 2021 at the best price. Complete productivity suite with lifetime license.', 3, 150000.00, 120000.00, 20, 'Best Seller', '/api/deals/office-2021/background-image', 1, 'active', '2025-07-18 07:25:23', '2025-06-18 07:25:23', '2025-06-18 07:25:23'),
(2, 'Office 365 Annual Subscription', 'Subscribe to Office 365 and get continuous updates, cloud storage, and premium features. Best value for businesses.', 4, 60000.00, 50000.00, 17, 'Popular Choice', '/api/deals/office-365/image', 1, 'active', '2025-08-17 07:25:23', '2025-06-18 07:25:23', '2025-06-18 07:25:23'),
(3, 'Microsoft Project & Visio Bundle', 'Get both Microsoft Project and Visio Professional 2021 at a special bundle price. Perfect for project managers and designers.', 7, 90000.00, 75000.00, 17, 'Bundle Deal', '/api/deals/project-visio/image', 0, 'active', '2025-07-03 07:25:23', '2025-06-18 07:25:23', '2025-06-18 07:25:23');

-- --------------------------------------------------------

--
-- Table structure for table `hero_slides`
--

CREATE TABLE `hero_slides` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `background_image_url` varchar(500) DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `is_new` tinyint(1) DEFAULT 0,
  `status` enum('active','inactive') DEFAULT 'active',
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `hero_slides`
--

INSERT INTO `hero_slides` (`id`, `title`, `description`, `background_image_url`, `product_id`, `is_new`, `status`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 'Microsoft Office Professional Plus 2021', 'Get the latest Microsoft Office suite with enhanced features, improved performance, and modern design. Perfect for professionals and businesses.', '/api/products/office-2021/hero-image', 3, 1, 'active', 1, '2025-06-18 07:25:23', '2025-06-18 07:25:23'),
(2, 'Microsoft Office 365 - Always Updated', 'Subscribe to Office 365 and never worry about updates again. Get the latest features, cloud storage, and continuous productivity improvements.', '/api/products/office-365/hero-image', 4, 1, 'active', 2, '2025-06-18 07:25:23', '2025-06-18 07:25:23'),
(3, 'Complete Microsoft Software Solutions', 'From Office productivity to Project management and Visio diagramming - get all your Microsoft software needs in one place with genuine licenses.', '/api/products/complete-suite/hero-image', 1, 0, 'active', 3, '2025-06-18 07:25:23', '2025-06-18 07:25:23');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `version` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `short_description` varchar(500) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `currency` varchar(10) DEFAULT 'IDR',
  `period` varchar(50) DEFAULT NULL,
  `category_id` int(11) DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `is_new` tinyint(1) DEFAULT 0,
  `discount_percentage` int(11) DEFAULT 0,
  `time_left` varchar(50) DEFAULT NULL,
  `is_featured` tinyint(1) DEFAULT 0,
  `is_trending` tinyint(1) DEFAULT 0,
  `sold_count` int(11) DEFAULT 0,
  `view_count` int(11) DEFAULT 0,
  `status` enum('active','inactive','out_of_stock') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `version`, `description`, `short_description`, `price`, `currency`, `period`, `category_id`, `image_url`, `is_new`, `discount_percentage`, `time_left`, `is_featured`, `is_trending`, `sold_count`, `view_count`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Microsoft Office Pro Plus', '2016', 'Microsoft Office Professional Plus 2016 includes Word, Excel, PowerPoint, Outlook, OneNote, Access, and Publisher. Perfect for professional productivity.', 'Complete Office suite with all essential apps', 40000.00, 'IDR', NULL, 1, '/api/products/office-2016/image', 0, 0, NULL, 0, 0, 0, 0, 'active', '2025-06-18 07:25:23', '2025-06-18 07:25:23'),
(2, 'Microsoft Office Pro Plus', '2019', 'Microsoft Office Professional Plus 2019 with enhanced features and improved performance. Includes all core Office applications with latest updates.', 'Enhanced Office suite with 2019 features', 40000.00, 'IDR', NULL, 1, '/api/products/office-2019/image', 0, 0, NULL, 0, 0, 0, 0, 'active', '2025-06-18 07:25:23', '2025-06-18 07:25:23'),
(3, 'Microsoft Office Pro Plus', '2021', 'Microsoft Office Professional Plus 2021 - the latest version with new collaboration features, improved performance, and modern design.', 'Latest Office suite with cutting-edge features', 120000.00, 'IDR', NULL, 1, '/api/products/office-2021/image', 1, 0, NULL, 1, 1, 0, 0, 'active', '2025-06-18 07:25:23', '2025-06-18 07:25:23'),
(4, 'Microsoft Office Pro Plus', '365', 'Microsoft Office 365 Professional Plus with cloud integration, regular updates, and 1TB OneDrive storage. Always up-to-date productivity suite.', 'Cloud-based Office with regular updates', 50000.00, 'IDR', '/ year', 1, '/api/products/office-365/image', 1, 0, NULL, 1, 1, 0, 0, 'active', '2025-06-18 07:25:23', '2025-06-18 07:25:23'),
(5, 'Microsoft Project Pro', '2016', 'Microsoft Project Professional 2016 for comprehensive project management. Plan, track, and manage projects with powerful tools and reporting.', 'Professional project management solution', 30000.00, 'IDR', NULL, 2, '/api/products/project-2016/image', 0, 0, NULL, 0, 0, 0, 0, 'active', '2025-06-18 07:25:23', '2025-06-18 07:25:23'),
(6, 'Microsoft Project Pro', '2019', 'Microsoft Project Professional 2019 with enhanced project planning capabilities, improved collaboration, and better resource management.', 'Advanced project management with 2019 features', 35000.00, 'IDR', NULL, 2, '/api/products/project-2019/image', 0, 0, NULL, 0, 0, 0, 0, 'active', '2025-06-18 07:25:23', '2025-06-18 07:25:23'),
(7, 'Microsoft Project Pro', '2021', 'Microsoft Project Professional 2021 - the latest project management solution with modern interface and enhanced collaboration features.', 'Latest project management with modern tools', 40000.00, 'IDR', NULL, 2, '/api/products/project-2021/image', 1, 0, NULL, 0, 1, 0, 0, 'active', '2025-06-18 07:25:23', '2025-06-18 07:25:23'),
(8, 'Microsoft Visio Pro', '2016', 'Microsoft Visio Professional 2016 for creating professional diagrams, flowcharts, and organizational charts with extensive templates.', 'Professional diagramming and flowchart tool', 30000.00, 'IDR', NULL, 3, '/api/products/visio-2016/image', 0, 0, NULL, 0, 0, 0, 0, 'active', '2025-06-18 07:25:23', '2025-06-18 07:25:23'),
(9, 'Microsoft Visio Pro', '2019', 'Microsoft Visio Professional 2019 with improved diagramming tools, enhanced collaboration, and new templates for modern workflows.', 'Enhanced diagramming with 2019 features', 35000.00, 'IDR', NULL, 3, '/api/products/visio-2019/image', 0, 0, NULL, 0, 0, 0, 0, 'active', '2025-06-18 07:25:23', '2025-06-18 07:25:23'),
(10, 'Microsoft Visio Pro', '2021', 'Microsoft Visio Professional 2021 - the latest diagramming solution with modern templates, improved performance, and better integration.', 'Latest diagramming tool with modern features', 40000.00, 'IDR', NULL, 3, '/api/products/visio-2021/image', 1, 0, NULL, 0, 1, 0, 0, 'active', '2025-06-18 07:25:23', '2025-06-18 07:25:23');



--
-- Table structure for table `product_licenses`
--

CREATE TABLE `product_licenses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `product_id` int(11) NOT NULL,
  `license_type` enum('product_key','email_password','access_code','download_link') NOT NULL DEFAULT 'product_key',
  `product_key` varchar(500) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `access_code` varchar(255) DEFAULT NULL,
  `download_link` varchar(1000) DEFAULT NULL,
  `additional_info` text DEFAULT NULL,
  `is_used` tinyint(1) DEFAULT 0,
  `used_by_transaction_id` int(11) DEFAULT NULL,
  `used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `status` enum('available','used','expired','reserved') DEFAULT 'available',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_product_licenses_product_id` (`product_id`),
  KEY `idx_product_licenses_status` (`status`),
  KEY `idx_product_licenses_license_type` (`license_type`),
  KEY `idx_product_licenses_is_used` (`is_used`),
  KEY `idx_product_licenses_expires_at` (`expires_at`),
  KEY `idx_product_licenses_transaction` (`used_by_transaction_id`),
  KEY `idx_product_licenses_product_status` (`product_id`, `status`),
  KEY `idx_product_licenses_type_status` (`license_type`, `status`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product_licenses`
--

INSERT INTO `product_licenses` (`id`, `product_id`, `license_type`, `product_key`, `email`, `password`, `access_code`, `download_link`, `additional_info`, `is_used`, `used_by_transaction_id`, `used_at`, `expires_at`, `status`, `notes`, `created_at`, `updated_at`) VALUES
(1, 1, 'product_key', 'NKJFK-GPHP7-G8C3J-P6JXR-HQRJR', NULL, NULL, NULL, NULL, 'Microsoft Office Pro Plus 2016 - Retail License', 0, NULL, NULL, NULL, 'available', 'Valid for single PC installation', '2025-06-20 07:25:23', '2025-06-20 07:25:23'),
(2, 1, 'product_key', 'W269N-WFGWX-YVC9B-4J6C9-T83GX', NULL, NULL, NULL, NULL, 'Microsoft Office Pro Plus 2016 - Volume License', 0, NULL, NULL, NULL, 'available', 'Valid for single PC installation', '2025-06-20 07:25:23', '2025-06-20 07:25:23'),
(3, 1, 'product_key', 'XQNVK-8JYDB-WJ9W3-YJ8YR-WFG99', NULL, NULL, NULL, NULL, 'Microsoft Office Pro Plus 2016 - OEM License', 0, NULL, NULL, NULL, 'available', 'Valid for single PC installation', '2025-06-20 07:25:23', '2025-06-20 07:25:23'),
(4, 2, 'product_key', 'NKJFK-GPHP7-G8C3J-P6JXR-HQRJR', NULL, NULL, NULL, NULL, 'Microsoft Office Pro Plus 2019 - Retail License', 0, NULL, NULL, NULL, 'available', 'Valid for single PC installation', '2025-06-20 07:25:23', '2025-06-20 07:25:23'),
(5, 2, 'product_key', 'W269N-WFGWX-YVC9B-4J6C9-T83GX', NULL, NULL, NULL, NULL, 'Microsoft Office Pro Plus 2019 - Volume License', 0, NULL, NULL, NULL, 'available', 'Valid for single PC installation', '2025-06-20 07:25:23', '2025-06-20 07:25:23'),
(6, 3, 'product_key', 'FXYTK-NJJ8C-GB6DW-3DYQT-6F7TH', NULL, NULL, NULL, NULL, 'Microsoft Office Pro Plus 2021 - Retail License', 0, NULL, NULL, NULL, 'available', 'Valid for single PC installation', '2025-06-20 07:25:23', '2025-06-20 07:25:23'),
(7, 3, 'product_key', 'KDX7X-BNVR8-TXXGX-4Q7Y8-78VT3', NULL, NULL, NULL, NULL, 'Microsoft Office Pro Plus 2021 - Volume License', 0, NULL, NULL, NULL, 'available', 'Valid for single PC installation', '2025-06-20 07:25:23', '2025-06-20 07:25:23'),
(8, 4, 'email_password', NULL, 'office365user1@nixtystore.com', 'SecurePass123!', NULL, NULL, 'Microsoft Office 365 - 1 Year Subscription', 0, NULL, NULL, '2026-06-20 07:25:23', 'available', 'Includes 1TB OneDrive storage', '2025-06-20 07:25:23', '2025-06-20 07:25:23'),
(9, 4, 'email_password', NULL, 'office365user2@nixtystore.com', 'SecurePass456!', NULL, NULL, 'Microsoft Office 365 - 1 Year Subscription', 0, NULL, NULL, '2026-06-20 07:25:23', 'available', 'Includes 1TB OneDrive storage', '2025-06-20 07:25:23', '2025-06-20 07:25:23'),
(10, 4, 'email_password', NULL, 'office365user3@nixtystore.com', 'SecurePass789!', NULL, NULL, 'Microsoft Office 365 - 1 Year Subscription', 0, NULL, NULL, '2026-06-20 07:25:23', 'available', 'Includes 1TB OneDrive storage', '2025-06-20 07:25:23', '2025-06-20 07:25:23'),
(11, 5, 'product_key', 'YG9NW-3K39V-2T3HJ-93F3Q-G83KT', NULL, NULL, NULL, NULL, 'Microsoft Project Pro 2016 - Retail License', 0, NULL, NULL, NULL, 'available', 'Professional project management', '2025-06-20 07:25:23', '2025-06-20 07:25:23'),
(12, 5, 'product_key', 'GNFHQ-F6YQM-KQDGJ-327XX-KQBVC', NULL, NULL, NULL, NULL, 'Microsoft Project Pro 2016 - Volume License', 0, NULL, NULL, NULL, 'available', 'Professional project management', '2025-06-20 07:25:23', '2025-06-20 07:25:23'),
(13, 6, 'product_key', 'B4NPR-3FKK7-T2MBV-FRQ4W-PKD2B', NULL, NULL, NULL, NULL, 'Microsoft Project Pro 2019 - Retail License', 0, NULL, NULL, NULL, 'available', 'Enhanced project management', '2025-06-20 07:25:23', '2025-06-20 07:25:23'),
(14, 6, 'product_key', 'C4F7P-NCP8C-6CQPT-MQHV9-JXD2M', NULL, NULL, NULL, NULL, 'Microsoft Project Pro 2019 - Volume License', 0, NULL, NULL, NULL, 'available', 'Enhanced project management', '2025-06-20 07:25:23', '2025-06-20 07:25:23'),
(15, 7, 'product_key', 'FTNXH-6F7QF-W7Q2V-4Y9R3-BHD3F', NULL, NULL, NULL, NULL, 'Microsoft Project Pro 2021 - Retail License', 0, NULL, NULL, NULL, 'available', 'Latest project management features', '2025-06-20 07:25:23', '2025-06-20 07:25:23'),
(16, 7, 'product_key', 'VK7JG-NPHTM-C97JM-9MPGT-3V66T', NULL, NULL, NULL, NULL, 'Microsoft Project Pro 2021 - Volume License', 0, NULL, NULL, NULL, 'available', 'Latest project management features', '2025-06-20 07:25:23', '2025-06-20 07:25:23'),
(17, 8, 'product_key', 'PD3PC-RHNGV-FXJ29-8JK7D-RJRJK', NULL, NULL, NULL, NULL, 'Microsoft Visio Pro 2016 - Retail License', 0, NULL, NULL, NULL, 'available', 'Professional diagramming tool', '2025-06-20 07:25:23', '2025-06-20 07:25:23'),
(18, 8, 'product_key', 'W9WQP-68D7J-PQBBB-X9XYP-VQ235', NULL, NULL, NULL, NULL, 'Microsoft Visio Pro 2016 - Volume License', 0, NULL, NULL, NULL, 'available', 'Professional diagramming tool', '2025-06-20 07:25:23', '2025-06-20 07:25:23'),
(19, 9, 'product_key', '9BGNQ-K37YR-RQHF2-38RQ3-7VCBB', NULL, NULL, NULL, NULL, 'Microsoft Visio Pro 2019 - Retail License', 0, NULL, NULL, NULL, 'available', 'Enhanced diagramming features', '2025-06-20 07:25:23', '2025-06-20 07:25:23'),
(20, 9, 'product_key', 'VTC6B-2B3YB-MK6YB-6BFGF-7JMNH', NULL, NULL, NULL, NULL, 'Microsoft Visio Pro 2019 - Volume License', 0, NULL, NULL, NULL, 'available', 'Enhanced diagramming features', '2025-06-20 07:25:23', '2025-06-20 07:25:23'),
(21, 10, 'product_key', 'KNH8D-FGHT4-T8RJK-QJRJK-QJRJK', NULL, NULL, NULL, NULL, 'Microsoft Visio Pro 2021 - Retail License', 0, NULL, NULL, NULL, 'available', 'Latest diagramming features', '2025-06-20 07:25:23', '2025-06-20 07:25:23'),
(22, 10, 'product_key', 'LTMJB-96JKV-X9X9F-D7R93-T43MF', NULL, NULL, NULL, NULL, 'Microsoft Visio Pro 2021 - Volume License', 0, NULL, NULL, NULL, 'available', 'Latest diagramming features', '2025-06-20 07:25:23', '2025-06-20 07:25:23');

-- --------------------------------------------------------

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `id` int(11) NOT NULL,
  `order_id` varchar(100) NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `amount` decimal(15,2) NOT NULL,
  `status` varchar(20) NOT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `va_number` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `account_type` enum('user','admin') NOT NULL DEFAULT 'user',
  `google_id` varchar(255) DEFAULT NULL,
  `profile_picture` varchar(255) DEFAULT NULL,
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expires` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `name`, `created_at`, `account_type`, `google_id`, `profile_picture`, `reset_token`, `reset_token_expires`) VALUES
(1, 'test@example.com', '$2b$10$6.2aamESfPTT7S.7GtDk4.UZq5Q7e9duq9mEzKGCFkHdzx9iVXbuW', 'test', '2025-05-24 19:29:02', 'admin', NULL, NULL, NULL, NULL),
(4, 'test2@example.com', '$2b$10$nnW4cKaS.rTbCXf0acAyN.9x59uKCCgtmZ3zYYAZvo0ALUV6WVvJW', 'test2', '2025-05-24 19:36:47', 'user', NULL, NULL, NULL, NULL),
(5, 'fajar.febrian020202@gmail.com', '$2b$10$E.i88SNd6hZVSSqsGGLYBOEo/SUqjiclKffZJaJoEwjxdRmHpoaTi', 'Muhammad Fajar Febrian', '2025-05-25 14:37:07', 'user', '101149504362764463138', 'https://lh3.googleusercontent.com/a/ACg8ocIs8kdgb9R54Mx5f1ezdyqL1nnKitIVGA-pWq5ysTotxLvBXrk=s96-c', NULL, NULL),
(6, 'admin@nixty.com', '$2b$10$XeHYX9LlFiJBfcbg.jGX8uVVaul5mWBhYl2aHk8eQJKG9hSKwY1Mu', 'Admin User', '2025-05-25 18:17:48', 'admin', NULL, NULL, NULL, NULL),
(7, 'user@nixty.com', '$2b$10$4Ky.qdI2MvgvJCyYLIAJXeRbX5hSMZ9TBgUJMNf0DKOGhOHBVRMSe', 'Regular User', '2025-05-25 18:17:48', 'user', NULL, NULL, NULL, NULL),
(12, 'test4@example.com', '$2b$10$ilnTVstvUqibHevDxs0EjerImglfTlCbKNhC/zyqz8UPjpCIrr1Tq', 'test4', '2025-06-05 16:14:22', 'user', NULL, NULL, NULL, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `announcements`
--
ALTER TABLE `announcements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_announcements_status` (`status`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indexes for table `deals`
--
ALTER TABLE `deals`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `idx_deals_status` (`status`),
  ADD KEY `idx_deals_featured` (`is_featured`),
  ADD KEY `idx_deals_expires` (`expires_at`);

--
-- Indexes for table `hero_slides`
--
ALTER TABLE `hero_slides`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `idx_hero_slides_status` (`status`),
  ADD KEY `idx_hero_slides_sort` (`sort_order`);



--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_products_category` (`category_id`),
  ADD KEY `idx_products_status` (`status`),
  ADD KEY `idx_products_featured` (`is_featured`),
  ADD KEY `idx_products_trending` (`is_trending`),
  ADD KEY `idx_products_version` (`version`),
  ADD KEY `idx_products_name_version` (`name`,`version`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_order_id` (`order_id`),
  ADD KEY `idx_transactions_status` (`status`),
  ADD KEY `idx_transactions_payment_method` (`payment_method`),
  ADD KEY `idx_transactions_created_at` (`created_at`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_google_id` (`google_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `announcements`
--
ALTER TABLE `announcements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `deals`
--
ALTER TABLE `deals`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `hero_slides`
--
ALTER TABLE `hero_slides`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `deals`
--
ALTER TABLE `deals`
  ADD CONSTRAINT `deals_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `hero_slides`
--
ALTER TABLE `hero_slides`
  ADD CONSTRAINT `hero_slides_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `product_licenses`
--
ALTER TABLE `product_licenses`
  ADD CONSTRAINT `product_licenses_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `product_licenses_ibfk_2` FOREIGN KEY (`used_by_transaction_id`) REFERENCES `transactions` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
