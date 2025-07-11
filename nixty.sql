-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 10, 2025 at 12:01 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

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
  `title` varchar(50) NOT NULL,
  `content` text DEFAULT NULL,
  `image_url` varchar(100) DEFAULT NULL,
  `is_new` tinyint(4) DEFAULT 1,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `announcements`
--

INSERT INTO `announcements` (`id`, `title`, `content`, `image_url`, `is_new`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Microsoft Office 2021 Now Available', 'Microsoft Office Professional Plus 2021 is now available with new features, improved performance, and modern design. Get the latest productivity suite today!', '/api/announcements/1/image', 1, 'active', '2025-06-18 00:25:23', '2025-06-18 00:25:23'),
(2, 'Special Pricing for Microsoft Products', 'Get authentic Microsoft software at competitive prices. All products come with genuine licenses and full support.', '/api/announcements/2/image', 1, 'active', '2025-06-18 00:25:23', '2025-06-18 00:25:23'),
(3, 'Microsoft Project & Visio Professional', 'Professional project management and diagramming tools now available. Perfect for businesses and professionals who need advanced planning capabilities.', '/api/announcements/3/image', 1, 'active', '2025-06-18 00:25:23', '2025-06-18 00:25:23'),
(4, 'Office 365 Subscription Benefits', 'Subscribe to Office 365 and get regular updates, cloud storage, and always up-to-date features. Best value for continuous productivity.', '/api/announcements/4/image', 1, 'active', '2025-06-18 00:25:23', '2025-06-18 00:25:23'),
(5, 'Genuine Microsoft Software Guarantee', 'All our Microsoft products are 100% genuine with valid licenses. Get authentic software with full Microsoft support and updates.', '/api/announcements/5/image', 0, 'active', '2025-06-18 00:25:23', '2025-06-18 00:25:23');

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `slug` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `slug`, `description`, `created_at`) VALUES
(1, 'Microsoft Office', 'office', 'Microsoft Office Professional Plus suite with Word, Excel, PowerPoint, and more', '2025-06-18 00:25:23'),
(2, 'Microsoft Project', 'project', 'Microsoft Project Professional for project management and planning', '2025-06-18 00:25:23'),
(3, 'Microsoft Visio', 'visio', 'Microsoft Visio Professional for diagramming and flowcharts', '2025-06-18 00:25:23');

-- --------------------------------------------------------

--
-- Table structure for table `deals`
--

