/*
 Navicat Premium Dump SQL

 Source Server         : phpmyadmin
 Source Server Type    : MySQL
 Source Server Version : 100432 (10.4.32-MariaDB)
 Source Host           : localhost:3306
 Source Schema         : db_rekapsurat

 Target Server Type    : MySQL
 Target Server Version : 100432 (10.4.32-MariaDB)
 File Encoding         : 65001

 Date: 29/10/2024 15:33:49
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for surat
-- ----------------------------
DROP TABLE IF EXISTS `surat`;
CREATE TABLE `surat`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `nomor_surat` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `perihal` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `tanggal` date NOT NULL,
  `jenis` enum('Surat Masuk','Surat Keluar') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `surat_created_by_fk`(`created_by` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 18 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of surat
-- ----------------------------
INSERT INTO `surat` VALUES (13, ' 010/PSP//VIII/2024', 'Permintaan Siswa Prakerin SMK GARUDA MAHADHIKA', '2024-10-07', 'Surat Keluar', '2024-10-26 08:38:07', '2024-10-26 08:38:07', 1);
INSERT INTO `surat` VALUES (14, '011/PPK//IV/2024', 'Permohonan Pembukaan Rekening', '2024-04-17', 'Surat Keluar', '2024-10-26 08:38:07', '2024-10-26 08:38:07', 1);
INSERT INTO `surat` VALUES (16, '015/SP//IX/2024', 'Permohonan Data Merchant', '2024-08-30', 'Surat Keluar', '2024-10-28 11:38:44', '2024-10-28 11:38:44', 1);
INSERT INTO `surat` VALUES (17, '016/SP//IX/2024', 'Permohonan Rekomendasi dan Dukungan  Kepala Dinas Koperasi dan Usaha Mikro, Kecil, dan Menengah Kota Banjarbaru', '2024-08-30', 'Surat Keluar', '2024-10-28 11:39:36', '2024-10-28 11:39:36', 1);

-- ----------------------------
-- Table structure for surat_backup
-- ----------------------------
DROP TABLE IF EXISTS `surat_backup`;
CREATE TABLE `surat_backup`  (
  `id` int NOT NULL DEFAULT 0,
  `nomor_surat` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `perihal` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `tanggal` date NOT NULL,
  `jenis` enum('Surat Masuk','Surat Keluar') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int NULL DEFAULT NULL
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of surat_backup
-- ----------------------------
INSERT INTO `surat_backup` VALUES (7, ' 010/PSP//VIII/2024', 'Permintaan Siswa Prakerin SMK GARUDA MAHADHIKA', '2024-10-07', 'Surat Keluar', '2024-10-25 10:05:15', '2024-10-26 08:21:20', NULL);
INSERT INTO `surat_backup` VALUES (8, '011/PPK//IV/2024', 'Permohonan Pembukaan Rekening', '2024-04-17', 'Surat Keluar', '2024-10-25 10:06:16', '2024-10-26 08:21:20', NULL);
INSERT INTO `surat_backup` VALUES (9, '015/SP//IX/2024', 'Permohonan Data Merchant', '2024-08-30', 'Surat Keluar', '2024-10-25 10:07:11', '2024-10-26 08:21:20', NULL);

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `role` enum('admin','user') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'user',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `username`(`username` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES (1, 'admin', '$2y$10$Z0frEfDVuvs3VHwrmQpkjuY0/fmUH77qfboVp3zDiOqrbbMnTTwqK', 'admin', '2024-10-26 08:38:07', '2024-10-28 11:33:11');
INSERT INTO `users` VALUES (2, 'adeetz', '$2y$10$vwmaThLTeuSjoAdiY/aoKeDmY1dgWpiN5ZaEJmbMz6N6uaisIMMii', 'admin', '2024-10-26 14:50:26', '2024-10-26 15:55:39');

SET FOREIGN_KEY_CHECKS = 1;
