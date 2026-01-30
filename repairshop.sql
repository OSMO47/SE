-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Nov 14, 2024 at 06:46 AM
-- Server version: 8.0.30
-- PHP Version: 8.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `repairshop`
--

-- --------------------------------------------------------

--
-- Table structure for table `customer`
--

CREATE TABLE `customer` (
  `id` int NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `phone_number` varchar(20) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `customer`
--

INSERT INTO `customer` (`id`, `first_name`, `last_name`, `phone_number`, `created_at`) VALUES
(1, 'วิชัย', 'รักดี', '081-234-5678', '2024-11-08 05:42:50'),
(2, 'สมศรี', 'ใจดี', '089-876-5432', '2024-11-08 05:42:50'),
(3, 'ประเสริฐ', 'มีสุข', '062-345-6789', '2024-11-08 05:42:50'),
(4, 'นภา', 'สมบูรณ์', '095-167-2834', '2024-11-08 05:42:50'),
(5, 'สมชาย', 'รักษ์ไทย', '084-987-6543', '2024-11-08 05:42:50'),
(9, 'Pim', 'ไชยนวล', '0612681457', '2024-11-08 17:35:55'),
(12, 'awdaw', 'awda', '0060625165', '2024-11-11 12:05:53'),
(13, 'Pim', 'ppimmzx', '089-123-4567', '2024-11-11 15:48:25');

-- --------------------------------------------------------

--
-- Table structure for table `device_types`
--

CREATE TABLE `device_types` (
  `id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `device_types`
--

INSERT INTO `device_types` (`id`, `name`, `created_at`) VALUES
(1, 'สมาร์ทโฟน', '2024-11-08 05:42:50'),
(2, 'แท็บเล็ต', '2024-11-08 05:42:50'),
(3, 'โน้ตบุ๊ก', '2024-11-08 05:42:50');

-- --------------------------------------------------------

--
-- Table structure for table `mechanic`
--

CREATE TABLE `mechanic` (
  `id` int NOT NULL,
  `user_name` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `mechanic`
--

INSERT INTO `mechanic` (`id`, `user_name`, `password`, `first_name`, `last_name`, `email`, `created_at`) VALUES
(1, 'john_tech', '$2b$10$zqB2RlJHBCI5UHyJCHbzWezfHxiUWjD3aMFAk8cukEnDm8rUGDp3S', 'John', 'Smith', 'john@repair.com', '2024-11-08 05:42:50'),
(2, 'sarah_tech', '$2b$10$zqB2RlJHBCI5UHyJCHbzWezfHxiUWjD3aMFAk8cukEnDm8rUGDp3S', 'Sarah', 'Johnson', 'sarah@repair.com', '2024-11-08 05:42:50'),
(3, 'mike_tech', '$2b$10$zqB2RlJHBCI5UHyJCHbzWezfHxiUWjD3aMFAk8cukEnDm8rUGDp3S', 'Mike', 'Brown', 'mike@repair.com', '2024-11-08 05:42:50'),
(4, 'OSMO47', '$2b$10$m68Xh.c.82WPBFZJISmlNeWIsOc7qc1cPkeNKrrxAdhl3NS5oxmEW', 'A', 'B', 'veerapat.p66@rsu.ac.th', '2024-11-08 05:43:40');

-- --------------------------------------------------------

--
-- Table structure for table `parts`
--

CREATE TABLE `parts` (
  `id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL,
  `stock_quantity` int NOT NULL DEFAULT '0',
  `min_quantity` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `parts`
--

INSERT INTO `parts` (`id`, `name`, `description`, `price`, `stock_quantity`, `min_quantity`, `created_at`) VALUES
(1, 'จอ มือถือ', 'จอ LCD พร้อมทัชสกรีน ', '3500.00', 197, 2, '2024-11-08 05:42:50'),
(2, 'แบตเตอรี่ มือถือ', 'แบตเตอรี่สำหรับ มือถือ', '1200.00', 4, 3, '2024-11-08 05:42:50'),
(3, 'เมนบอร์ด MacBook ', 'เมนบอร์ดสำหรับ MacBook ', '15000.00', 92, 1, '2024-11-08 05:42:50'),
(5, 'จอ LCD แท็ปเล็ต', 'จอ LCD สำหรับ แท็ปเล็ต', '4500.00', 20106, 2, '2024-11-08 05:42:50'),
(11, 'ฟไกฟไกฟไ', 'ฟแผหแฟไ', '100.00', 17, 1, '2024-11-11 11:10:27');

-- --------------------------------------------------------

--
-- Table structure for table `parts_device_types`
--

CREATE TABLE `parts_device_types` (
  `id` int NOT NULL,
  `part_id` int NOT NULL,
  `device_type_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `parts_device_types`
--

INSERT INTO `parts_device_types` (`id`, `part_id`, `device_type_id`, `created_at`) VALUES
(1, 1, 1, '2024-11-08 05:42:50'),
(2, 2, 1, '2024-11-08 05:42:50'),
(3, 3, 3, '2024-11-08 05:42:50'),
(9, 5, 3, '2024-11-10 15:30:40'),
(10, 11, 1, '2024-11-11 11:10:27'),
(11, 11, 2, '2024-11-11 11:10:27'),
(12, 11, 3, '2024-11-11 11:10:27');

-- --------------------------------------------------------

--
-- Table structure for table `parts_history`
--

CREATE TABLE `parts_history` (
  `id` int NOT NULL,
  `part_id` int NOT NULL,
  `repair_id` int DEFAULT NULL,
  `transaction_type` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quantity` int NOT NULL,
  `mechanic_id` int NOT NULL,
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `parts_history`
--

INSERT INTO `parts_history` (`id`, `part_id`, `repair_id`, `transaction_type`, `quantity`, `mechanic_id`, `notes`, `created_at`) VALUES
(52, 1, 34, 'OUT', 1, 4, 'Used in repair', '2024-11-12 08:09:33'),
(53, 2, 34, 'OUT', 1, 4, 'Used in repair', '2024-11-12 08:09:33'),
(54, 3, 34, 'OUT', 1, 4, 'Used in repair', '2024-11-12 08:09:33'),
(55, 5, 34, 'OUT', 1, 4, 'Used in repair', '2024-11-12 08:09:33'),
(56, 11, 34, 'OUT', 1, 4, 'Used in repair', '2024-11-12 08:09:33'),
(57, 1, 34, 'OUT', 1, 4, 'Used in repair', '2024-11-12 08:09:38'),
(58, 2, 34, 'OUT', 1, 4, 'Used in repair', '2024-11-12 08:09:38'),
(59, 3, 34, 'OUT', 1, 4, 'Used in repair', '2024-11-12 08:09:38'),
(60, 5, 34, 'OUT', 1, 4, 'Used in repair', '2024-11-12 08:09:38'),
(61, 11, 34, 'OUT', 1, 4, 'Used in repair', '2024-11-12 08:09:38');

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` int NOT NULL,
  `repair_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method_id` int NOT NULL,
  `payment_status` enum('pending','completed','failed') NOT NULL,
  `reference_no` varchar(100) DEFAULT NULL,
  `mechanic_id` int NOT NULL,
  `payment_date` timestamp NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`id`, `repair_id`, `amount`, `payment_method_id`, `payment_status`, `reference_no`, `mechanic_id`, `payment_date`, `created_at`) VALUES
(10, 34, '34300.00', 2, 'completed', '', 4, '2024-11-12 08:09:38', '2024-11-12 08:09:38');

-- --------------------------------------------------------

--
-- Table structure for table `payment_methods`
--

CREATE TABLE `payment_methods` (
  `id` int NOT NULL,
  `method_name` varchar(50) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `payment_methods`
--

INSERT INTO `payment_methods` (`id`, `method_name`, `created_at`) VALUES
(1, 'เงินสด', '2024-11-08 05:39:50'),
(2, 'โอนเงิน', '2024-11-08 05:39:50'),
(3, 'บัตรเครดิต', '2024-11-08 05:39:50');

-- --------------------------------------------------------

--
-- Table structure for table `repair_info`
--

CREATE TABLE `repair_info` (
  `id` int NOT NULL,
  `repair_code` varchar(50) NOT NULL,
  `customer_id` int NOT NULL,
  `device_type_id` int NOT NULL,
  `device_description` text,
  `device_code` varchar(100) DEFAULT NULL,
  `status_id` int NOT NULL DEFAULT '1',
  `mechanic_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `repair_info`
--

INSERT INTO `repair_info` (`id`, `repair_code`, `customer_id`, `device_type_id`, `device_description`, `device_code`, `status_id`, `mechanic_id`, `created_at`, `updated_at`) VALUES
(33, 'R1731340309848-5084', 9, 1, 'iphone น้องพิมเสีย', NULL, 1, NULL, '2024-11-11 15:51:49', '2024-11-11 15:51:49'),
(34, 'R1731340390291-407', 9, 2, 'แท็บเล็ตน้องพิมปริ้นไม่ออก', NULL, 5, 4, '2024-11-11 15:53:10', '2024-11-12 08:09:38');

-- --------------------------------------------------------

--
-- Table structure for table `repair_items`
--

CREATE TABLE `repair_items` (
  `id` int NOT NULL,
  `repair_id` int NOT NULL,
  `repair_type_id` int NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `repair_items`
--

INSERT INTO `repair_items` (`id`, `repair_id`, `repair_type_id`, `price`, `created_at`) VALUES
(102, 33, 1, '3500.00', '2024-11-11 15:51:49'),
(103, 33, 2, '1500.00', '2024-11-11 15:51:49'),
(104, 33, 3, '500.00', '2024-11-11 15:51:49'),
(105, 33, 4, '4500.00', '2024-11-11 15:51:49'),
(106, 34, 1, '3500.00', '2024-11-11 15:53:10'),
(107, 34, 2, '1500.00', '2024-11-11 15:53:10'),
(108, 34, 3, '500.00', '2024-11-11 15:53:10'),
(109, 34, 4, '4500.00', '2024-11-11 15:53:10');

-- --------------------------------------------------------

--
-- Table structure for table `repair_parts`
--

CREATE TABLE `repair_parts` (
  `id` int NOT NULL,
  `repair_id` int NOT NULL,
  `part_id` int NOT NULL,
  `quantity` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `repair_parts`
--

INSERT INTO `repair_parts` (`id`, `repair_id`, `part_id`, `quantity`, `created_at`) VALUES
(82, 33, 1, 1, '2024-11-11 15:51:49'),
(83, 33, 2, 1, '2024-11-11 15:51:49'),
(84, 33, 3, 1, '2024-11-11 15:51:49'),
(85, 33, 5, 1, '2024-11-11 15:51:49'),
(86, 33, 11, 1, '2024-11-11 15:51:49'),
(87, 34, 1, 1, '2024-11-11 15:53:10'),
(88, 34, 2, 1, '2024-11-11 15:53:10'),
(89, 34, 3, 1, '2024-11-11 15:53:10'),
(90, 34, 5, 1, '2024-11-11 15:53:10'),
(91, 34, 11, 1, '2024-11-11 15:53:10');

-- --------------------------------------------------------

--
-- Table structure for table `repair_status`
--

CREATE TABLE `repair_status` (
  `id` int NOT NULL,
  `status_name` varchar(50) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `repair_status`
--

INSERT INTO `repair_status` (`id`, `status_name`, `created_at`) VALUES
(1, 'รอรับงาน', '2024-11-08 05:39:50'),
(2, 'กำลังซ่อม', '2024-11-08 05:39:50'),
(3, 'รออะไหล่', '2024-11-08 05:39:50'),
(4, 'ซ่อมเสร็จ', '2024-11-08 05:39:50'),
(5, 'ปิดงาน', '2024-11-08 05:39:50');

-- --------------------------------------------------------

--
-- Table structure for table `repair_types`
--

CREATE TABLE `repair_types` (
  `id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `estimated_price` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `repair_types`
--

INSERT INTO `repair_types` (`id`, `name`, `estimated_price`, `created_at`) VALUES
(1, 'เปลี่ยนจอ', '3500.00', '2024-11-08 05:42:50'),
(2, 'เปลี่ยนแบตเตอรี่', '1500.00', '2024-11-08 05:42:50'),
(3, 'ล้างเครื่อง', '500.00', '2024-11-08 05:42:50'),
(4, 'เปลี่ยนบอร์ด', '4500.00', '2024-11-08 05:42:50');

-- --------------------------------------------------------

--
-- Table structure for table `status_history`
--

CREATE TABLE `status_history` (
  `id` int NOT NULL,
  `repair_id` int NOT NULL,
  `status_id` int NOT NULL,
  `mechanic_id` int DEFAULT NULL,
  `note` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `status_history`
--

INSERT INTO `status_history` (`id`, `repair_id`, `status_id`, `mechanic_id`, `note`, `created_at`) VALUES
(97, 33, 1, NULL, 'รับงานซ่อมใหม่', '2024-11-11 15:51:49'),
(98, 34, 1, NULL, 'รับงานซ่อมใหม่', '2024-11-11 15:53:10'),
(99, 34, 2, 4, 'รับงานเรียบร้อย', '2024-11-11 15:55:20'),
(100, 34, 4, 4, '9849841', '2024-11-12 08:09:33'),
(101, 34, 5, 4, 'ชำระเงินและส่งมอบเรียบร้อย', '2024-11-12 08:09:38');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `customer`
--
ALTER TABLE `customer`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_customer` (`phone_number`,`first_name`,`last_name`);

--
-- Indexes for table `device_types`
--
ALTER TABLE `device_types`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `mechanic`
--
ALTER TABLE `mechanic`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_name` (`user_name`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `parts`
--
ALTER TABLE `parts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `parts_device_types`
--
ALTER TABLE `parts_device_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_part_device` (`part_id`,`device_type_id`),
  ADD KEY `device_type_id` (`device_type_id`);

--
-- Indexes for table `parts_history`
--
ALTER TABLE `parts_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `part_id` (`part_id`),
  ADD KEY `repair_id` (`repair_id`),
  ADD KEY `mechanic_id` (`mechanic_id`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `repair_id` (`repair_id`),
  ADD KEY `payment_method_id` (`payment_method_id`),
  ADD KEY `mechanic_id` (`mechanic_id`);

--
-- Indexes for table `payment_methods`
--
ALTER TABLE `payment_methods`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `repair_info`
--
ALTER TABLE `repair_info`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `repair_code` (`repair_code`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `device_type_id` (`device_type_id`),
  ADD KEY `status_id` (`status_id`),
  ADD KEY `device_code` (`device_code`),
  ADD KEY `mechanic_id` (`mechanic_id`);

--
-- Indexes for table `repair_items`
--
ALTER TABLE `repair_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `repair_id` (`repair_id`),
  ADD KEY `repair_type_id` (`repair_type_id`);

--
-- Indexes for table `repair_parts`
--
ALTER TABLE `repair_parts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `repair_id` (`repair_id`),
  ADD KEY `part_id` (`part_id`);

--
-- Indexes for table `repair_status`
--
ALTER TABLE `repair_status`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `repair_types`
--
ALTER TABLE `repair_types`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `status_history`
--
ALTER TABLE `status_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `repair_id` (`repair_id`),
  ADD KEY `status_id` (`status_id`),
  ADD KEY `mechanic_id` (`mechanic_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `customer`
--
ALTER TABLE `customer`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `device_types`
--
ALTER TABLE `device_types`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `mechanic`
--
ALTER TABLE `mechanic`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `parts`
--
ALTER TABLE `parts`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `parts_device_types`
--
ALTER TABLE `parts_device_types`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `parts_history`
--
ALTER TABLE `parts_history`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=62;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `payment_methods`
--
ALTER TABLE `payment_methods`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `repair_info`
--
ALTER TABLE `repair_info`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT for table `repair_items`
--
ALTER TABLE `repair_items`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=110;

--
-- AUTO_INCREMENT for table `repair_parts`
--
ALTER TABLE `repair_parts`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=92;

--
-- AUTO_INCREMENT for table `repair_status`
--
ALTER TABLE `repair_status`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `repair_types`
--
ALTER TABLE `repair_types`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `status_history`
--
ALTER TABLE `status_history`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=102;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `parts_device_types`
--
ALTER TABLE `parts_device_types`
  ADD CONSTRAINT `parts_device_types_ibfk_1` FOREIGN KEY (`part_id`) REFERENCES `parts` (`id`),
  ADD CONSTRAINT `parts_device_types_ibfk_2` FOREIGN KEY (`device_type_id`) REFERENCES `device_types` (`id`);

--
-- Constraints for table `parts_history`
--
ALTER TABLE `parts_history`
  ADD CONSTRAINT `parts_history_ibfk_1` FOREIGN KEY (`part_id`) REFERENCES `parts` (`id`),
  ADD CONSTRAINT `parts_history_ibfk_2` FOREIGN KEY (`repair_id`) REFERENCES `repair_info` (`id`),
  ADD CONSTRAINT `parts_history_ibfk_3` FOREIGN KEY (`mechanic_id`) REFERENCES `mechanic` (`id`);

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`repair_id`) REFERENCES `repair_info` (`id`),
  ADD CONSTRAINT `payments_ibfk_2` FOREIGN KEY (`payment_method_id`) REFERENCES `payment_methods` (`id`),
  ADD CONSTRAINT `payments_ibfk_3` FOREIGN KEY (`mechanic_id`) REFERENCES `mechanic` (`id`);

--
-- Constraints for table `repair_info`
--
ALTER TABLE `repair_info`
  ADD CONSTRAINT `repair_info_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`id`),
  ADD CONSTRAINT `repair_info_ibfk_2` FOREIGN KEY (`device_type_id`) REFERENCES `device_types` (`id`),
  ADD CONSTRAINT `repair_info_ibfk_3` FOREIGN KEY (`status_id`) REFERENCES `repair_status` (`id`),
  ADD CONSTRAINT `repair_info_ibfk_4` FOREIGN KEY (`mechanic_id`) REFERENCES `mechanic` (`id`);

--
-- Constraints for table `repair_items`
--
ALTER TABLE `repair_items`
  ADD CONSTRAINT `repair_items_ibfk_1` FOREIGN KEY (`repair_id`) REFERENCES `repair_info` (`id`),
  ADD CONSTRAINT `repair_items_ibfk_2` FOREIGN KEY (`repair_type_id`) REFERENCES `repair_types` (`id`);

--
-- Constraints for table `repair_parts`
--
ALTER TABLE `repair_parts`
  ADD CONSTRAINT `repair_parts_ibfk_1` FOREIGN KEY (`repair_id`) REFERENCES `repair_info` (`id`),
  ADD CONSTRAINT `repair_parts_ibfk_2` FOREIGN KEY (`part_id`) REFERENCES `parts` (`id`);

--
-- Constraints for table `status_history`
--
ALTER TABLE `status_history`
  ADD CONSTRAINT `status_history_ibfk_1` FOREIGN KEY (`repair_id`) REFERENCES `repair_info` (`id`),
  ADD CONSTRAINT `status_history_ibfk_2` FOREIGN KEY (`status_id`) REFERENCES `repair_status` (`id`),
  ADD CONSTRAINT `status_history_ibfk_3` FOREIGN KEY (`mechanic_id`) REFERENCES `mechanic` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