CREATE TABLE `deals` (
  `id` int(11) NOT NULL,
  `title` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `old_price` decimal(10,2) DEFAULT NULL,
  `new_price` decimal(10,2) NOT NULL,
  `discount_percentage` tinyint(3) UNSIGNED DEFAULT NULL,
  `badge` varchar(50) DEFAULT NULL,
  `background_image_url` varchar(100) DEFAULT NULL,
  `is_featured` tinyint(4) DEFAULT 0,
  `status` enum('active','inactive','expired') DEFAULT 'active',
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `deals`
--

INSERT INTO `deals` (`id`, `title`, `description`, `product_id`, `old_price`, `new_price`, `discount_percentage`, `badge`, `background_image_url`, `is_featured`, `status`, `expires_at`, `created_at`, `updated_at`) VALUES
(1, 'Microsoft Office 2021 Special Price', 'Get Microsoft Office Professional Plus 2021 at the best price. Complete productivity suite with lifetime license.', 3, 150000.00, 120000.00, 20, 'Best Seller', '/api/deals/office-2021/background-image', 1, 'active', '2025-07-18 00:25:23', '2025-06-18 00:25:23', '2025-06-18 00:25:23'),
(2, 'Office 365 Annual Subscription', 'Subscribe to Office 365 and get continuous updates, cloud storage, and premium features. Best value for businesses.', 4, 60000.00, 50000.00, 17, 'Popular Choice', '/api/deals/office-365/image', 1, 'active', '2025-08-17 00:25:23', '2025-06-18 00:25:23', '2025-06-18 00:25:23'),
(3, 'Microsoft Project & Visio Bundle', 'Get both Microsoft Project and Visio Professional 2021 at a special bundle price. Perfect for project managers and designers.', 7, 90000.00, 75000.00, 17, 'Bundle Deal', '/api/deals/project-visio/image', 0, 'active', '2025-07-03 00:25:23', '2025-06-18 00:25:23', '2025-06-18 00:25:23');

-- --------------------------------------------------------

--
-- Table structure for table `hero_slides`
--

CREATE TABLE `hero_slides` (
  `id` int(11) NOT NULL,
  `title` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `background_image_url` varchar(100) DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `is_new` tinyint(4) DEFAULT 0,
  `status` enum('active','inactive') DEFAULT 'active',
  `sort_order` tinyint(4) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `hero_slides`
--

INSERT INTO `hero_slides` (`id`, `title`, `description`, `background_image_url`, `product_id`, `is_new`, `status`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 'Microsoft Office Professional Plus 2021', 'Get the latest Microsoft Office suite with enhanced features, improved performance, and modern design. Perfect for professionals and businesses.', '/api/products/office-2021/hero-image', 3, 1, 'active', 1, '2025-06-18 00:25:23', '2025-06-18 00:25:23'),
(2, 'Microsoft Office 365 - Always Updated', 'Subscribe to Office 365 and never worry about updates again. Get the latest features, cloud storage, and continuous productivity improvements.', '/api/products/office-365/hero-image', 4, 1, 'active', 2, '2025-06-18 00:25:23', '2025-06-18 00:25:23'),
(3, 'Complete Microsoft Software Solutions', 'From Office productivity to Project management and Visio diagramming - get all your Microsoft software needs in one place with genuine licenses.', '/api/products/complete-suite/hero-image', 1, 0, 'active', 3, '2025-06-18 00:25:23', '2025-06-18 00:25:23');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `category_id` int(11) DEFAULT NULL,
  `name` varchar(50) NOT NULL,
  `version` varchar(50) DEFAULT NULL,
  `slug` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `short_description` varchar(50) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `currency` varchar(5) DEFAULT 'IDR',
  `period` varchar(50) DEFAULT NULL,
  `image_url` varchar(100) DEFAULT NULL,
  `is_new` tinyint(4) DEFAULT 0,
  `discount_percentage` tinyint(4) DEFAULT 0,
  `time_left` varchar(50) DEFAULT NULL,
  `is_featured` tinyint(4) DEFAULT 0,
  `is_trending` tinyint(4) DEFAULT 0,
  `sold_count` bigint(20) DEFAULT 0,
  `view_count` bigint(20) DEFAULT 0,
  `status` enum('active','inactive','out_of_stock') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `min_stock_threshold` tinyint(4) DEFAULT 5 COMMENT 'Batas minimum stok sebelum status menjadi low_stock',
  `license_type_default` enum('product_key','email_password','access_code','download_link') DEFAULT 'product_key' COMMENT 'Tipe lisensi default untuk produk ini'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `version`, `slug`, `description`, `short_description`, `price`, `currency`, `period`, `category_id`, `image_url`, `is_new`, `discount_percentage`, `time_left`, `is_featured`, `is_trending`, `sold_count`, `view_count`, `status`, `created_at`, `updated_at`, `min_stock_threshold`, `license_type_default`) VALUES
(1, 'Microsoft Office Pro Plus', '2016', 'office-pro-plus', 'Microsoft Office Professional Plus 2016 includes Word, Excel, PowerPoint, Outlook, OneNote, Access, and Publisher. Perfect for professional productivity.', 'Complete Office suite with all essential apps', 40000.00, 'IDR', NULL, 1, '/api/products/office-2016/image', 0, 0, NULL, 0, 0, 0, 0, 'active', '2025-06-18 00:25:23', '2025-06-18 00:25:23', 5, 'product_key'),
(2, 'Microsoft Office Pro Plus', '2019', 'office-pro-plus', 'Microsoft Office Professional Plus 2019 with enhanced features and improved performance. Includes all core Office applications with latest updates.', 'Enhanced Office suite with 2019 features', 40000.00, 'IDR', NULL, 1, '/api/products/office-2019/image', 0, 0, NULL, 0, 0, 0, 0, 'active', '2025-06-18 00:25:23', '2025-06-18 00:25:23', 5, 'product_key'),
(3, 'Microsoft Office Pro Plus', '2021', 'office-pro-plus', 'Microsoft Office Professional Plus 2021 - the latest version with new collaboration features, improved performance, and modern design.', 'Latest Office suite with cutting-edge features', 120000.00, 'IDR', NULL, 1, '/api/products/office-2021/image', 1, 0, NULL, 1, 1, 0, 0, 'active', '2025-06-18 00:25:23', '2025-06-18 00:25:23', 5, 'product_key'),
(4, 'Microsoft Office Pro Plus', '365', 'office-pro-plus', 'Microsoft Office 365 Professional Plus with cloud integration, regular updates, and 1TB OneDrive storage. Always up-to-date productivity suite.', 'Cloud-based Office with regular updates', 50000.00, 'IDR', '/ year', 1, '/api/products/office-365/image', 1, 0, NULL, 1, 1, 0, 0, 'active', '2025-06-18 00:25:23', '2025-06-18 00:25:23', 5, 'email_password'),
(5, 'Microsoft Project Pro', '2016', 'project-pro', 'Microsoft Project Professional 2016 for comprehensive project management. Plan, track, and manage projects with powerful tools and reporting.', 'Professional project management solution', 30000.00, 'IDR', NULL, 2, '/api/products/project-2016/image', 0, 0, NULL, 0, 0, 0, 0, 'active', '2025-06-18 00:25:23', '2025-06-18 00:25:23', 5, 'product_key'),
(6, 'Microsoft Project Pro', '2019', 'project-pro', 'Microsoft Project Professional 2019 with enhanced project planning capabilities, improved collaboration, and better resource management.', 'Advanced project management with 2019 features', 35000.00, 'IDR', NULL, 2, '/api/products/project-2019/image', 0, 0, NULL, 0, 0, 0, 0, 'active', '2025-06-18 00:25:23', '2025-06-18 00:25:23', 5, 'product_key'),
(7, 'Microsoft Project Pro', '2021', 'project-pro', 'Microsoft Project Professional 2021 - the latest project management solution with modern interface and enhanced collaboration features.', 'Latest project management with modern tools', 40000.00, 'IDR', NULL, 2, '/api/products/project-2021/image', 1, 0, NULL, 0, 1, 0, 0, 'active', '2025-06-18 00:25:23', '2025-06-18 00:25:23', 5, 'product_key'),
(8, 'Microsoft Visio Pro', '2016', 'visio-pro', 'Microsoft Visio Professional 2016 for creating professional diagrams, flowcharts, and organizational charts with extensive templates.', 'Professional diagramming and flowchart tool', 30000.00, 'IDR', NULL, 3, '/api/products/visio-2016/image', 0, 0, NULL, 0, 0, 0, 0, 'active', '2025-06-18 00:25:23', '2025-06-18 00:25:23', 5, 'product_key'),
(9, 'Microsoft Visio Pro', '2019', 'visio-pro', 'Microsoft Visio Professional 2019 with improved diagramming tools, enhanced collaboration, and new templates for modern workflows.', 'Enhanced diagramming with 2019 features', 35000.00, 'IDR', NULL, 3, '/api/products/visio-2019/image', 0, 0, NULL, 0, 0, 0, 0, 'active', '2025-06-18 00:25:23', '2025-06-18 00:25:23', 5, 'product_key'),
(10, 'Microsoft Visio Pro', '2021', 'visio-pro', 'Microsoft Visio Professional 2021 - the latest diagramming solution with modern templates, improved performance, and better integration.', 'Latest diagramming tool with modern features', 40000.00, 'IDR', NULL, 3, '/api/products/visio-2021/image', 1, 0, NULL, 0, 1, 0, 0, 'active', '2025-06-18 00:25:23', '2025-06-18 00:25:23', 5, 'product_key');

-- --------------------------------------------------------

--
-- Table structure for table `product_licenses`
--

CREATE TABLE `product_licenses` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `license_type` enum('product_key','email_password','access_code','download_link') NOT NULL DEFAULT 'product_key',
  `product_key` varchar(50) DEFAULT NULL,
  `email` varchar(50) DEFAULT NULL,
  `password` varchar(50) DEFAULT NULL,
  `access_code` varchar(50) DEFAULT NULL,
  `download_link` varchar(100) DEFAULT NULL,
  `additional_info` text DEFAULT NULL,
  `is_used` tinyint(4) DEFAULT 0,
  `used_by_transaction_id` int(11) DEFAULT NULL,
  `used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `status` enum('available','used','expired','reserved') DEFAULT 'available',
  `notes` text DEFAULT NULL,
  `send_license` tinyint(1) NOT NULL DEFAULT 1,
  `max_usage` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product_licenses`
--

INSERT INTO `product_licenses` (`id`, `product_id`, `license_type`, `product_key`, `email`, `password`, `access_code`, `download_link`, `additional_info`, `is_used`, `used_by_transaction_id`, `used_at`, `expires_at`, `status`, `notes`, `send_license`, `max_usage`, `created_at`, `updated_at`) VALUES
(1, 1, 'product_key', 'NKJFK-GPHP7-G8C3J-P6JXR-HQRJR', NULL, NULL, NULL, NULL, 'Microsoft Office Pro Plus 2016 - Retail License', 0, NULL, NULL, NULL, 'available', 'Valid for single PC installation', 1, 1, '2025-06-20 00:25:23', '2025-06-20 00:25:23'),
(2, 1, 'product_key', 'W269N-WFGWX-YVC9B-4J6C9-T83GX', NULL, NULL, NULL, NULL, 'Microsoft Office Pro Plus 2016 - Volume License', 0, NULL, NULL, NULL, 'available', 'Valid for single PC installation', 1, 1, '2025-06-20 00:25:23', '2025-06-20 00:25:23'),
(3, 1, 'product_key', 'XQNVK-8JYDB-WJ9W3-YJ8YR-WFG99', NULL, NULL, NULL, NULL, 'Microsoft Office Pro Plus 2016 - OEM License', 0, NULL, NULL, NULL, 'available', 'Valid for single PC installation', 1, 1, '2025-06-20 00:25:23', '2025-06-20 00:25:23'),
(4, 2, 'product_key', 'NKJFK-GPHP7-G8C3J-P6JXR-HQRJR', NULL, NULL, NULL, NULL, 'Microsoft Office Pro Plus 2019 - Retail License', 0, NULL, NULL, NULL, 'available', 'Valid for single PC installation', 1, 1, '2025-06-20 00:25:23', '2025-06-20 00:25:23'),
(5, 2, 'product_key', 'W269N-WFGWX-YVC9B-4J6C9-T83GX', NULL, NULL, NULL, NULL, 'Microsoft Office Pro Plus 2019 - Volume License', 0, NULL, NULL, NULL, 'available', 'Valid for single PC installation', 1, 1, '2025-06-20 00:25:23', '2025-06-20 00:25:23'),
(6, 3, 'product_key', 'FXYTK-NJJ8C-GB6DW-3DYQT-6F7TH', NULL, NULL, NULL, NULL, 'Microsoft Office Pro Plus 2021 - Retail License', 0, NULL, NULL, NULL, 'available', 'Valid for single PC installation', 1, 1, '2025-06-20 00:25:23', '2025-06-20 00:25:23'),
(7, 3, 'product_key', 'KDX7X-BNVR8-TXXGX-4Q7Y8-78VT3', NULL, NULL, NULL, NULL, 'Microsoft Office Pro Plus 2021 - Volume License', 0, NULL, NULL, NULL, 'available', 'Valid for single PC installation', 1, 1, '2025-06-20 00:25:23', '2025-06-20 00:25:23'),
(8, 4, 'email_password', NULL, 'office365user1@nixtystore.com', 'SecurePass123!', NULL, NULL, 'Microsoft Office 365 - 1 Year Subscription', 0, NULL, NULL, '2026-06-20 00:25:23', 'available', 'Includes 1TB OneDrive storage', 1, 1, '2025-06-20 00:25:23', '2025-06-20 00:25:23'),
(9, 4, 'email_password', NULL, 'office365user2@nixtystore.com', 'SecurePass456!', NULL, NULL, 'Microsoft Office 365 - 1 Year Subscription', 0, NULL, NULL, '2026-06-20 00:25:23', 'available', 'Includes 1TB OneDrive storage', 1, 1, '2025-06-20 00:25:23', '2025-06-20 00:25:23'),
(10, 4, 'email_password', NULL, 'office365user3@nixtystore.com', 'SecurePass789!', NULL, NULL, 'Microsoft Office 365 - 1 Year Subscription', 0, NULL, NULL, '2026-06-20 00:25:23', 'available', 'Includes 1TB OneDrive storage', 1, 1, '2025-06-20 00:25:23', '2025-06-20 00:25:23'),
(11, 5, 'product_key', 'YG9NW-3K39V-2T3HJ-93F3Q-G83KT', NULL, NULL, NULL, NULL, 'Microsoft Project Pro 2016 - Retail License', 0, NULL, NULL, NULL, 'available', 'Professional project management', 1, 1, '2025-06-20 00:25:23', '2025-06-20 00:25:23'),
(12, 5, 'product_key', 'GNFHQ-F6YQM-KQDGJ-327XX-KQBVC', NULL, NULL, NULL, NULL, 'Microsoft Project Pro 2016 - Volume License', 0, NULL, NULL, NULL, 'available', 'Professional project management', 1, 1, '2025-06-20 00:25:23', '2025-06-20 00:25:23'),
(13, 6, 'product_key', 'B4NPR-3FKK7-T2MBV-FRQ4W-PKD2B', NULL, NULL, NULL, NULL, 'Microsoft Project Pro 2019 - Retail License', 0, NULL, NULL, NULL, 'available', 'Enhanced project management', 1, 1, '2025-06-20 00:25:23', '2025-06-20 00:25:23'),
(14, 6, 'product_key', 'C4F7P-NCP8C-6CQPT-MQHV9-JXD2M', NULL, NULL, NULL, NULL, 'Microsoft Project Pro 2019 - Volume License', 0, NULL, NULL, NULL, 'available', 'Enhanced project management', 1, 1, '2025-06-20 00:25:23', '2025-06-20 00:25:23'),
(15, 7, 'product_key', 'FTNXH-6F7QF-W7Q2V-4Y9R3-BHD3F', NULL, NULL, NULL, NULL, 'Microsoft Project Pro 2021 - Retail License', 0, NULL, NULL, NULL, 'available', 'Latest project management features', 1, 1, '2025-06-20 00:25:23', '2025-06-20 00:25:23'),
(16, 7, 'product_key', 'VK7JG-NPHTM-C97JM-9MPGT-3V66T', NULL, NULL, NULL, NULL, 'Microsoft Project Pro 2021 - Volume License', 0, NULL, NULL, NULL, 'available', 'Latest project management features', 1, 1, '2025-06-20 00:25:23', '2025-06-20 00:25:23'),
(17, 8, 'product_key', 'PD3PC-RHNGV-FXJ29-8JK7D-RJRJK', NULL, NULL, NULL, NULL, 'Microsoft Visio Pro 2016 - Retail License', 0, NULL, NULL, NULL, 'available', 'Professional diagramming tool', 1, 1, '2025-06-20 00:25:23', '2025-06-20 00:25:23'),
(18, 8, 'product_key', 'W9WQP-68D7J-PQBBB-X9XYP-VQ235', NULL, NULL, NULL, NULL, 'Microsoft Visio Pro 2016 - Volume License', 0, NULL, NULL, NULL, 'available', 'Professional diagramming tool', 1, 1, '2025-06-20 00:25:23', '2025-06-20 00:25:23'),
(19, 9, 'product_key', '9BGNQ-K37YR-RQHF2-38RQ3-7VCBB', NULL, NULL, NULL, NULL, 'Microsoft Visio Pro 2019 - Retail License', 0, NULL, NULL, NULL, 'available', 'Enhanced diagramming features', 1, 1, '2025-06-20 00:25:23', '2025-06-20 00:25:23'),
(20, 9, 'product_key', 'VTC6B-2B3YB-MK6YB-6BFGF-7JMNH', NULL, NULL, NULL, NULL, 'Microsoft Visio Pro 2019 - Volume License', 0, NULL, NULL, NULL, 'available', 'Enhanced diagramming features', 1, 1, '2025-06-20 00:25:23', '2025-06-20 00:25:23'),
(21, 10, 'product_key', 'KNH8D-FGHT4-T8RJK-QJRJK-QJRJK', NULL, NULL, NULL, NULL, 'Microsoft Visio Pro 2021 - Retail License', 0, NULL, NULL, NULL, 'available', 'Latest diagramming features', 1, 1, '2025-06-20 00:25:23', '2025-06-20 00:25:23'),
(22, 10, 'product_key', 'LTMJB-96JKV-X9X9F-D7R93-T43MF', NULL, NULL, NULL, NULL, 'Microsoft Visio Pro 2021 - Volume License', 0, NULL, NULL, NULL, 'available', 'Latest diagramming features', 1, 1, '2025-06-20 00:25:23', '2025-06-20 00:25:23');

-- --------------------------------------------------------

--
-- Stand-in structure for view `product_stock_view`
-- (See below for the actual view)
--
CREATE TABLE `product_stock_view` (
`product_id` int(11)
,`product_name` varchar(50)
,`version` varchar(50)
,`total_licenses` bigint(21)
,`available_stock` decimal(22,0)
,`used_licenses` decimal(22,0)
,`expired_licenses` decimal(22,0)
,`reserved_licenses` decimal(22,0)
,`stock_status` varchar(12)
,`usage_percentage` decimal(28,2)
);

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `id` int(11) NOT NULL,
  `order_id` varchar(100) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `product_name` varchar(255) NOT NULL,
  `customer_name` varchar(100) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL,
  `quantity` int(11) DEFAULT 1,
  `status` enum('pending','completed','failed','cancelled') NOT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `va_number` varchar(50) DEFAULT NULL,
  `payment_gateway_status` varchar(50) DEFAULT NULL,
  `payment_gateway_payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`payment_gateway_payload`)),
  `license_info` JSON DEFAULT NULL,
  `auth_credentials` JSON DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `transactions`
--

INSERT INTO `transactions` (`id`, `order_id`, `user_id`, `product_id`, `product_name`, `customer_name`, `email`, `amount`, `status`, `payment_method`, `va_number`, `payment_gateway_status`, `payment_gateway_payload`, `created_at`, `updated_at`) VALUES
(9, 'TRX-1752065755441-1', 14, 1, 'Microsoft Office Pro Plus 2016', 'Muhammad Fajar Febrian', 'fajar.febrian020202@gmail.com', 40000.00, 'failed', 'qris', NULL, 'expire', '{\"status_code\":\"407\",\"transaction_id\":\"3411c06f-b855-472c-aab4-4feb59f396a9\",\"gross_amount\":\"40000.00\",\"currency\":\"IDR\",\"order_id\":\"TRX-1752065755441-1\",\"payment_type\":\"qris\",\"signature_key\":\"782b2d1b74a3e8651533fe191a2b045f1f55013d0d16f9a0372a56cdde5ee3d9463a7b3233b2f2d1ab4923a2025612c2edc5ade961629c86639c773c0ac4fdae\",\"transaction_status\":\"expire\",\"fraud_status\":\"accept\",\"status_message\":\"Success, transaction is found\",\"merchant_id\":\"G454677231\",\"acquirer\":\"airpay shopee\",\"reference_id\":\"QR1752065769861Q1EZ5ifXR1\",\"transaction_time\":\"2025-07-09 19:56:09\",\"expiry_time\":\"2025-07-09 20:11:09\"}', '2025-07-09 12:55:55', '2025-07-10 08:58:01'),
(10, 'TRX-1752071492877-4', 6, 4, 'Microsoft Office Pro Plus 365', 'Admin User', 'admin@nixty.com', 50000.00, 'failed', 'qris', NULL, 'expire', '{\"status_code\":\"407\",\"transaction_id\":\"0d0d1818-b1f5-47a5-8fcb-b7d56b4e3aaa\",\"gross_amount\":\"50000.00\",\"currency\":\"IDR\",\"order_id\":\"TRX-1752071492877-4\",\"payment_type\":\"qris\",\"signature_key\":\"ec77b2cc0b0fd7b3f66ef2f4eb6e9d6bd3cb011c38fa9785ddd4d81dcab37a0fc26e9ef1d98dcceacd44ed330520331106280a51099caa9d68a0e288533ea3d4\",\"transaction_status\":\"expire\",\"fraud_status\":\"accept\",\"status_message\":\"Success, transaction is found\",\"merchant_id\":\"G454677231\",\"acquirer\":\"airpay shopee\",\"reference_id\":\"QR1752071499569zE1So4MBcH\",\"transaction_time\":\"2025-07-09 21:31:39\",\"expiry_time\":\"2025-07-09 21:46:39\"}', '2025-07-09 14:31:32', '2025-07-09 16:37:26'),
(11, 'TRX-1752072858392-6', 6, 6, 'Microsoft Project Pro 2019', 'Admin User', 'admin@nixty.com', 35000.00, 'failed', 'qris', NULL, 'expire', '{\"status_code\":\"407\",\"transaction_id\":\"c75a6f51-7cd5-4852-a083-3c5304ba3b8b\",\"gross_amount\":\"35000.00\",\"currency\":\"IDR\",\"order_id\":\"TRX-1752072858392-6\",\"payment_type\":\"qris\",\"signature_key\":\"5e5443f4e8cb01f0c2003e14524ada6e8444831353f73b35d030cc6cbca6ab9e2a98e4d14f8d3800142db722ada85b4224f6c551387a9feefe161212d57860dc\",\"transaction_status\":\"expire\",\"fraud_status\":\"accept\",\"status_message\":\"Success, transaction is found\",\"merchant_id\":\"G454677231\",\"acquirer\":\"airpay shopee\",\"reference_id\":\"QR1752072863346sziVIj8tCe\",\"transaction_time\":\"2025-07-09 21:54:23\",\"expiry_time\":\"2025-07-09 22:09:23\"}', '2025-07-09 14:54:18', '2025-07-09 16:37:26'),
(12, 'TRX-1752075580358-5', 6, 5, 'Microsoft Project Pro 2016', 'Admin User', 'admin@nixty.com', 30000.00, 'pending', NULL, NULL, NULL, NULL, '2025-07-09 15:39:40', '2025-07-09 15:39:40'),
(13, 'TRX-1752076445947-7', 6, 7, 'Microsoft Project Pro 2021', 'Admin User', 'admin@nixty.com', 40000.00, 'pending', NULL, NULL, NULL, NULL, '2025-07-09 15:54:05', '2025-07-09 15:54:05'),
(14, 'TRX-1752076977903-1', NULL, 1, 'Test Product', 'Test Customer', 'test@example.com', 10000.00, 'pending', NULL, NULL, NULL, NULL, '2025-07-09 16:02:57', '2025-07-09 16:02:57'),
(15, 'TRX-1752077125676-7', 6, 7, 'Microsoft Project Pro 2021', 'Admin User', 'admin@nixty.com', 40000.00, 'failed', 'qris', NULL, 'expire', '{\"status_code\":\"407\",\"transaction_id\":\"4a34eef2-af3e-4bcc-8de5-776e84342306\",\"gross_amount\":\"40000.00\",\"currency\":\"IDR\",\"order_id\":\"TRX-1752077125676-7\",\"payment_type\":\"qris\",\"signature_key\":\"a2433945d42feeb0e45455640b811a1189c3868eb67fbc3490ffd0b9996a576e5ed90a84f6ee5585b231a71713a23ab9816f1d0d0a0b28d1e5a1b52be40b8758\",\"transaction_status\":\"expire\",\"fraud_status\":\"accept\",\"status_message\":\"Success, transaction is found\",\"merchant_id\":\"G454677231\",\"acquirer\":\"airpay shopee\",\"reference_id\":\"QR175207713316314AaeseLY4\",\"transaction_time\":\"2025-07-09 23:05:33\",\"expiry_time\":\"2025-07-09 23:20:33\"}', '2025-07-09 16:05:25', '2025-07-09 16:37:25'),
(16, 'TRX-1752077540371-7', 6, 7, 'Microsoft Project Pro 2021', 'Admin User', 'admin@nixty.com', 40000.00, 'failed', 'qris', NULL, 'expire', '{\"status_code\":\"407\",\"transaction_id\":\"d4e2cb1b-560e-46e9-8186-2698e90c5494\",\"gross_amount\":\"40000.00\",\"currency\":\"IDR\",\"order_id\":\"TRX-1752077540371-7\",\"payment_type\":\"qris\",\"signature_key\":\"04a6bfb5c15ca6847ccf1517a04067f410aae61b8db0f97ad9a847250192218f43ba236e811853c2e5c4f16291b96eb4f4c9f379ff1a010528d061d04723966d\",\"transaction_status\":\"expire\",\"fraud_status\":\"accept\",\"status_message\":\"Success, transaction is found\",\"merchant_id\":\"G454677231\",\"acquirer\":\"airpay shopee\",\"reference_id\":\"QR1752077547125cjqRYsGcc2\",\"transaction_time\":\"2025-07-09 23:12:27\",\"expiry_time\":\"2025-07-09 23:27:27\"}', '2025-07-09 16:12:20', '2025-07-09 16:37:25'),
(17, 'TRX-1752077821393-10', 6, 10, 'Microsoft Visio Pro 2021', 'Admin User', 'admin@nixty.com', 40000.00, 'failed', 'qris', NULL, 'expire', '{\"status_code\":\"407\",\"transaction_id\":\"8eac848c-0d26-48ed-bb76-e5aba7abcdb8\",\"gross_amount\":\"40000.00\",\"currency\":\"IDR\",\"order_id\":\"TRX-1752077821393-10\",\"payment_type\":\"qris\",\"signature_key\":\"7c9707b463269cbf56273d92a6947bc2a71ff042739dd90ec6b2bf51fb33e6807790037ab9c395bc7c8b00bfe781756f532d13694e58585be3151c08a94a18ce\",\"transaction_status\":\"expire\",\"fraud_status\":\"accept\",\"status_message\":\"Success, transaction is found\",\"merchant_id\":\"G454677231\",\"acquirer\":\"airpay shopee\",\"reference_id\":\"QR1752077826044qnhG6XyPVB\",\"transaction_time\":\"2025-07-09 23:17:05\",\"expiry_time\":\"2025-07-09 23:32:05\"}', '2025-07-09 16:17:01', '2025-07-09 16:37:25'),
(18, 'TRX-1752077852199-4', 6, 4, 'Microsoft Office Pro Plus 365', 'Admin User', 'admin@nixty.com', 50000.00, 'failed', 'qris', NULL, 'expire', '{\"status_code\":\"407\",\"transaction_id\":\"1b2f44cc-55e1-4184-ba5c-e8473321287f\",\"gross_amount\":\"50000.00\",\"currency\":\"IDR\",\"order_id\":\"TRX-1752077852199-4\",\"payment_type\":\"qris\",\"signature_key\":\"06d8a442300b857510376179dbd827a413ccd6cab674e5491e0db8a1b9a2f6102160afecdcd2eb60f2a4daaf63bd67c96c6a704c5f79c8ab6913e52e7abfdc34\",\"transaction_status\":\"expire\",\"fraud_status\":\"accept\",\"status_message\":\"Success, transaction is found\",\"merchant_id\":\"G454677231\",\"acquirer\":\"airpay shopee\",\"reference_id\":\"QR17520778560427GN6wozag2\",\"transaction_time\":\"2025-07-09 23:17:36\",\"expiry_time\":\"2025-07-09 23:32:35\"}', '2025-07-09 16:17:32', '2025-07-09 16:37:25'),
(19, 'TRX-1752078217820-7', 6, 7, 'Microsoft Project Pro 2021', 'Admin User', 'admin@nixty.com', 40000.00, 'completed', 'qris', NULL, 'settlement', '{\"status_code\":\"200\",\"transaction_id\":\"bbe36e46-27d2-4aa4-a513-1edb69f0dcad\",\"gross_amount\":\"40000.00\",\"currency\":\"IDR\",\"order_id\":\"TRX-1752078217820-7\",\"payment_type\":\"qris\",\"signature_key\":\"9c7ac355eae0bea707f857989649f405c421772fc29097acf089f371b1b4c0d2d405ab47d709d80de4238909581f8e60fd9657bbfa8de6aa41991110dbce3b1b\",\"transaction_status\":\"settlement\",\"fraud_status\":\"accept\",\"status_message\":\"Success, transaction is found\",\"merchant_id\":\"G454677231\",\"transaction_type\":\"off-us\",\"issuer\":\"Gopay\",\"acquirer\":\"airpay shopee\",\"reference_id\":\"QR1752078222785HtpY9QVKJl\",\"shopeepay_reference_number\":\"844286414126053775\",\"transaction_time\":\"2025-07-09 23:23:42\",\"settlement_time\":\"2025-07-09 23:25:10\",\"expiry_time\":\"2025-07-09 23:38:42\"}', '2025-07-09 16:23:37', '2025-07-09 16:37:24'),
(20, 'TRX-1752078321990-7', 6, 7, 'Microsoft Project Pro 2021', 'Admin User', 'admin@nixty.com', 40000.00, 'pending', 'qris', NULL, 'pending', '{\"status_code\":\"201\",\"transaction_id\":\"90797645-b64b-4f44-8f2b-7c6830eb18c7\",\"gross_amount\":\"40000.00\",\"currency\":\"IDR\",\"order_id\":\"TRX-1752078321990-7\",\"payment_type\":\"qris\",\"signature_key\":\"11974cafee203a36c5304b37884627486c2b524ffa408e145d1cec904a35d2b74e1049f641c5542201744cc8ccfaf15cac444e558d67703fce70f93b3fc2b45a\",\"transaction_status\":\"pending\",\"fraud_status\":\"accept\",\"status_message\":\"Success, transaction is found\",\"merchant_id\":\"G454677231\",\"acquirer\":\"airpay shopee\",\"reference_id\":\"QR1752078326635IwV4UUVBtI\",\"transaction_time\":\"2025-07-09 23:25:26\",\"expiry_time\":\"2025-07-09 23:40:26\"}', '2025-07-09 16:25:21', '2025-07-09 16:37:24'),
(21, 'TRX-1752078332523-7', 6, 7, 'Microsoft Project Pro 2021', 'Admin User', 'admin@nixty.com', 40000.00, 'failed', 'qris', NULL, 'cancel', '{\"status_code\":\"200\",\"transaction_id\":\"0ca2db5d-a022-4629-9465-e015d72d6810\",\"gross_amount\":\"40000.00\",\"currency\":\"IDR\",\"order_id\":\"TRX-1752078332523-7\",\"payment_type\":\"qris\",\"signature_key\":\"e751c625cac8f8b5512eeb10bd63331d220aa815a8652e376c430ba8bd05d15a0c3a41c0bee2f3c11afff1048bfd7694f12c06a915ed940328ffc391b158097a\",\"transaction_status\":\"cancel\",\"fraud_status\":\"accept\",\"status_message\":\"Success, transaction is found\",\"merchant_id\":\"G454677231\",\"acquirer\":\"airpay shopee\",\"reference_id\":\"QR1752078339633lwz0ufaZlB\",\"transaction_time\":\"2025-07-09 23:25:39\",\"expiry_time\":\"2025-07-09 23:40:39\"}', '2025-07-09 16:25:32', '2025-07-09 16:37:24'),
(22, 'TRX-1752079027025-4', 6, 4, 'Microsoft Office Pro Plus 365', 'Admin User', 'admin@nixty.com', 50000.00, 'pending', NULL, NULL, NULL, NULL, '2025-07-09 16:37:07', '2025-07-09 16:37:07'),
(23, 'TRX-1752137799997-4', 14, 4, 'Microsoft Office Pro Plus 365', 'Muhammad Fajar Febrian', 'fajar.febrian020202@gmail.com', 50000.00, 'pending', 'qris', NULL, 'pending', '{\"status_code\":\"201\",\"transaction_id\":\"fba19065-80f5-45db-b512-c7c83d830822\",\"gross_amount\":\"50000.00\",\"currency\":\"IDR\",\"order_id\":\"TRX-1752137799997-4\",\"payment_type\":\"qris\",\"signature_key\":\"b6e3761a4ea3efbda836c91d6607e2b99e7d42f24c00a822990ac556c87cda6d1c7e919ba584d8256eb08b2e2558449857bbcdd299fff39cc09c8c2d89e6897a\",\"transaction_status\":\"pending\",\"fraud_status\":\"accept\",\"status_message\":\"Success, transaction is found\",\"merchant_id\":\"G454677231\",\"acquirer\":\"airpay shopee\",\"reference_id\":\"QR1752137804490qBTT01g3jF\",\"transaction_time\":\"2025-07-10 15:56:44\",\"expiry_time\":\"2025-07-10 16:11:44\"}', '2025-07-10 08:56:39', '2025-07-10 08:56:59');

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
  `profile_picture` varchar(100) DEFAULT NULL,
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expires` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `name`, `created_at`, `account_type`, `google_id`, `profile_picture`, `reset_token`, `reset_token_expires`) VALUES
(1, 'test@example.com', '$2b$10$6.2aamESfPTT7S.7GtDk4.UZq5Q7e9duq9mEzKGCFkHdzx9iVXbuW', 'test', '2025-05-24 12:29:02', 'admin', NULL, NULL, NULL, NULL),
(4, 'test2@example.com', '$2b$10$nnW4cKaS.rTbCXf0acAyN.9x59uKCCgtmZ3zYYAZvo0ALUV6WVvJW', 'test2', '2025-05-24 12:36:47', 'user', NULL, NULL, NULL, NULL),
(6, 'admin@nixty.com', '$2b$10$qnGDqDypWcgIJrJr2ytDMucDzOUhgrNn6ys.RUy9/6XpIIDf1koCi', 'Admin User', '2025-05-25 11:17:48', 'admin', NULL, NULL, NULL, NULL),
(7, 'user@nixty.com', '$2b$10$4Ky.qdI2MvgvJCyYLIAJXeRbX5hSMZ9TBgUJMNf0DKOGhOHBVRMSe', 'Regular User', '2025-05-25 11:17:48', 'user', NULL, NULL, NULL, NULL),
(12, 'test4@example.com', '$2b$10$ilnTVstvUqibHevDxs0EjerImglfTlCbKNhC/zyqz8UPjpCIrr1Tq', 'test4', '2025-06-05 09:14:22', 'user', NULL, NULL, NULL, NULL),
(13, 'febyanw@gmail.com', '$2b$10$T3/JmallUa/apqzqgMJWcO9twpC7OeUxw90zeGqlV7HVqOQJ7GXSu', 'Fajar Febrian', '2025-07-09 13:18:51', 'user', '108743859876305643262', 'https://lh3.googleusercontent.com/a/ACg8ocLMCRNvkWXzYVNEqf6sXpHh0PiOnHJ4dVeJbrODoiTM-ktPc00=s96-c', NULL, NULL),
(14, 'fajar.febrian020202@gmail.com', '$2b$10$ElM9H8Vzh1q2YAqOwI9l8O6R0TOf0bzsEk0DaZmnvfByFIlBN6J/C', 'Muhammad Fajar Febrian', '2025-07-10 08:40:43', 'user', '101149504362764463138', 'https://lh3.googleusercontent.com/a/ACg8ocIs8kdgb9R54Mx5f1ezdyqL1nnKitIVGA-pWq5ysTotxLvBXrk=s96-c', NULL, NULL);

-- --------------------------------------------------------

--
-- Structure for view `product_stock_view`
--
DROP TABLE IF EXISTS `product_stock_view`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `product_stock_view`  AS SELECT `p`.`id` AS `product_id`, `p`.`name` AS `product_name`, `p`.`version` AS `version`, count(`pl`.`id`) AS `total_licenses`, sum(case when `pl`.`status` = 'available' then 1 else 0 end) AS `available_stock`, sum(case when `pl`.`status` = 'used' then 1 else 0 end) AS `used_licenses`, sum(case when `pl`.`status` = 'expired' then 1 else 0 end) AS `expired_licenses`, sum(case when `pl`.`status` = 'reserved' then 1 else 0 end) AS `reserved_licenses`, CASE WHEN sum(case when `pl`.`status` = 'available' then 1 else 0 end) = 0 THEN 'out_of_stock' WHEN sum(case when `pl`.`status` = 'available' then 1 else 0 end) <= `p`.`min_stock_threshold` THEN 'low_stock' ELSE 'in_stock' END AS `stock_status`, CASE WHEN count(`pl`.`id`) = 0 THEN 0 ELSE round(sum(case when `pl`.`status` = 'used' then 1 else 0 end) / count(`pl`.`id`) * 100,2) END AS `usage_percentage` FROM (`products` `p` left join `product_licenses` `pl` on(`p`.`id` = `pl`.`product_id`)) GROUP BY `p`.`id`, `p`.`name`, `p`.`version`, `p`.`min_stock_threshold` ;

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
  ADD KEY `idx_deals_expires` (`expires_at`),
  ADD KEY `idx_deals_display` (`status`,`is_featured`,`expires_at`);

--
-- Indexes for table `hero_slides`
--
ALTER TABLE `hero_slides`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `idx_hero_slides_status` (`status`),
  ADD KEY `idx_hero_slides_sort` (`sort_order`),
  ADD KEY `idx_hero_slides_display` (`status`,`sort_order`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_products_slug_version` (`slug`,`version`),
  ADD KEY `idx_products_category` (`category_id`),
  ADD KEY `idx_products_status` (`status`),
  ADD KEY `idx_products_featured` (`is_featured`),
  ADD KEY `idx_products_trending` (`is_trending`),
  ADD KEY `idx_products_version` (`version`),
  ADD KEY `idx_products_name_version` (`name`,`version`),
  ADD KEY `idx_products_license_type` (`license_type_default`),
  ADD KEY `idx_products_display` (`category_id`,`status`,`is_trending`);

--
-- Indexes for table `product_licenses`
--
ALTER TABLE `product_licenses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_product_licenses_product_id` (`product_id`),
  ADD KEY `idx_product_licenses_status` (`status`),
  ADD KEY `idx_product_licenses_license_type` (`license_type`),
  ADD KEY `idx_product_licenses_is_used` (`is_used`),
  ADD KEY `idx_product_licenses_expires_at` (`expires_at`),
  ADD KEY `idx_product_licenses_transaction` (`used_by_transaction_id`),
  ADD KEY `idx_product_licenses_product_status` (`product_id`,`status`),
  ADD KEY `idx_product_licenses_type_status` (`license_type`,`status`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_order_id` (`order_id`),
  ADD KEY `idx_transactions_status` (`status`),
  ADD KEY `idx_transactions_email` (`email`),
  ADD KEY `idx_transactions_payment_method` (`payment_method`),
  ADD KEY `idx_transactions_created_at` (`created_at`),
  ADD KEY `idx_transactions_user_id` (`user_id`),
  ADD KEY `idx_transactions_product_id` (`product_id`);

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
-- AUTO_INCREMENT for table `product_licenses`
--
ALTER TABLE `product_licenses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

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
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `product_licenses`
--
ALTER TABLE `product_licenses`
  ADD CONSTRAINT `product_licenses_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `product_licenses_ibfk_2` FOREIGN KEY (`used_by_transaction_id`) REFERENCES `transactions` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `transactions_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
