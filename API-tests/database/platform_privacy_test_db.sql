-- Adminer 4.8.1 MySQL 8.0.41 dump

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

SET NAMES utf8mb4;

DROP TABLE IF EXISTS `action_history`;
CREATE TABLE `action_history` (
  `actionID` mediumint unsigned NOT NULL AUTO_INCREMENT,
  `recordID` mediumint unsigned NOT NULL,
  `userID` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `stepID` smallint NOT NULL DEFAULT '0',
  `dependencyID` smallint NOT NULL,
  `actionType` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `actionTypeID` tinyint unsigned NOT NULL,
  `time` int unsigned NOT NULL,
  `comment` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `userMetadata` json DEFAULT NULL,
  PRIMARY KEY (`actionID`),
  KEY `time` (`time`),
  KEY `recordID` (`recordID`),
  KEY `actionTypeID` (`actionTypeID`),
  KEY `dependencyID` (`dependencyID`),
  KEY `actionType` (`actionType`),
  CONSTRAINT `action_history_ibfk_2` FOREIGN KEY (`actionTypeID`) REFERENCES `action_types` (`actionTypeID`),
  CONSTRAINT `fk_records_action_history_deletion` FOREIGN KEY (`recordID`) REFERENCES `records` (`recordID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `action_history` (`actionID`, `recordID`, `userID`, `stepID`, `dependencyID`, `actionType`, `actionTypeID`, `time`, `comment`, `userMetadata`) VALUES
(1,	18,	'tester',	0,	0,	'deleted',	4,	1744042956,	'',	'{\"email\": \"tester.tester@va.gov\", \"lastName\": \"Tester\", \"userName\": \"tester\", \"firstName\": \"Tester\", \"middleName\": \"\"}'),
(2,	34,	'tester',	0,	5,	'submit',	6,	1747431022,	'',	'{\"email\": \"tester.tester@va.gov\", \"lastName\": \"Tester\", \"userName\": \"tester\", \"firstName\": \"Tester\", \"middleName\": \"\"}'),
(3,	34,	'tester',	1,	9,	'CloseElementExists',	8,	1747431350,	'',	'{\"email\": \"tester.tester@va.gov\", \"lastName\": \"Tester\", \"userName\": \"tester\", \"firstName\": \"Tester\", \"middleName\": \"\"}'),
(4,	34,	'tester',	0,	0,	'move',	8,	1747431363,	'Moved to LEAF Team Review step',	'{\"email\": \"tester.tester@va.gov\", \"lastName\": \"Tester\", \"userName\": \"tester\", \"firstName\": \"Tester\", \"middleName\": \"\"}'),
(5,	34,	'tester',	1,	9,	'ProceedtoFinalReview',	8,	1747431368,	'',	'{\"email\": \"tester.tester@va.gov\", \"lastName\": \"Tester\", \"userName\": \"tester\", \"firstName\": \"Tester\", \"middleName\": \"\"}'),
(6,	34,	'tester',	3,	9,	'submit',	8,	1747431372,	'',	'{\"email\": \"tester.tester@va.gov\", \"lastName\": \"Tester\", \"userName\": \"tester\", \"firstName\": \"Tester\", \"middleName\": \"\"}'),
(7,	34,	'tester',	0,	0,	'move',	8,	1747431501,	'Moved to LEAF Team Review step',	'{\"email\": \"tester.tester@va.gov\", \"lastName\": \"Tester\", \"userName\": \"tester\", \"firstName\": \"Tester\", \"middleName\": \"\"}'),
(8,	34,	'tester',	0,	0,	'deleted',	4,	1747431514,	'',	'{\"email\": \"tester.tester@va.gov\", \"lastName\": \"Tester\", \"userName\": \"tester\", \"firstName\": \"Tester\", \"middleName\": \"\"}'),
(9,	32,	'tester',	0,	0,	'deleted',	4,	1747839745,	'',	'{\"email\": \"tester.tester@va.gov\", \"lastName\": \"Tester\", \"userName\": \"tester\", \"firstName\": \"Tester\", \"middleName\": \"\"}'),
(10,	30,	'tester',	0,	0,	'deleted',	4,	1747839750,	'',	'{\"email\": \"tester.tester@va.gov\", \"lastName\": \"Tester\", \"userName\": \"tester\", \"firstName\": \"Tester\", \"middleName\": \"\"}'),
(11,	29,	'tester',	0,	0,	'deleted',	4,	1747839770,	'',	'{\"email\": \"tester.tester@va.gov\", \"lastName\": \"Tester\", \"userName\": \"tester\", \"firstName\": \"Tester\", \"middleName\": \"\"}'),
(12,	3,	'tester',	0,	0,	'deleted',	4,	1769536669,	'',	'{\"email\": \"tester.tester@va.gov\", \"lastName\": \"Tester\", \"userName\": \"tester\", \"firstName\": \"Tester\", \"middleName\": \"\"}'),
(13,	41,	'tester',	0,	5,	'submit',	6,	1770302398,	'',	'{\"email\": \"tester.tester@va.gov\", \"lastName\": \"Tester\", \"userName\": \"tester\", \"firstName\": \"Tester\", \"middleName\": \"\"}'),
(14,	41,	'tester',	-3,	-1,	'approve',	8,	1770302400,	'',	'{\"email\": \"tester.tester@va.gov\", \"lastName\": \"Tester\", \"userName\": \"tester\", \"firstName\": \"Tester\", \"middleName\": \"\"}'),
(15,	41,	'tester',	-2,	-1,	'approve',	8,	1770302409,	'',	'{\"email\": \"tester.tester@va.gov\", \"lastName\": \"Tester\", \"userName\": \"tester\", \"firstName\": \"Tester\", \"middleName\": \"\"}'),
(16,	10,	'tester',	0,	0,	'deleted',	4,	1770386115,	'Not checked in 2025 PIA',	'{\"email\": \"tester.tester@va.gov\", \"lastName\": \"Tester\", \"userName\": \"tester\", \"firstName\": \"Tester\", \"middleName\": \"\"}'),
(17,	9,	'tester',	0,	0,	'deleted',	4,	1770386128,	'Not checked in 2025 PIA',	'{\"email\": \"tester.tester@va.gov\", \"lastName\": \"Tester\", \"userName\": \"tester\", \"firstName\": \"Tester\", \"middleName\": \"\"}'),
(18,	15,	'tester',	0,	0,	'deleted',	4,	1770386149,	'Not checked in 2025 PIA',	'{\"email\": \"tester.tester@va.gov\", \"lastName\": \"Tester\", \"userName\": \"tester\", \"firstName\": \"Tester\", \"middleName\": \"\"}'),
(19,	17,	'tester',	0,	0,	'deleted',	4,	1770386208,	'Not checked in 2025 PIA',	'{\"email\": \"tester.tester@va.gov\", \"lastName\": \"Tester\", \"userName\": \"tester\", \"firstName\": \"Tester\", \"middleName\": \"\"}'),
(20,	19,	'tester',	0,	0,	'deleted',	4,	1770386212,	'Not checked in 2025 PIA',	'{\"email\": \"tester.tester@va.gov\", \"lastName\": \"Tester\", \"userName\": \"tester\", \"firstName\": \"Tester\", \"middleName\": \"\"}'),
(21,	5,	'tester',	0,	0,	'deleted',	4,	1770386253,	'Not checked in 2025 PIA',	'{\"email\": \"tester.tester@va.gov\", \"lastName\": \"Tester\", \"userName\": \"tester\", \"firstName\": \"Tester\", \"middleName\": \"\"}'),
(22,	20,	'tester',	0,	0,	'deleted',	4,	1770386278,	'Not checked in 2025 PIA',	'{\"email\": \"tester.tester@va.gov\", \"lastName\": \"Tester\", \"userName\": \"tester\", \"firstName\": \"Tester\", \"middleName\": \"\"}'),
(23,	41,	'tester',	0,	0,	'deleted',	4,	1770729518,	'null',	'{\"email\": \"tester.tester@va.gov\", \"lastName\": \"Tester\", \"userName\": \"tester\", \"firstName\": \"Tester\", \"middleName\": \"\"}');



DROP TABLE IF EXISTS `action_types`;
CREATE TABLE `action_types` (
  `actionTypeID` tinyint unsigned NOT NULL AUTO_INCREMENT,
  `actionTypeDesc` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`actionTypeID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `action_types` (`actionTypeID`, `actionTypeDesc`) VALUES
(1,	'approved'),
(2,	'disapproved'),
(3,	'deferred'),
(4,	'deleted'),
(5,	'undeleted'),
(6,	'filled dependency'),
(7,	'unfilled dependency'),
(8,	'Generic');

DROP TABLE IF EXISTS `actions`;
CREATE TABLE `actions` (
  `actionType` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `actionText` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `actionTextPasttense` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `actionIcon` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `actionAlignment` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `sort` tinyint NOT NULL,
  `fillDependency` tinyint NOT NULL,
  `deleted` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`actionType`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `actions` (`actionType`, `actionText`, `actionTextPasttense`, `actionIcon`, `actionAlignment`, `sort`, `fillDependency`, `deleted`) VALUES
('approve',	'Approve',	'Approved',	'gnome-emblem-default.svg',	'right',	0,	1,	0),
('changeInitiator',	'Change Initiator',	'Changed Initiator',	'',	'',	0,	0,	0),
('CloseElementExists',	'Close - Element Exists',	'Closed - Element Exists',	'process-stop.svg',	'right',	0,	1,	1),
('CloseRequest',	'Close Request',	'Request Closed',	'',	'right',	0,	1,	0),
('concur',	'Concur',	'Concurred',	'go-next.svg',	'right',	1,	1,	0),
('defer',	'Defer',	'Deferred',	'software-update-urgent.svg',	'left',	0,	-2,	0),
('deleted',	'Cancel',	'Cancelled',	'',	'',	0,	0,	0),
('disapprove',	'Disapprove',	'Disapproved',	'process-stop.svg',	'left',	0,	-1,	0),
('move',	'Change Step',	'Changed Step',	'',	'',	0,	0,	0),
('ProceedtoFinalReview',	'Proceed to Final Review',	'Proceeded to Final Review',	'go-next.svg',	'right',	0,	1,	0),
('sendback',	'Return to Requestor',	'Returned to Requestor',	'edit-undo.svg',	'left',	0,	0,	0),
('SendtoPrivacyOfficer',	'Send to Privacy Officer',	'Sent to Privacy Officer',	'document-print-preview.svg',	'right',	0,	1,	0),
('sign',	'Sign',	'Signed',	'application-certificate.svg',	'right',	0,	1,	0),
('submit',	'Submit',	'Submitted',	'gnome-emblem-default.svg',	'right',	0,	1,	0);

DROP TABLE IF EXISTS `approvals`;
CREATE TABLE `approvals` (
  `approvalID` mediumint unsigned NOT NULL AUTO_INCREMENT,
  `recordID` mediumint unsigned NOT NULL,
  `userID` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `groupID` mediumint NOT NULL DEFAULT '0',
  `approvalType` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `time` int unsigned NOT NULL,
  `comment` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  PRIMARY KEY (`approvalID`),
  KEY `time` (`time`),
  KEY `recordID` (`recordID`),
  KEY `groupID` (`groupID`),
  KEY `record_group` (`recordID`,`groupID`),
  KEY `record_time` (`recordID`,`time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `categoryID` varchar(20) NOT NULL,
  `parentID` varchar(50) NOT NULL,
  `categoryName` varchar(50) NOT NULL,
  `categoryDescription` varchar(255) NOT NULL,
  `workflowID` smallint NOT NULL,
  `sort` tinyint NOT NULL DEFAULT '0',
  `needToKnow` tinyint NOT NULL DEFAULT '0',
  `formLibraryID` smallint DEFAULT NULL,
  `visible` tinyint NOT NULL DEFAULT '-1',
  `disabled` tinyint NOT NULL DEFAULT '0',
  `type` varchar(50) NOT NULL DEFAULT '',
  `destructionAge` mediumint unsigned DEFAULT NULL,
  `lastModified` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`categoryID`),
  KEY `parentID` (`parentID`),
  KEY `destructionAge` (`destructionAge`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

INSERT INTO `categories` (`categoryID`, `parentID`, `categoryName`, `categoryDescription`, `workflowID`, `sort`, `needToKnow`, `formLibraryID`, `visible`, `disabled`, `type`, `destructionAge`, `lastModified`) VALUES
('form_3ae23',	'',	'LEAF-S Privacy Element Request',	'Public form for users to submit privacy element requests',	2,	0,	0,	0,	0,	0,	'',	NULL,	1747770008),
('form_533f5',	'',	'Data Element',	'Data Elements included in LEAF&#039;s Privacy Impact Assessment (PIA)',	0,	0,	0,	NULL,	0,	0,	'',	NULL,	1741214061),
('form_6c6bc',	'form_3ae23',	'1. Initial Review',	'',	0,	0,	0,	NULL,	-1,	0,	'',	NULL,	1742927892),
('form_9a096',	'',	'Review (Dates)',	'',	0,	-1,	0,	NULL,	0,	0,	'',	NULL,	1770387049),
('form_b9953',	'form_3ae23',	'2. Privacy Officer Review',	'',	0,	0,	0,	NULL,	-1,	0,	'',	NULL,	1747430334),
('form_c5ba3',	'form_3ae23',	'3. Final Review',	'',	0,	0,	0,	NULL,	-1,	0,	'',	NULL,	1747430435),
('form_f5204',	'',	'System of Records Notice',	'SORNs included in LEAF&#039;s Privacy Impact Assessment (PIA)',	0,	0,	0,	NULL,	0,	0,	'',	NULL,	1770386628),
('leaf_devconsole',	'',	'LEAF Developer Console',	'',	-2,	0,	0,	NULL,	1,	0,	'',	NULL,	0),
('leaf_secure',	'',	'Leaf Secure Certification',	'',	-1,	0,	0,	NULL,	1,	0,	'',	NULL,	0);

DROP TABLE IF EXISTS `category_count`;
CREATE TABLE `category_count` (
  `recordID` mediumint unsigned NOT NULL,
  `categoryID` varchar(20) NOT NULL,
  `count` tinyint unsigned NOT NULL,
  PRIMARY KEY (`recordID`,`categoryID`),
  KEY `categoryID` (`categoryID`),
  CONSTRAINT `category_count_ibfk_1` FOREIGN KEY (`categoryID`) REFERENCES `categories` (`categoryID`),
  CONSTRAINT `fk_records_category_count_deletion` FOREIGN KEY (`recordID`) REFERENCES `records` (`recordID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

INSERT INTO `category_count` (`recordID`, `categoryID`, `count`) VALUES
(1,	'form_533f5',	1),
(2,	'form_533f5',	1),
(2,	'form_9a096',	1),
(3,	'form_3ae23',	1),
(4,	'form_533f5',	1),
(4,	'form_9a096',	1),
(5,	'form_533f5',	1),
(6,	'form_533f5',	1),
(6,	'form_9a096',	1),
(7,	'form_533f5',	1),
(7,	'form_9a096',	1),
(8,	'form_533f5',	1),
(8,	'form_9a096',	1),
(9,	'form_533f5',	1),
(10,	'form_533f5',	1),
(11,	'form_533f5',	1),
(11,	'form_9a096',	1),
(12,	'form_533f5',	1),
(12,	'form_9a096',	1),
(13,	'form_533f5',	1),
(13,	'form_9a096',	1),
(14,	'form_533f5',	1),
(14,	'form_9a096',	1),
(15,	'form_533f5',	1),
(16,	'form_533f5',	1),
(16,	'form_9a096',	1),
(17,	'form_533f5',	1),
(18,	'form_533f5',	1),
(19,	'form_533f5',	1),
(20,	'form_533f5',	1),
(21,	'form_533f5',	1),
(21,	'form_9a096',	1),
(22,	'form_533f5',	1),
(22,	'form_9a096',	1),
(23,	'form_533f5',	1),
(23,	'form_9a096',	1),
(24,	'form_533f5',	1),
(24,	'form_9a096',	1),
(25,	'form_533f5',	1),
(25,	'form_9a096',	1),
(26,	'form_533f5',	1),
(26,	'form_9a096',	1),
(27,	'form_533f5',	1),
(27,	'form_9a096',	1),
(28,	'form_9a096',	1),
(28,	'form_f5204',	1),
(29,	'form_f5204',	1),
(30,	'form_f5204',	1),
(31,	'form_9a096',	1),
(31,	'form_f5204',	1),
(32,	'form_f5204',	1),
(33,	'form_9a096',	1),
(33,	'form_f5204',	1),
(34,	'form_3ae23',	1),
(35,	'form_3ae23',	1),
(36,	'form_9a096',	1),
(36,	'form_f5204',	1),
(37,	'form_9a096',	1),
(37,	'form_f5204',	1),
(38,	'form_9a096',	1),
(38,	'form_f5204',	1),
(39,	'form_9a096',	1),
(39,	'form_f5204',	1),
(40,	'form_9a096',	1),
(40,	'form_f5204',	1),
(41,	'leaf_secure',	1),
(42,	'form_533f5',	1),
(42,	'form_9a096',	1),
(43,	'form_533f5',	1),
(43,	'form_9a096',	1),
(44,	'form_533f5',	1),
(44,	'form_9a096',	1),
(45,	'form_533f5',	1),
(45,	'form_9a096',	1),
(46,	'form_533f5',	1),
(46,	'form_9a096',	1),
(47,	'form_533f5',	1),
(47,	'form_9a096',	1),
(48,	'form_533f5',	1),
(48,	'form_9a096',	1);


DROP TABLE IF EXISTS `category_privs`;
CREATE TABLE `category_privs` (
  `categoryID` varchar(20) NOT NULL,
  `groupID` mediumint NOT NULL,
  `readable` tinyint NOT NULL,
  `writable` tinyint NOT NULL,
  UNIQUE KEY `categoryID` (`categoryID`,`groupID`),
  KEY `groupID` (`groupID`),
  CONSTRAINT `category_privs_ibfk_2` FOREIGN KEY (`categoryID`) REFERENCES `categories` (`categoryID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;


DROP TABLE IF EXISTS `category_staples`;
CREATE TABLE `category_staples` (
  `categoryID` varchar(20) NOT NULL,
  `stapledCategoryID` varchar(20) NOT NULL,
  UNIQUE KEY `category_stapled` (`categoryID`,`stapledCategoryID`),
  KEY `categoryID` (`categoryID`),
  CONSTRAINT `category_staples_ibfk_1` FOREIGN KEY (`categoryID`) REFERENCES `categories` (`categoryID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

INSERT INTO `category_staples` (`categoryID`, `stapledCategoryID`) VALUES
('form_533f5',	'form_9a096'),
('form_f5204',	'form_9a096');

DROP TABLE IF EXISTS `data`;
CREATE TABLE `data` (
  `recordID` mediumint unsigned NOT NULL,
  `indicatorID` smallint NOT NULL,
  `series` tinyint unsigned NOT NULL DEFAULT '1',
  `data` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `metadata` json DEFAULT NULL,
  `timestamp` int unsigned NOT NULL DEFAULT '0',
  `userID` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  UNIQUE KEY `unique` (`recordID`,`indicatorID`,`series`),
  KEY `indicator_series` (`indicatorID`,`series`),
  KEY `fastdata` (`indicatorID`,`data`(10)),
  FULLTEXT KEY `data` (`data`),
  CONSTRAINT `fk_records_data_deletion` FOREIGN KEY (`recordID`) REFERENCES `records` (`recordID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `data` (`recordID`, `indicatorID`, `series`, `data`, `metadata`, `timestamp`, `userID`) VALUES
(1,	1,	1,	'Other',	NULL,	1744042895,	'tester'),
(2,	1,	1,	'Full Name',	NULL,	1744042949,	'tester'),
(2,	26,	1,	'02/06/2026',	NULL,	1770391502,	'tester'),
(2,	27,	1,	'05/06/2026',	NULL,	1770391502,	'tester'),
(4,	1,	1,	'Date of Birth',	NULL,	1744042825,	'tester'),
(4,	26,	1,	'02/06/2026',	NULL,	1770390117,	'tester'),
(4,	27,	1,	'05/06/2026',	NULL,	1770390117,	'tester'),
(5,	1,	1,	'Account numbers',	NULL,	1744042825,	'tester'),
(6,	1,	1,	'Certificate/License Numbers (e.g., Occupational, Educational, Medical)',	NULL,	1770386081,	'tester'),
(6,	26,	1,	'02/06/2026',	NULL,	1770390158,	'tester'),
(6,	27,	1,	'05/06/2026',	NULL,	1770390158,	'tester'),
(7,	1,	1,	'Emergency Contact Information (Name, Phone Number, etc. of a different individual)',	NULL,	1770386017,	'tester'),
(7,	26,	1,	'02/06/2026',	NULL,	1770390174,	'tester'),
(7,	27,	1,	'05/06/2026',	NULL,	1770390174,	'tester'),
(8,	1,	1,	'Gender',	NULL,	1744042825,	'tester'),
(8,	26,	1,	'02/06/2026',	NULL,	1770390190,	'tester'),
(8,	27,	1,	'05/06/2026',	NULL,	1770390190,	'tester'),
(9,	1,	1,	'Integrated Control Number (ICN)',	NULL,	1744042826,	'tester'),
(10,	1,	1,	'Internet Protocol (IP) Address Numbers',	NULL,	1744042826,	'tester'),
(11,	1,	1,	'Medical Record Number',	NULL,	1744042826,	'tester'),
(11,	26,	1,	'02/06/2026',	NULL,	1770390203,	'tester'),
(11,	27,	1,	'05/06/2026',	NULL,	1770390203,	'tester'),
(12,	1,	1,	'Financial Information',	NULL,	1744042826,	'tester'),
(12,	26,	1,	'02/06/2026',	NULL,	1770390215,	'tester'),
(12,	27,	1,	'05/06/2026',	NULL,	1770390215,	'tester'),
(13,	1,	1,	'Medical Records',	NULL,	1744042826,	'tester'),
(13,	26,	1,	'02/06/2026',	NULL,	1770390229,	'tester'),
(13,	27,	1,	'05/06/2026',	NULL,	1770390229,	'tester'),
(14,	1,	1,	'Military History/Service Connection',	NULL,	1744042826,	'tester'),
(14,	26,	1,	'02/06/2026',	NULL,	1770390242,	'tester'),
(14,	27,	1,	'05/06/2026',	NULL,	1770390242,	'tester'),
(15,	1,	1,	'Medications',	NULL,	1744042826,	'tester'),
(16,	1,	1,	'Mother’s Maiden Name',	NULL,	1744042826,	'tester'),
(16,	26,	1,	'02/06/2026',	NULL,	1770390254,	'tester'),
(16,	27,	1,	'05/06/2026',	NULL,	1770390254,	'tester'),
(17,	1,	1,	'Next of Kin',	NULL,	1744042826,	'tester'),
(18,	1,	1,	'Name',	NULL,	1744042826,	'tester'),
(19,	1,	1,	'Occupational License Number',	NULL,	1744042827,	'tester'),
(20,	1,	1,	'OIG Investigation Findings',	NULL,	1744042827,	'tester'),
(21,	1,	1,	'Personal Email Address',	NULL,	1744042827,	'tester'),
(21,	26,	1,	'02/06/2026',	NULL,	1770390265,	'tester'),
(21,	27,	1,	'05/06/2026',	NULL,	1770390265,	'tester'),
(22,	1,	1,	'Personal Fax Number',	NULL,	1744042827,	'tester'),
(22,	26,	1,	'02/06/2026',	NULL,	1770390277,	'tester'),
(22,	27,	1,	'05/06/2026',	NULL,	1770390277,	'tester'),
(23,	1,	1,	'Personal Phone Number',	NULL,	1744042827,	'tester'),
(23,	26,	1,	'02/06/2026',	NULL,	1770390288,	'tester'),
(23,	27,	1,	'05/06/2026',	NULL,	1770390288,	'tester'),
(24,	1,	1,	'Personal Mailing Address',	NULL,	1744042827,	'tester'),
(24,	26,	1,	'02/06/2026',	NULL,	1770390303,	'tester'),
(24,	27,	1,	'05/06/2026',	NULL,	1770390303,	'tester'),
(25,	1,	1,	'Race/Ethnicity',	NULL,	1744042827,	'tester'),
(25,	26,	1,	'02/06/2026',	NULL,	1770390313,	'tester'),
(25,	27,	1,	'05/06/2026',	NULL,	1770390313,	'tester'),
(26,	1,	1,	'Tax Identification Number',	NULL,	1744042827,	'tester'),
(26,	26,	1,	'02/06/2026',	NULL,	1770390324,	'tester'),
(26,	27,	1,	'05/06/2026',	NULL,	1770390324,	'tester'),
(27,	1,	1,	'Vehicle License Plate Number',	NULL,	1744042827,	'tester'),
(27,	26,	1,	'02/06/2026',	NULL,	1770390336,	'tester'),
(27,	27,	1,	'05/06/2026',	NULL,	1770390336,	'tester'),
(28,	4,	1,	'01VA022 - Accreditation Records-VA',	NULL,	1770386560,	'tester'),
(28,	24,	1,	'https://department.va.gov/privacy/wp-content/uploads/sites/5/2023/05/SORN01VA22.pdf',	NULL,	1770386664,	'tester'),
(28,	26,	1,	'02/06/2026',	NULL,	1770390349,	'tester'),
(28,	27,	1,	'05/06/2026',	NULL,	1770390349,	'tester'),
(29,	4,	1,	'150VA19 - Administrative Data Repository-VA',	NULL,	1744043124,	'tester'),
(30,	4,	1,	'Employee Medical File System of Records (Title 38)-VA',	NULL,	1744043125,	'tester'),
(31,	4,	1,	'OPM/GOVT-1: General Personnel Records',	NULL,	1744043125,	'tester'),
(31,	24,	1,	'https://www.govinfo.gov/content/pkg/FR-2015-11-30/pdf/2015-30309.pdf',	NULL,	1770386739,	'tester'),
(31,	26,	1,	'02/06/2026',	NULL,	1770390362,	'tester'),
(31,	27,	1,	'05/06/2026',	NULL,	1770390362,	'tester'),
(32,	4,	1,	'General Personnel Records (Title 38)-VA',	NULL,	1744043125,	'tester'),
(33,	4,	1,	'103VA07B – Police and Security Records-VA',	NULL,	1770386769,	'tester'),
(33,	24,	1,	'https://www.govinfo.gov/content/pkg/FR-2022-10-21/pdf/2022-22899.pdf',	NULL,	1770386780,	'tester'),
(33,	26,	1,	'02/06/2026',	NULL,	1770390373,	'tester'),
(33,	27,	1,	'05/06/2026',	NULL,	1770390373,	'tester'),
(34,	6,	1,	'I confirm I have reviewed the existing privacy elements and the element I am requesting is not available.',	NULL,	1747431018,	'tester'),
(34,	8,	1,	'SSN',	NULL,	1747431018,	'tester'),
(34,	9,	1,	'VHA 123.3.2',	NULL,	1747431018,	'tester'),
(34,	11,	1,	'Does not exist',	NULL,	1747431367,	'tester'),
(34,	13,	1,	'Yes',	NULL,	1747431367,	'tester'),
(34,	21,	1,	'',	NULL,	1747431372,	'tester'),
(34,	22,	1,	'05/08/2025',	NULL,	1747431372,	'tester'),
(35,	6,	1,	'I confirm I have reviewed the existing privacy elements and the element I am requesting is not available.',	NULL,	1747768379,	'tester'),
(35,	8,	1,	'Mother&#039;s maiden name Mother&#039;s maiden nameMother&#039;s maiden nameMother&#039;s maiden nameMother&#039;s maiden nameMother&#039;s maiden nameMother&#039;s maiden nameMother&#039;s maiden nameMother&#039;s maiden nameMother&#039;s maiden nameMother&#039;s maiden nameMother&#039;s maiden nameMother&#039;s maiden nameMother&#039;s maiden nameMother&#039;s maiden nameMother&#039;s maiden nameMother&#039;s maiden nameMother&#039;s maiden name',	NULL,	1747768379,	'tester'),
(35,	9,	1,	'',	NULL,	1747768379,	'tester'),
(36,	4,	1,	'150VA10 - Enterprise Identity and Demographics Records-VA',	NULL,	1770386678,	'tester'),
(36,	24,	1,	'https://www.govinfo.gov/content/pkg/FR-2023-11-02/pdf/2023-24193.pdf',	NULL,	1770386696,	'tester'),
(36,	26,	1,	'02/06/2026',	NULL,	1770390385,	'tester'),
(36,	27,	1,	'05/06/2026',	NULL,	1770390385,	'tester'),
(37,	4,	1,	'08VA05 - Employee Medical File System of Records (Title 38)-VA',	NULL,	1770386705,	'tester'),
(37,	24,	1,	'https://dvagov.sharepoint.com/sites/vacovetsprivacy/PrivacyDocuments/Privacy_Act_Issuances_VA_005_Employee.pdf',	NULL,	1770386716,	'tester'),
(37,	26,	1,	'02/06/2026',	NULL,	1770390404,	'tester'),
(37,	27,	1,	'05/06/2026',	NULL,	1770390404,	'tester'),
(38,	4,	1,	'76VA05 - General Personnel Records (Title 38)-VA',	NULL,	1770386750,	'tester'),
(38,	24,	1,	'https://www.govinfo.gov/content/pkg/FR-2000-07-20/pdf/00-18287.pdf',	NULL,	1770386759,	'tester'),
(38,	26,	1,	'02/06/2026',	NULL,	1770390414,	'tester'),
(38,	27,	1,	'05/06/2026',	NULL,	1770390414,	'tester'),
(39,	4,	1,	'Enrollment and Eligibility Records -VA (147VA10/86FR46090)',	NULL,	1770386789,	'tester'),
(39,	24,	1,	'https://www.govinfo.gov/content/pkg/FR-2021-08-17/pdf/2021-17528.pdf',	NULL,	1770386799,	'tester'),
(39,	26,	1,	'02/06/2026',	NULL,	1770390424,	'tester'),
(39,	27,	1,	'05/06/2026',	NULL,	1770390424,	'tester'),
(40,	4,	1,	'DFAS (DCPS) T7335/79 FR 14241',	NULL,	1770386806,	'tester'),
(40,	24,	1,	'https://pclt.defense.gov/DIRECTORATES/Privacy-and-Civil-Liberties-Directorate/',	NULL,	1770386817,	'tester'),
(40,	26,	1,	'02/06/2026',	NULL,	1770390437,	'tester'),
(40,	27,	1,	'05/06/2026',	NULL,	1770390437,	'tester'),
(41,	-4,	1,	'539772',	'{\"email\": \"tester.tester@va.gov\", \"lastName\": \"Tester\", \"userName\": \"tester\", \"firstName\": \"Tester\", \"middleName\": \"\"}',	1770302351,	'tester'),
(41,	-2,	1,	'No PHI/PII will be collected on this site. This is being completed to remove the banner.',	NULL,	1770302392,	'tester'),
(41,	-1,	1,	'539772',	'{\"email\": \"tester.tester@va.gov\", \"lastName\": \"Tester\", \"userName\": \"tester\", \"firstName\": \"Tester\", \"middleName\": \"\"}',	1770302351,	'tester'),
(42,	1,	1,	'Full Social Security Number',	NULL,	1770385947,	'tester'),
(42,	26,	1,	'02/06/2026',	NULL,	1770390447,	'tester'),
(42,	27,	1,	'05/06/2026',	NULL,	1770390447,	'tester'),
(43,	1,	1,	'Partial Social Security Number',	NULL,	1770385962,	'tester'),
(43,	26,	1,	'02/06/2026',	NULL,	1770390455,	'tester'),
(43,	27,	1,	'05/06/2026',	NULL,	1770390455,	'tester'),
(44,	1,	1,	'Health Insurance Beneficiary Numbers',	NULL,	1770386415,	'tester'),
(44,	26,	1,	'02/06/2026',	NULL,	1770390467,	'tester'),
(44,	27,	1,	'05/06/2026',	NULL,	1770390467,	'tester'),
(45,	1,	1,	'Date of Death',	NULL,	1770386225,	'tester'),
(45,	26,	1,	'02/06/2026',	NULL,	1770390476,	'tester'),
(45,	27,	1,	'05/06/2026',	NULL,	1770390476,	'tester'),
(46,	1,	1,	'National Provider Identifier',	NULL,	1770386299,	'tester'),
(46,	26,	1,	'02/06/2026',	NULL,	1770390486,	'tester'),
(46,	27,	1,	'05/06/2026',	NULL,	1770390486,	'tester'),
(47,	1,	1,	'Driver&#039;s License Number',	NULL,	1770386308,	'tester'),
(47,	26,	1,	'02/06/2026',	NULL,	1770390496,	'tester'),
(47,	27,	1,	'05/06/2026',	NULL,	1770390496,	'tester'),
(48,	1,	1,	'Academic Institution and Academic Program Level',	NULL,	1770386323,	'tester'),
(48,	26,	1,	'02/06/2026',	NULL,	1770390508,	'tester'),
(48,	27,	1,	'05/06/2026',	NULL,	1770390508,	'tester');


DROP TABLE IF EXISTS `data_action_log`;
CREATE TABLE `data_action_log` (
  `empUID` varchar(36) DEFAULT NULL,
  `id` int NOT NULL AUTO_INCREMENT,
  `action` varchar(45) DEFAULT NULL,
  `userID` int DEFAULT NULL,
  `timestamp` datetime DEFAULT NULL,
  `userDisplay` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `data_cache`;
CREATE TABLE `data_cache` (
  `cacheKey` varchar(32) NOT NULL,
  `data` text NOT NULL,
  `timestamp` int NOT NULL,
  UNIQUE KEY `cacheKey` (`cacheKey`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `data_extended`;
CREATE TABLE `data_extended` (
  `recordID` mediumint unsigned NOT NULL,
  `indicatorID` smallint NOT NULL,
  `data` text NOT NULL,
  `timestamp` int unsigned NOT NULL,
  `userID` varchar(50) NOT NULL,
  KEY `recordID_indicatorID` (`recordID`,`indicatorID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `data_history`;
CREATE TABLE `data_history` (
  `recordID` mediumint unsigned NOT NULL,
  `indicatorID` smallint NOT NULL,
  `series` tinyint unsigned NOT NULL DEFAULT '1',
  `data` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `metadata` json DEFAULT NULL,
  `timestamp` int unsigned NOT NULL DEFAULT '0',
  `userID` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `userDisplay` varchar(90) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  KEY `recordID` (`recordID`,`indicatorID`,`series`),
  KEY `timestamp` (`timestamp`),
  CONSTRAINT `fk_records_data_history_deletion` FOREIGN KEY (`recordID`) REFERENCES `records` (`recordID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `data_log_items`;
CREATE TABLE `data_log_items` (
  `data_action_log_fk` int NOT NULL,
  `tableName` varchar(75) NOT NULL,
  `column` varchar(75) NOT NULL,
  `value` text NOT NULL,
  `displayValue` varchar(256) DEFAULT NULL,
  PRIMARY KEY (`data_action_log_fk`,`tableName`,`column`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `dependencies`;
CREATE TABLE `dependencies` (
  `dependencyID` smallint NOT NULL AUTO_INCREMENT,
  `description` varchar(50) NOT NULL,
  PRIMARY KEY (`dependencyID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

INSERT INTO `dependencies` (`dependencyID`, `description`) VALUES
(-4,	'LEAF Agent'),
(-3,	'Group Designated by the Requestor'),
(-2,	'Requestor Followup'),
(-1,	'Person Designated by the Requestor'),
(1,	'Service Chief'),
(5,	'Request Submitted'),
(8,	'Quadrad'),
(9,	'[TEST Requirement]');

DROP TABLE IF EXISTS `dependency_privs`;
CREATE TABLE `dependency_privs` (
  `dependencyID` smallint NOT NULL,
  `groupID` mediumint NOT NULL,
  UNIQUE KEY `dependencyID` (`dependencyID`,`groupID`),
  KEY `groupID` (`groupID`),
  CONSTRAINT `fk_privs_dependencyID` FOREIGN KEY (`dependencyID`) REFERENCES `dependencies` (`dependencyID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `destruction_log`;
CREATE TABLE `destruction_log` (
  `recordID` mediumint unsigned NOT NULL,
  `categoryID` varchar(20) NOT NULL,
  `destructionTime` int unsigned DEFAULT '0',
  PRIMARY KEY (`recordID`),
  KEY `destructionTime` (`destructionTime`),
  KEY `destructionForm` (`categoryID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `email_reminders`;
CREATE TABLE `email_reminders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `workflowID` smallint NOT NULL,
  `stepID` smallint NOT NULL,
  `actionType` varchar(50) NOT NULL,
  `frequency` smallint NOT NULL,
  `recipientGroupID` mediumint NOT NULL,
  `emailTemplate` text NOT NULL,
  `startDateIndicatorID` smallint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `routeID` (`workflowID`,`stepID`,`actionType`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `email_templates`;
CREATE TABLE `email_templates` (
  `emailTemplateID` mediumint NOT NULL AUTO_INCREMENT,
  `label` varchar(255) NOT NULL,
  `emailTo` text,
  `emailCc` text,
  `subject` text NOT NULL,
  `body` text NOT NULL,
  PRIMARY KEY (`emailTemplateID`),
  UNIQUE KEY `label` (`label`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;


DROP TABLE IF EXISTS `email_tracker`;
CREATE TABLE `email_tracker` (
  `id` int NOT NULL AUTO_INCREMENT,
  `recordID` mediumint unsigned NOT NULL,
  `userID` varchar(50) DEFAULT NULL,
  `timestamp` int NOT NULL,
  `recipients` text NOT NULL,
  `subject` text NOT NULL,
  PRIMARY KEY (`id`),
  KEY `recordID` (`recordID`),
  CONSTRAINT `fk_records_email_tracker_deletion` FOREIGN KEY (`recordID`) REFERENCES `records` (`recordID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;


DROP TABLE IF EXISTS `events`;
CREATE TABLE `events` (
  `eventID` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `eventDescription` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `eventType` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `eventData` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`eventID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `events` (`eventID`, `eventDescription`, `eventType`, `eventData`) VALUES
('LeafSecure_Certified',	'Marks site as LEAF Secure',	'',	''),
('LeafSecure_DeveloperConsole',	'Grants developer console access',	'',	''),
('std_email_notify_completed',	'Notify the requestor',	'Email',	''),
('std_email_notify_next_approver',	'Notify the next approver',	'Email',	'');

DROP TABLE IF EXISTS `groups`;
CREATE TABLE `groups` (
  `groupID` mediumint NOT NULL AUTO_INCREMENT,
  `parentGroupID` mediumint DEFAULT NULL,
  `name` varchar(250) NOT NULL,
  `groupDescription` varchar(50) NOT NULL DEFAULT '',
  PRIMARY KEY (`groupID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;


DROP TABLE IF EXISTS `indicator_mask`;
CREATE TABLE `indicator_mask` (
  `indicatorID` smallint NOT NULL,
  `groupID` mediumint NOT NULL,
  UNIQUE KEY `indicatorID_2` (`indicatorID`,`groupID`),
  KEY `indicatorID` (`indicatorID`),
  KEY `groupID` (`groupID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `indicators`;
CREATE TABLE `indicators` (
  `indicatorID` smallint NOT NULL AUTO_INCREMENT,
  `name` text NOT NULL,
  `format` text NOT NULL,
  `description` varchar(50) DEFAULT NULL,
  `default` text,
  `parentID` smallint DEFAULT NULL,
  `categoryID` varchar(20) DEFAULT NULL,
  `html` text,
  `htmlPrint` text,
  `conditions` text,
  `jsSort` varchar(255) DEFAULT NULL,
  `required` tinyint NOT NULL DEFAULT '0',
  `sort` tinyint NOT NULL DEFAULT '1',
  `timeAdded` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `disabled` int unsigned NOT NULL DEFAULT '0',
  `is_sensitive` tinyint NOT NULL DEFAULT '0',
  `trackChanges` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`indicatorID`),
  KEY `categoryID` (`categoryID`),
  KEY `parentID` (`parentID`),
  KEY `sort` (`sort`),
  CONSTRAINT `indicators_ibfk_1` FOREIGN KEY (`categoryID`) REFERENCES `categories` (`categoryID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

INSERT INTO `indicators` (`indicatorID`, `name`, `format`, `description`, `default`, `parentID`, `categoryID`, `html`, `htmlPrint`, `conditions`, `jsSort`, `required`, `sort`, `timeAdded`, `disabled`, `is_sensitive`, `trackChanges`) VALUES
(-8,	'Approval Officials',	'',	NULL,	NULL,	NULL,	'leaf_devconsole',	NULL,	NULL,	NULL,	NULL,	0,	2,	'2019-12-13 17:09:58',	0,	0,	1),
(-7,	'Area Manager / Facility Chief Information Officer',	'orgchart_employee',	NULL,	NULL,	-8,	'leaf_devconsole',	NULL,	NULL,	NULL,	NULL,	1,	2,	'2019-12-13 17:08:23',	1,	0,	1),
(-6,	'Supervisor',	'orgchart_employee',	NULL,	NULL,	-8,	'leaf_devconsole',	NULL,	NULL,	NULL,	NULL,	1,	1,	'2019-12-13 17:08:23',	0,	0,	1),
(-5,	'LEAF Developer Console Overview',	'raw_data',	'',	NULL,	NULL,	'leaf_devconsole',	'<script>\r\n$(function() {\r\n\r\n\r\nif($(\'#{{ iID }}\').val() == \'Accepted terms and rules of behavior\') {\r\n    $(\'#rob_acceptance\').prop(\'checked\', true);\r\n}\r\nelse {\r\n    $(\'#{{ iID }}\').val($(\'#rob_acceptance\').val());\r\n}\r\n\r\n});\r\nformRequired[\"id-5\"] = {\r\n    setRequired: function() {\r\n        return ($(\'#rob_acceptance\').prop(\'checked\') == false);\r\n    }\r\n};\r\n</script>\r\n<p><b>This is a request to access the LEAF Developer Console.</b></p>\r\n<p>Approved individuals will gain the ability to modify LEAF\'s user interface using HTML, CSS, and JavaScript technologies.</p>\r\n<p>Please review the following:\r\n<ul>\r\n    <li>I validate that I have the technical ability to work with HTML, CSS, and JavaScript source code.</li>\r\n    <li>I recognize that source code customizations and their maintenance are the responsibility of the office seeking to make customizations. In the event that the responsible office becomes unable to support maintenance, customizations may be easily removed to restore standard functionality.</li>\r\n</ul>\r\n</p>\r\n\r\n<div id=\"rob\" style=\"border: 1px solid black; padding: 4px; background-color: white; height: 26em; overflow-y: auto\">\r\n    <h3>Department of Veterans Affairs (VA) National Rules of Behavior</h3>\r\n    <p>I understand, accept, and agree to the following terms and conditions that apply to my access to, and use of, information, including VA sensitive information, or information systems of the U.S. Department of Veterans Affairs.</p>\r\n    <ol type=\"1\">\r\n        <li>GENERAL RULES OF BEHAVIOR\r\n            <ol type=\"a\">\r\n                <li>I understand that when I use any Government information system, I have NO expectation of Privacy in VA records that I create or in my activities while accessing or using such information system.</li>\r\n                <li>I understand that authorized VA personnel may review my conduct or actions concerning VA information and information systems, and take appropriate action.  Authorized VA personnel include my supervisory chain of command as well as VA system administrators and Information Security Officers (ISOs).  Appropriate action may include monitoring, recording, copying, inspecting, restricting access, blocking, tracking, and disclosing information to authorized Office of Inspector General (OIG), VA, and law enforcement personnel.</li>\r\n                <li>I understand that the following actions are prohibited: unauthorized access, unauthorized uploading, unauthorized downloading, unauthorized changing, unauthorized circumventing, or unauthorized deleting information on VA systems, modifying VA systems, unauthorized denying or granting access to VA systems, using VA resources for unauthorized use on VA systems, or otherwise misusing VA systems or resources.  I also understand that attempting to engage in any of these unauthorized actions is also prohibited.</li>\r\n                <li>I understand that such unauthorized attempts or acts may result in disciplinary or other adverse action, as well as criminal, civil, and/or administrative penalties.  Depending on the severity of the violation, disciplinary or adverse action consequences may include: suspension of access privileges, reprimand, suspension from work, demotion, or removal.  Theft, conversion, or unauthorized disposal or destruction of Federal property or information may also result in criminal sanctions.</li>\r\n                <li>I understand that I have a responsibility to report suspected or identified information security incidents (security and privacy) to my Operating Unit’s Information Security Officer (ISO), Privacy Officer (PO), and my supervisor as appropriate.</li>\r\n                <li>I understand that I have a duty to report information about actual or possible criminal violations involving VA programs, operations, facilities, contracts or information systems to my supervisor, any management official or directly to the OIG, including reporting to the OIG Hotline.  I also understand that I have a duty to immediately report to the OIG any possible criminal matters involving felonies, including crimes involving information systems.</li>\r\n                <li>I understand that the VA National Rules of Behavior do not and should not be relied upon to create any other right or benefit, substantive or procedural, enforceable by law, by a party to litigation with the United States Government.</li>\r\n                <li>I understand that the VA National Rules of Behavior do not supersede any local policies that provide higher levels of protection to VA’s information or information systems.  The VA National Rules of Behavior provide the minimal rules with which individual users must comply.</li>\r\n                <li><b>I understand that if I refuse to sign this VA National Rules of Behavior as required by VA policy, I will be denied access to VA information and information systems.  Any refusal to sign the VA National Rules of Behavior may have an adverse impact on my employment with the Department.</b></li>\r\n            </ol>\r\n        </li>\r\n        <li>SPECIFIC RULES OF BEHAVIOR.\r\n            <ol type=\"a\">\r\n                <li>I will follow established procedures for requesting access to any VA computer system and for notification to the VA supervisor and the ISO when the access is no longer needed.</li>\r\n                <li>I will follow established VA information security and privacy policies and procedures.</li>\r\n                <li>I will use only devices, systems, software, and data which I am authorized to use, including complying with any software licensing or copyright restrictions.  This includes downloads of software offered as free trials, shareware or public domain.</li>\r\n                <li>I will only use my access for authorized and official duties, and to only access data that is needed in the fulfillment of my duties except as provided for in VA Directive 6001, Limited Personal Use of Government Office Equipment Including Information Technology.  I also agree that I will not engage in any activities prohibited as stated in section 2c of VA Directive 6001.</li>\r\n                <li>I will secure VA sensitive information in all areas (at work and remotely) and in any form (e.g. digital, paper etc.), to include mobile media and devices that contain sensitive information, and I will follow the mandate that all VA sensitive information must be in a protected environment at all times or it must be encrypted (using FIPS 140-2 approved encryption).  If clarification is needed whether or not an environment is adequately protected, I will follow the guidance of the local Chief Information Officer (CIO).</li>\r\n                <li>I will properly dispose of VA sensitive information, either in hardcopy, softcopy or electronic format, in accordance with VA policy and procedures.</li>\r\n                <li>I will not attempt to override, circumvent or disable operational, technical, or management security controls unless expressly directed to do so in writing by authorized VA staff.</li>\r\n                <li>I will not attempt to alter the security configuration of government equipment unless authorized.  This includes operational, technical, or management security controls.</li>\r\n                <li>I will protect my verify codes and passwords from unauthorized use and disclosure and ensure I utilize only passwords that meet the VA minimum requirements for the systems that I am authorized to use and are contained in Appendix F of VA Handbook 6500.</li>\r\n                <li>I will not store any passwords/verify codes in any type of script file or cache on VAsystems.</li>\r\n                <li>I will ensure that I log off or lock any computer or console before walking away and will not allow another user to access that computer or console while I am logged on to it.</li>\r\n                <li>I will not misrepresent, obscure, suppress, or replace a user’s identity on the Internet or any VA electronic communication system.</li>\r\n                <li>I will not auto-forward e-mail messages to addresses outside the VA network.</li>\r\n                <li>I will comply with any directions from my supervisors, VA system administrators and information security officers concerning my access to, and use of, VA information and information systems or matters covered by these Rules.</li>\r\n                <li>I will ensure that any devices that I use to transmit, access, and store VA sensitive information outside of a VA protected environment will use FIPS 140-2 approved encryption (the translation of data into a form that is unintelligible without a deciphering mechanism).  This includes laptops, thumb drives, and other removable storage devices and storage media (CDs, DVDs, etc.).</li>\r\n                <li>I will obtain the approval of appropriate management officials before releasing VA information for public dissemination.</li>\r\n                <li>I will not host, set up, administer, or operate any type of Internet server on any VA network or attempt to connect any personal equipment to a VA network unless explicitly authorized in writing by my local CIO and I will ensure that all such activity is in compliance with Federal and VA policies.</li>\r\n                <li>I will not attempt to probe computer systems to exploit system controls or access VA sensitive data for any reason other than in the performance of official duties.  Authorized penetration testing must be approved in writing by the VA CIO.</li>\r\n                <li>I will protect Government property from theft, loss, destruction, or misuse.  I will follow VA policies and procedures for handling Federal Government IT equipment and will sign for items provided to me for my exclusive use and return them when no longer required for VA activities.</li>\r\n                <li>I will only use virus protection software, anti-spyware, and firewall/intrusion detection software authorized by the VA on VA equipment or on computer systems that are connected to any VA network.</li>\r\n                <li>If authorized, by waiver, to use my own personal equipment, I must use VA approved virus protection software, anti-spyware, and firewall/intrusion detection software and ensure the software is configured to meet VA configuration requirements.  My local CIO will confirm that the system meets VA configuration requirements prior to connection to VA’s network.</li>\r\n                <li>I will never swap or surrender VA hard drives or other storage devices to anyone other than an authorized OI&T employee at the time of system problems.</li>\r\n                <li>I will not disable or degrade software programs used by the VA that install security software updates to VA computer equipment, to computer equipment used to connect to VA information systems, or to create, store or use VA information.</li>\r\n                <li>I agree to allow examination by authorized OI&T personnel of any personal IT device [Other Equipment (OE)] that I have been granted permission to use, whether remotely or in any setting to access VA information or information systems or to create, store or use VA information.</li>\r\n                <li>I agree to have all equipment scanned by the appropriate facility IT Operations Service prior to connecting to the VA network if the equipment has not been connected to the VA network for a period of more than three weeks.</li>\r\n                <li>I will complete mandatory periodic security and privacy awareness training within designated timeframes, and complete any additional required training for the particular systems to which I require access.</li>\r\n                <li>I understand that if I must sign a non-VA entity’s Rules of Behavior to obtain access to information or information systems controlled by that non-VA entity, I still must comply with my responsibilities under the VA National Rules of Behavior when accessing or using VA information or information systems.  However, those Rules of Behavior apply to my access to or use of the non-VA entity’s information and information systems as a VA user.</li>\r\n                <li>I understand that remote access is allowed from other Federal government computers and systems to VA information systems, subject to the terms of VA and the host Federal agency’s policies.</li>\r\n                <li>I agree that I will directly connect to the VA network whenever possible.  If a direct connection to the VA network is not possible, then I will use VA-approved remote access software and services.  I must use VA-provided IT equipment for remote access when possible.  I may be permitted to use non–VA IT equipment [Other Equipment (OE)] only if a VA-CIO-approved waiver has been issued and the equipment is configured to follow all VA security policies and requirements.  I agree that VA OI&T officials may examine such devices, including an OE device operating under an approved waiver, at any time for proper configuration and unauthorized storage of VA sensitive information.</li>\r\n                <li>I agree that I will not have both a VA network connection and any kind of non-VA network connection (including a modem or phone line or wireless network card, etc.) physically connected to any computer at the same time unless the dual connection is explicitly authorized in writing by my local CIO.</li>\r\n                <li>I agree that I will not allow VA sensitive information to reside on non-VA systems or devices unless specifically designated and approved in advance by the appropriate VA official (supervisor), and a waiver has been issued by the VA’s CIO.  I agree that I will not access, transmit or store remotely any VA sensitive information that is not encrypted using VA approved encryption.</li>\r\n                <li>I will obtain my VA supervisor’s authorization, in writing, prior to transporting, transmitting, accessing, and using VA sensitive information outside of VA’s protected environment.</li>\r\n                <li>I will ensure that VA sensitive information, in any format, and devices, systems and/or software that contain such information or that I use to access VA sensitive information or information systems are adequately secured in remote locations, e.g., at home and during travel, and agree to periodic VA inspections of the devices, systems or software from which I conduct access from remote locations.  I agree that if I work from a remote location pursuant to an approved telework agreement with VA sensitive information that authorized OI&T personnel may periodically inspect the remote location for compliance with required security requirements.</li>\r\n                <li>I will protect sensitive information from unauthorized disclosure, use, modification, or destruction, including using encryption products approved and provided by the VA to protect sensitive data.</li>\r\n                <li>I will not store or transport any VA sensitive information on any portable storage media or device unless it is encrypted using VA approved encryption.</li>\r\n                <li>I will use VA-provided encryption to encrypt any e-mail, including attachments to the e-mail, that contains VA sensitive information before sending the e-mail.  I will not send any e-mail that contains VA sensitive information in an unencrypted form.  VA sensitive information includes personally identifiable information and protected health information.</li>\r\n                <li>I may be required to acknowledge or sign additional specific or unique rules of behavior in order to access or use specific VA systems.  I understand that those specific rules of behavior may include, but are not limited to, restrictions or prohibitions on limited personal use, special requirements for access or use of the data in that system, special requirements for the devices used to access that specific system, or special restrictions on interconnections between that system and other IT resources or systems.</li>\r\n            </ol>\r\n        </li>\r\n        <li>Acknowledgement and Acceptance\r\n            <ol type=\"a\">\r\n                <li>I acknowledge that I have received a copy of these Rules of Behavior.</li>\r\n                <li>I understand, accept and agree to comply with all terms and conditions of these Rules of Behavior.</li>\r\n            </ol>\r\n        </li>\r\n    </ol>\r\n</div>\r\n<div>\r\n<label class=\"checkable leaf_check\" for=\"rob_acceptance\" title=\"Rules of Behavior\">\r\n<input class=\"icheck leaf_check\" type=\"checkbox\" id=\"rob_acceptance\" value=\"Accepted terms and rules of behavior\" />\r\n<span class=\"leaf_check\"></span> I understand and accept. <span id=\"rob_required\" style=\"margin-left: 8px; color: red\">*&nbsp; Required</span>\r\n</label>\r\n</div>',	'<style>\r\n    #devconsole_description > p, #devconsole_description > ul > li {\r\n        font-size: 16px;\r\n    }\r\n</style>\r\n<div id=\"devconsole_description\">\r\n<p><b>This is a request to access the LEAF Developer Console.</b></p>\r\n<p>Approved individuals will gain the ability to modify LEAF\'s user interface using HTML, CSS, and JavaScript technologies.</p>\r\n<p>By approving this request:\r\n<ul>\r\n    <li>I validate that the person requesting access as the technical ability to work with HTML, CSS, and JavaScript source code.</li>\r\n    <li>I recognize that source code customizations and their maintenance are the responsibility of the office seeking to make customizations. In the event that the responsible office becomes unable to support maintenance, customizations may be easily removed to restore standard functionality.</li>\r\n</ul>\r\n</p>\r\n</div>',	NULL,	NULL,	0,	1,	'2019-12-13 17:01:00',	0,	0,	1),
(-4,	'Supervisor or ELT (GS-13 or higher)',	'orgchart_employee',	NULL,	NULL,	-3,	'leaf_secure',	NULL,	NULL,	NULL,	NULL,	1,	1,	'2019-08-09 15:52:34',	0,	0,	1),
(-3,	'Approval Officials',	'',	NULL,	NULL,	NULL,	'leaf_secure',	'',	NULL,	NULL,	NULL,	0,	1,	'2019-08-09 15:48:46',	0,	0,	1),
(-2,	'Justification for collection of sensitive data',	'textarea',	'',	'',	NULL,	'leaf_secure',	'<div id=\"leafSecureDialogContent\"></div>\n\n<script src=\"js/LeafSecureReviewDialog.js\"></script>\n<script>\n$(function() {\n\n    LeafSecureReviewDialog(\'leafSecureDialogContent\');\n\n});\n</script>',	'<div id=\"leafSecureDialogContentPrint\"></div>\n\n<script src=\"js/LeafSecureReviewDialog.js\"></script>\n<script>\n$(function() {\n\n    LeafSecureReviewDialog(\'leafSecureDialogContentPrint\');\n\n});\n</script>',	NULL,	NULL,	1,	2,	'2019-07-30 20:25:06',	0,	0,	1),
(-1,	'Privacy Officer',	'orgchart_employee',	NULL,	NULL,	-3,	'leaf_secure',	NULL,	NULL,	NULL,	NULL,	1,	1,	'2019-07-30 17:11:38',	0,	0,	1),
(1,	'Data Element',	'text',	'',	'',	NULL,	'form_533f5',	NULL,	NULL,	NULL,	NULL,	0,	-128,	'2025-03-05 22:34:21',	0,	0,	1),
(2,	'SORN',	'',	'',	'',	NULL,	'form_f5204',	NULL,	NULL,	NULL,	NULL,	0,	-128,	'2025-03-05 22:46:21',	0,	0,	1),
(3,	'Identifier',	'text',	'',	'',	2,	'form_f5204',	NULL,	NULL,	NULL,	NULL,	0,	-128,	'2025-03-05 22:46:45',	1,	0,	1),
(4,	'SORN',	'textarea',	'',	'',	2,	'form_f5204',	NULL,	NULL,	NULL,	NULL,	0,	-128,	'2025-03-05 22:46:56',	0,	0,	1),
(5,	'LEAF-S Privacy Element Request',	'',	'',	'',	NULL,	'form_3ae23',	NULL,	NULL,	NULL,	NULL,	0,	-128,	'2025-03-25 18:38:11',	0,	0,	1),
(6,	'<p><span style=\"color: rgb(0, 0, 0);\"><strong>Please take a moment to review&nbsp;LEAF\'s Platforms Privacy Impact Assessment (PIA) privacy characterizations</strong><br>-&nbsp;<a href=\"./open.php?report=32wmT\" target=\"_blank\">PHI/PII Data Elements</a><br>-&nbsp;<a href=\"./open.php?report=32wmU\" target=\"_blank\">System of Records Notice (SORN)</a></span></p><p><span style=\"color: rgb(0, 0, 0);\"><strong>\nIf a privacy item is not listed, please submit a request below to add the privacy item to LEAF\'s&nbsp;Privacy Impact Assessment (PIA).</strong></span></p>',	'',	'',	'',	5,	'form_3ae23',	NULL,	NULL,	NULL,	NULL,	0,	-128,	'2025-03-25 18:38:11',	1,	0,	1),
(7,	'LEAF-S Privacy Element Request',	'',	'',	'',	NULL,	'form_3ae23',	NULL,	NULL,	NULL,	NULL,	0,	-127,	'2025-03-25 18:38:11',	1743608228,	0,	1),
(8,	'',	'textarea',	'Data Element Requested',	'',	5,	'form_3ae23',	NULL,	NULL,	NULL,	NULL,	0,	-127,	'2025-03-25 18:38:11',	1,	0,	1),
(9,	'<p>I am requesting to add the following <u>System of Records Notice</u> to LEAF\'s Privacy Impact Assessment (PIA):</p>',	'text',	'SORN Requested',	'',	5,	'form_3ae23',	NULL,	NULL,	NULL,	NULL,	0,	-126,	'2025-03-25 18:38:11',	1,	0,	1),
(10,	'LEAF Platform Review',	'',	'',	'',	NULL,	'form_6c6bc',	NULL,	NULL,	NULL,	NULL,	0,	-128,	'2025-03-25 18:38:12',	0,	0,	1),
(11,	'The privacy element',	'radio\r\nExists\r\nDoes not exist',	'',	'',	10,	'form_6c6bc',	NULL,	NULL,	NULL,	NULL,	0,	-128,	'2025-03-25 18:38:12',	0,	0,	1),
(12,	'<p style=\"text-align: left;\"><strong style=\"color: rgb(192, 80, 77);\">CLOSE REQUEST</strong></p>',	'',	'',	'',	11,	'form_6c6bc',	'',	'',	'[{\"childIndID\":12,\"parentIndID\":11,\"selectedOp\":\"==\",\"selectedParentValue\":\"Exists\",\"selectedChildValue\":\"\",\"selectedOutcome\":\"show\",\"crosswalkFile\":\"\",\"crosswalkHasHeader\":false,\"level2IndID\":null,\"childFormat\":\"\",\"parentFormat\":\"radio\"}]',	NULL,	0,	-128,	'2025-03-25 18:38:12',	0,	0,	1),
(13,	'Should this element be added to LEAF platform PIA?',	'radio\r\nYes\r\nNo\r\nUnsure',	'',	'',	11,	'form_6c6bc',	'',	'',	'[{\"childIndID\":13,\"parentIndID\":11,\"selectedOp\":\"==\",\"selectedParentValue\":\"Does not exist\",\"selectedChildValue\":\"\",\"selectedOutcome\":\"show\",\"crosswalkFile\":\"\",\"crosswalkHasHeader\":false,\"level2IndID\":null,\"childFormat\":\"radio\",\"parentFormat\":\"radio\"}]',	NULL,	0,	-127,	'2025-03-25 18:38:12',	0,	0,	1),
(14,	'<p>If yes, type the privacy element name to be added. </p><p><span style=\"color: rgb(192, 80, 77);\">\n(may need modification from users input to align with formatting, verbiage, etc.)</span></p>',	'text',	'',	'',	13,	'form_6c6bc',	'',	'',	'[{\"childIndID\":14,\"parentIndID\":13,\"selectedOp\":\"==\",\"selectedParentValue\":\"Yes\",\"selectedChildValue\":\"\",\"selectedOutcome\":\"show\",\"crosswalkFile\":\"\",\"crosswalkHasHeader\":false,\"level2IndID\":null,\"childFormat\":\"text\",\"parentFormat\":\"radio\"}]',	NULL,	0,	-128,	'2025-03-25 18:38:12',	1,	0,	1),
(15,	'<p><strong style=\"color: rgb(192, 80, 77);\">IF NO / UNSURE, SEND TO PRIVACY OFFICER FOR REVIEW.</strong></p>',	'',	'',	'',	13,	'form_6c6bc',	'',	'',	'[{\"childIndID\":15,\"parentIndID\":13,\"selectedOp\":\"==\",\"selectedParentValue\":\"No\",\"selectedChildValue\":\"\",\"selectedOutcome\":\"show\",\"crosswalkFile\":\"\",\"crosswalkHasHeader\":false,\"level2IndID\":null,\"childFormat\":\"\",\"parentFormat\":\"radio\"},{\"childIndID\":15,\"parentIndID\":13,\"selectedOp\":\"==\",\"selectedParentValue\":\"Unsure\",\"selectedChildValue\":\"\",\"selectedOutcome\":\"show\",\"crosswalkFile\":\"\",\"crosswalkHasHeader\":false,\"level2IndID\":null,\"childFormat\":\"\",\"parentFormat\":\"radio\"}]',	NULL,	0,	-128,	'2025-03-25 18:38:12',	0,	0,	1),
(16,	'Final Review',	'',	'',	'',	NULL,	'form_c5ba3',	NULL,	NULL,	NULL,	NULL,	0,	-128,	'2025-04-02 15:29:10',	0,	0,	1),
(17,	'Privacy Officer Review',	'',	'',	'',	NULL,	'form_b9953',	NULL,	NULL,	NULL,	NULL,	0,	-128,	'2025-04-02 15:29:39',	0,	0,	1),
(18,	'Should the requested privacy element(s) be added to LEAF platform  Privacy Impact Assessment (PIA)?',	'radio\nYes\nNo',	'',	'',	17,	'form_b9953',	NULL,	NULL,	NULL,	NULL,	0,	-128,	'2025-05-16 21:16:48',	0,	0,	1),
(19,	'<p>Type the name of the privacy element(s) to be added</p>',	'textarea',	'',	'',	18,	'form_b9953',	NULL,	NULL,	'[{\"childIndID\":19,\"parentIndID\":18,\"selectedOp\":\"==\",\"selectedParentValue\":\"Yes\",\"selectedChildValue\":\"\",\"selectedOutcome\":\"show\",\"crosswalkFile\":\"\",\"crosswalkHasHeader\":false,\"level2IndID\":null,\"childFormat\":\"textarea\",\"parentFormat\":\"radio\"}]',	NULL,	0,	-128,	'2025-05-16 21:18:00',	0,	0,	1),
(20,	'If no, provide brief justification',	'textarea',	'',	'',	19,	'form_b9953',	NULL,	NULL,	'[{\"childIndID\":20,\"parentIndID\":18,\"selectedOp\":\"==\",\"selectedParentValue\":\"No\",\"selectedChildValue\":\"\",\"selectedOutcome\":\"show\",\"crosswalkFile\":\"\",\"crosswalkHasHeader\":false,\"level2IndID\":null,\"childFormat\":\"textarea\",\"parentFormat\":\"radio\"}]',	NULL,	0,	-128,	'2025-05-16 21:18:54',	0,	0,	1),
(21,	'Element(s) that were added to the PIA',	'textarea',	'',	'',	16,	'form_c5ba3',	NULL,	NULL,	NULL,	NULL,	0,	-128,	'2025-05-16 21:20:24',	0,	0,	1),
(22,	'Date added to PIA',	'date',	'',	'',	16,	'form_c5ba3',	NULL,	NULL,	NULL,	NULL,	0,	-127,	'2025-05-16 21:20:35',	0,	0,	1),
(23,	'I am requesting to add the following privacy data element to LEAF\'s Privacy Impact Assessment (PIA):',	'grid\n[{\"id\":\"col_f92e\",\"name\":\"Requested Item\",\"type\":\"text\"},{\"id\":\"col_6157\",\"name\":\"Type of Item\",\"type\":\"dropdown\",\"options\":[\"\",\"PHI/PII Data Elements\",\"System of Records Notice\"]}]',	'',	'',	5,	'form_3ae23',	NULL,	NULL,	NULL,	NULL,	0,	-128,	'2025-05-20 19:40:08',	0,	0,	1),
(24,	'SORN URL',	'text',	'',	'',	2,	'form_f5204',	NULL,	NULL,	NULL,	NULL,	0,	-127,	'2026-02-06 14:03:48',	0,	0,	1),
(25,	'Review',	'',	'',	'',	NULL,	'form_9a096',	NULL,	NULL,	NULL,	NULL,	0,	-128,	'2026-02-06 14:10:29',	0,	0,	1),
(26,	'Reviewed Date',	'date',	'',	'',	25,	'form_9a096',	NULL,	NULL,	NULL,	NULL,	0,	-128,	'2026-02-06 14:10:37',	0,	0,	1),
(27,	'Next Review Date',	'date',	'',	'',	25,	'form_9a096',	'<script>\n  (function () {\n    \"use strict\";\n\n    var START_SEL = \'input[name=\"26\"]\';\n    var EXPIRE_SEL = \'input[name=\"27\"]\';\n\n    function pad2(n) { return String(n).padStart(2, \"0\"); }\n\n    function parseMMDDYYYY(s) {\n      if (!s) return null;\n      var m = String(s).trim().match(/^(\\d{2})\\/(\\d{2})\\/(\\d{4})$/);\n      if (!m) return null;\n\n      var mm = Number(m[1]), dd = Number(m[2]), yyyy = Number(m[3]);\n      var d = new Date(yyyy, mm - 1, dd);\n      if (d.getFullYear() !== yyyy || d.getMonth() !== mm - 1 || d.getDate() !== dd) return null;\n      return d;\n    }\n\n    function formatMMDDYYYY(d) {\n      return pad2(d.getMonth() + 1) + \"/\" + pad2(d.getDate()) + \"/\" + d.getFullYear();\n    }\n\n    function addThreeMonths(d) {\n      var y = d.getFullYear();\n      var m = d.getMonth() + 3;\n      var day = d.getDate();\n      var out = new Date(y, m, day);\n      if (out.getDate() !== day) out = new Date(y, m + 1, 0);\n      return out;\n    }\n\n    function computeExpireStr() {\n      var startEl = document.querySelector(START_SEL);\n      if (!startEl) return null;\n\n      var start = parseMMDDYYYY(startEl.value);\n      if (!start) return null;\n\n      return formatMMDDYYYY(addThreeMonths(start));\n    }\n\n    function notify(el) {\n      if (!el) return;\n      el.dispatchEvent(new Event(\"input\", { bubbles: true }));\n      el.dispatchEvent(new Event(\"change\", { bubbles: true }));\n\n      if (window.jQuery && window.jQuery.fn && window.jQuery.fn.datepicker) {\n        try { window.jQuery(el).datepicker(\"setDate\", el.value); } catch (e) {}\n      }\n    }\n\n    function fillExpire() {\n      var expireEl = document.querySelector(EXPIRE_SEL);\n      if (!expireEl) return;\n\n      var exp = computeExpireStr();\n      if (!exp) return;\n\n      expireEl.value = exp;\n      notify(expireEl);\n    }\n\n    function hookStartInput() {\n      var startEl = document.querySelector(START_SEL);\n      if (!startEl) return;\n\n      startEl.addEventListener(\"change\", fillExpire, true);\n      startEl.addEventListener(\"blur\", fillExpire, true);\n\n      if (window.jQuery && window.jQuery.fn && window.jQuery.fn.datepicker) {\n        try {\n          var $ = window.jQuery;\n          var $start = $(startEl);\n\n          var existing = null;\n          try { existing = $start.datepicker(\"option\", \"onSelect\"); } catch (e) {}\n\n          try {\n            $start.datepicker(\"option\", \"onSelect\", function (dateText, inst) {\n              try { if (typeof existing === \"function\") existing.call(this, dateText, inst); } catch (e) {}\n              fillExpire();\n            });\n          } catch (e) {}\n        } catch (e) {}\n      }\n    }\n\n    function isSubmitEndpoint(url) {\n      try {\n        var u = new URL(url, window.location.origin);\n        return /\\/api\\/form\\/\\d+\\/submit\\/?$/.test(u.pathname);\n      } catch (e) {\n        return /\\/api\\/form\\/\\d+\\/submit\\/?/.test(String(url || \"\"));\n      }\n    }\n\n    function hookSubmitClicks() {\n      document.addEventListener(\"pointerdown\", fillExpire, true);\n\n      document.addEventListener(\"click\", function (e) {\n        var t = e.target;\n        if (!t) return;\n        if (t.matches(\'button, input[type=\"button\"], input[type=\"submit\"]\')) {\n          var label = (t.innerText || t.value || \"\").toLowerCase();\n          if (label.includes(\"submit\") || label.includes(\"save\")) {\n            fillExpire();\n          }\n        }\n      }, true);\n    }\n\n    function hookFetchAndXHRForRefresh() {\n      if (window.fetch && !window.fetch.__leafExpireHooked) {\n        var origFetch = window.fetch;\n        window.fetch = function (input, init) {\n          var url = (typeof input === \"string\") ? input : (input && input.url);\n\n          try { if (url && isSubmitEndpoint(url)) fillExpire(); } catch (e) {}\n\n          return origFetch.apply(this, arguments).then(function (resp) {\n            try {\n              if (url && isSubmitEndpoint(url) && resp && resp.ok) {\n                setTimeout(function () {\n                  try { window.location.reload(); } catch (e) {}\n                }, 250);\n              }\n            } catch (e) {}\n            return resp;\n          });\n        };\n        window.fetch.__leafExpireHooked = true;\n      }\n\n      if (window.XMLHttpRequest && !window.XMLHttpRequest.__leafExpireHooked) {\n        var OriginalXHR = window.XMLHttpRequest;\n\n        function WrappedXHR() {\n          var xhr = new OriginalXHR();\n          var originalOpen = xhr.open;\n          var originalSend = xhr.send;\n\n          xhr.open = function (method, url) {\n            xhr.__leafUrl = url;\n            return originalOpen.apply(xhr, arguments);\n          };\n\n          xhr.send = function (body) {\n            try {\n              if (xhr.__leafUrl && isSubmitEndpoint(xhr.__leafUrl)) {\n                fillExpire();\n                xhr.addEventListener(\"load\", function () {\n                  try {\n                    if (xhr.status >= 200 && xhr.status < 300) {\n                      setTimeout(function () {\n                        try { window.location.reload(); } catch (e) {}\n                      }, 250);\n                    }\n                  } catch (e) {}\n                });\n              }\n            } catch (e) {}\n            return originalSend.apply(xhr, arguments);\n          };\n\n          return xhr;\n        }\n\n        WrappedXHR.prototype = OriginalXHR.prototype;\n        window.XMLHttpRequest = WrappedXHR;\n        window.XMLHttpRequest.__leafExpireHooked = true;\n      }\n    }\n\n    function init() {\n      hookStartInput();\n      hookSubmitClicks();\n      hookFetchAndXHRForRefresh();\n      fillExpire();\n    }\n\n    if (document.readyState === \"loading\") {\n      document.addEventListener(\"DOMContentLoaded\", init);\n    } else {\n      init();\n    }\n  })();\n</script>',	NULL,	NULL,	NULL,	0,	-127,	'2026-02-06 14:10:49',	0,	0,	1);

DROP TABLE IF EXISTS `notes`;
CREATE TABLE `notes` (
  `noteID` mediumint unsigned NOT NULL AUTO_INCREMENT,
  `recordID` mediumint unsigned NOT NULL,
  `note` text NOT NULL,
  `timestamp` int unsigned NOT NULL DEFAULT '0',
  `userID` varchar(50) NOT NULL,
  `deleted` tinyint DEFAULT NULL,
  `userMetadata` json DEFAULT NULL,
  PRIMARY KEY (`noteID`),
  KEY `recordID` (`recordID`),
  CONSTRAINT `fk_records_notes_deletion` FOREIGN KEY (`recordID`) REFERENCES `records` (`recordID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;


DROP TABLE IF EXISTS `process_query`;
CREATE TABLE `process_query` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userID` varchar(50) DEFAULT NULL,
  `url` text,
  `lastProcess` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `lastProcess` (`lastProcess`),
  FULLTEXT KEY `url` (`url`),
  FULLTEXT KEY `userid_url` (`userID`,`url`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;


DROP TABLE IF EXISTS `records`;
CREATE TABLE `records` (
  `recordID` mediumint unsigned NOT NULL AUTO_INCREMENT,
  `date` int unsigned NOT NULL,
  `serviceID` smallint NOT NULL DEFAULT '0',
  `userID` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `title` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `priority` tinyint NOT NULL DEFAULT '0',
  `lastStatus` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `submitted` int NOT NULL DEFAULT '0',
  `deleted` int NOT NULL DEFAULT '0',
  `isWritableUser` tinyint unsigned NOT NULL DEFAULT '1',
  `isWritableGroup` tinyint unsigned NOT NULL DEFAULT '1',
  `userMetadata` json DEFAULT NULL,
  PRIMARY KEY (`recordID`),
  KEY `date` (`date`),
  KEY `deleted` (`deleted`),
  KEY `serviceID` (`serviceID`),
  KEY `userID` (`userID`),
  KEY `submitted` (`submitted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `records` (`recordID`, `date`, `serviceID`, `userID`, `title`, `priority`, `lastStatus`, `submitted`, `deleted`, `isWritableUser`, `isWritableGroup`, `userMetadata`) VALUES
(1,	1741214408,	0,	'tester',	'untitled',	0,	NULL,	0,	0,	1,	1,	'{\"email\": \"tester.tester@va.gov\", \"lastName\": \"Tester\", \"userName\": \"tester\", \"firstName\": \"Tester\", \"middleName\": \"\"}'),
(2,	1741214428,	0,	'tester',	'untitled',	0,	NULL,	0,	0,	1,	1,	'{\"email\": \"tester.tester@va.gov\", \"lastName\": \"Tester\", \"userName\": \"tester\", \"firstName\": \"Tester\", \"middleName\": \"\"}'),
(3,	1743608255,	0,	'tester',	'Test',	0,	NULL,	0,	1769536669,	1,	1,	'{\"email\": \"tester.tester@va.gov\", \"lastName\": \"Tester\", \"userName\": \"tester\", \"firstName\": \"Tester\", \"middleName\": \"\"}'),
(4,	1744042825,	0,	'tester',	'Data Element_3',	0,	NULL,	0,	0,	1,	1,	'{\"email\": \"tester.tester@va.gov\", \"lastName\": \"Tester\", \"userName\": \"tester\", \"firstName\": \"Tester\", \"middleName\": \"\"}'),
(5,	1744042825,	0,	'tester',	'Data Element_1',	0,	NULL,	0,	1770386253,	1,	1,	'{\"email\": \"tester.tester@va.gov\", \"lastName\": \"Tester\", \"userName\": \"tester\", \"firstName\": \"Tester\", \"middleName\": \"\"}'),
(6,	1744042825,	0,	'tester',	'Data Element_2',	0,	NULL,	0,	0,	1,	1,	'{\"email\": \"tester.tester@va.gov\", \"lastName\": \"Tester\", \"userName\": \"tester\", \"firstName\": \"Tester\", \"middleName\": \"\"}'),
(7,	1744042825,	0,	'tester',	'Data Element_4',	0,	NULL,	0,	0,	1,	1,	'{\"email\": \"tester.tester@va.gov\", \"lastName\": \"Tester\", \"userName\": \"tester\", \"firstName\": \"Tester\", \"middleName\": \"\"}'),
(8,	1744042825,	0,	'tester',	'Data Element_6',	0,	NULL,	0,	0,	1,	1,	'{\"email\": \"tester.tester@va.gov\", \"lastName\": \"Tester\", \"userName\": \"tester\", \"firstName\": \"Tester\", \"middleName\": \"\"}'),
(9,	1744042825,	0,	'tester',	'Data Element_7',	0,	NULL,	0,	1770386128,	1,	1,	'{\"email\": \"tester.tester@va.gov\", \"lastName\": \"Tester\", \"userName\": \"tester\", \"firstName\": \"Tester\", \"middleName\": \"\"}'),
(10,	1744042826,	0,	'tester',	'Data Element_8',	0,	NULL,	0,	1770386115,	1,	1,	'{\"email\": \"tester.tester@va.gov\", \"lastName\": \"Tester\", \"userName\": \"tester\", \"firstName\": \"Tester\", \"middleName\": \"\"}'),
(11,	1744042826,	0,	'tester',	'Data Element_9',	0,	NULL,	0,	0,	1,	1,	'{\"email\": \"tester.tester@va.gov\", \"lastName\": \"Tester\", \"userName\": \"tester\", \"firstName\": \"Tester\", \"middleName\": \"\"}'),
(12,	1744042826,	0,	'tester',	'Data Element_5',	0,	NULL,	0,	0,	1,	1,	'{\"email\": \"tester.tester@va.gov\", \"lastName\": \"Tester\", \"userName\": \"tester\", \"firstName\": \"Tester\", \"middleName\": \"\"}'),
(13,	1744042826,	0,	'tester',	'Data Element_10',	0,	NULL,	0,	0,	1,	1,	'{\"email\": \"tester.tester@va.gov\", \"lastName\": \"Tester\", \"userName\": \"tester\", \"firstName\": \"Tester\", \"middleName\": \"\"}'),
(14,	1744042826,	0,	'tester',	'Data Element_12',	0,	NULL,	0,	0,	1,	1,	'{\"email\": \"tester.tester@va.gov\", \"lastName\": \"Tester\", \"userName\": \"tester\", \"firstName\": \"Tester\", \"middleName\": \"\"}'),
(15,	1744042826,	0,	'tester',	'Data Element_11',	0,	NULL,	0,	1770386149,	1,	1,	'{\"email\": \"tester.tester@va.gov\", \"lastName\": \"Tester\", \"userName\": \"tester\", \"firstName\": \"Tester\", \"middleName\": \"\"}'),
(16,	1744042826,	0,	'tester',	'Data Element_13',	0,	NULL,	0,	0,	1,	1,	'{\"email\": \"tester.tester@va.gov\", \"lastName\": \"Tester\", \"userName\": \"tester\", \"firstName\": \"Tester\", \"middleName\": \"\"}'),
(17,	1744042826,	0,	'tester',	'Data Element_15',	0,	NULL,	0,	1770386208,	1,	1,	'{\"email\": \"tester.tester@va.gov\", \"lastName\": \"Tester\", \"userName\": \"tester\", \"firstName\": \"Tester\", \"middleName\": \"\"}'),
(18,	1744042826,	0,	'tester',	'Data Element_14',	0,	NULL,	0,	1744042956,	1,	1,	'{\"email\": \"tester.tester@va.gov\", \"lastName\": \"Tester\", \"userName\": \"tester\", \"firstName\": \"Tester\", \"middleName\": \"\"}'),
(19,	1744042826,	0,	'tester',	'Data Element_16',	0,	NULL,	0,	1770386212,	1,	1,	'{\"email\": \"tester.tester@va.gov\", \"lastName\": \"Tester\", \"userName\": \"tester\", \"firstName\": \"Tester\", \"middleName\": \"\"}'),
(20,	1744042827,	0,	'tester',	'Data Element_17',	0,	NULL,	0,	1770386278,	1,	1,	'{\"email\": \"tester.tester@va.gov\", \"lastName\": \"Tester\", \"userName\": \"tester\", \"firstName\": \"Tester\", \"middleName\": \"\"}'),
(21,	1744042827,	0,	'tester',	'Data Element_18',	0,	NULL,	0,	0,	1,	1,	'{\"email\": \"tester.tester@va.gov\", \"lastName\": \"Tester\", \"userName\": \"tester\", \"firstName\": \"Tester\", \"middleName\": \"\"}'),
(22,	1744042827,	0,	'tester',	'Data Element_19',	0,	NULL,	0,	0,	1,	1,	'{\"email\": \"tester.tester@va.gov\", \"lastName\": \"Tester\", \"userName\": \"tester\", \"firstName\": \"Tester\", \"middleName\": \"\"}'),
(23,	1744042827,	0,	'tester',	'Data Element_21',	0,	NULL,	0,	0,	1,	1,	'{\"email\": \"tester.tester@va.gov\", \"lastName\": \"Tester\", \"userName\": \"tester\", \"firstName\": \"Tester\", \"middleName\": \"\"}'),
(24,	1744042827,	0,	'tester',	'Data Element_20',	0,	NULL,	0,	0,	1,	1,	'{\"email\": \"tester.tester@va.gov\", \"lastName\": \"Tester\", \"userName\": \"tester\", \"firstName\": \"Tester\", \"middleName\": \"\"}'),
(25,	1744042827,	0,	'tester',	'Data Element_22',	0,	NULL,	0,	0,	1,	1,	'{\"email\": \"tester.tester@va.gov\", \"lastName\": \"Tester\", \"userName\": \"tester\", \"firstName\": \"Tester\", \"middleName\": \"\"}'),
(26,	1744042827,	0,	'tester',	'Data Element_23',	0,	NULL,	0,	0,	1,	1,	'{\"email\": \"tester.tester@va.gov\", \"lastName\": \"Tester\", \"userName\": \"tester\", \"firstName\": \"Tester\", \"middleName\": \"\"}'),
(27,	1744042827,	0,	'tester',	'Data Element_24',	0,	NULL,	0,	0,	1,	1,	'{\"email\": \"tester.tester@va.gov\", \"lastName\": \"Tester\", \"userName\": \"tester\", \"firstName\": \"Tester\", \"middleName\": \"\"}'),
(28,	1744043124,	0,	'tester',	'SORN_1',	0,	NULL,	0,	0,	1,	1,	'{\"email\": \"tester.tester@va.gov\", \"lastName\": \"Tester\", \"userName\": \"tester\", \"firstName\": \"Tester\", \"middleName\": \"\"}'),
(29,	1744043124,	0,	'tester',	'SORN_2',	0,	NULL,	0,	1747839770,	1,	1,	'{\"email\": \"tester.tester@va.gov\", \"lastName\": \"Tester\", \"userName\": \"tester\", \"firstName\": \"Tester\", \"middleName\": \"\"}'),
(30,	1744043125,	0,	'tester',	'SORN_3',	0,	NULL,	0,	1747839750,	1,	1,	'{\"email\": \"tester.tester@va.gov\", \"lastName\": \"Tester\", \"userName\": \"tester\", \"firstName\": \"Tester\", \"middleName\": \"\"}'),
(31,	1744043125,	0,	'tester',	'SORN_4',	0,	NULL,	0,	0,	1,	1,	'{\"email\": \"tester.tester@va.gov\", \"lastName\": \"Tester\", \"userName\": \"tester\", \"firstName\": \"Tester\", \"middleName\": \"\"}'),
(32,	1744043125,	0,	'tester',	'SORN_5',	0,	NULL,	0,	1747839745,	1,	1,	'{\"email\": \"tester.tester@va.gov\", \"lastName\": \"Tester\", \"userName\": \"tester\", \"firstName\": \"Tester\", \"middleName\": \"\"}'),
(33,	1744043126,	0,	'tester',	'SORN_6',	0,	NULL,	0,	0,	1,	1,	'{\"email\": \"tester.tester@va.gov\", \"lastName\": \"Tester\", \"userName\": \"tester\", \"firstName\": \"Tester\", \"middleName\": \"\"}'),
(34,	1747430522,	0,	'tester',	'Test',	0,	'Submitted',	1747431022,	1747431514,	0,	1,	'{\"email\": \"tester.tester@va.gov\", \"lastName\": \"Tester\", \"userName\": \"tester\", \"firstName\": \"Tester\", \"middleName\": \"\"}'),
(35,	1747767737,	0,	'tester',	'Record',	0,	NULL,	0,	0,	1,	1,	'{\"email\": \"tester.tester@va.gov\", \"lastName\": \"Tester\", \"userName\": \"tester\", \"firstName\": \"Tester\", \"middleName\": \"M\"}'),
(36,	1747839619,	0,	'tester',	'untitled',	0,	NULL,	0,	0,	1,	1,	'{\"email\": \"tester.tester@va.gov\", \"lastName\": \"Tester\", \"userName\": \"tester\", \"firstName\": \"Tester\", \"middleName\": \"\"}'),
(37,	1747839637,	0,	'tester',	'untitled',	0,	NULL,	0,	0,	1,	1,	'{\"email\": \"tester.tester@va.gov\", \"lastName\": \"Tester\", \"userName\": \"tester\", \"firstName\": \"Tester\", \"middleName\": \"\"}'),
(38,	1747839655,	0,	'tester',	'untitled',	0,	NULL,	0,	0,	1,	1,	'{\"email\": \"tester.tester@va.gov\", \"lastName\": \"Tester\", \"userName\": \"tester\", \"firstName\": \"Tester\", \"middleName\": \"\"}'),
(39,	1747839674,	0,	'tester',	'untitled',	0,	NULL,	0,	0,	1,	1,	'{\"email\": \"tester.tester@va.gov\", \"lastName\": \"Tester\", \"userName\": \"tester\", \"firstName\": \"Tester\", \"middleName\": \"\"}'),
(40,	1747839675,	0,	'tester',	'untitled',	0,	NULL,	0,	0,	1,	1,	'{\"email\": \"tester.tester@va.gov\", \"lastName\": \"Tester\", \"userName\": \"tester\", \"firstName\": \"Tester\", \"middleName\": \"\"}'),
(41,	1770302335,	0,	'tester',	'LEAF Secure Certification',	0,	'Approved',	1770302398,	1770729518,	0,	1,	'{\"email\": \"tester.tester@va.gov\", \"lastName\": \"Tester\", \"userName\": \"tester\", \"firstName\": \"Tester\", \"middleName\": \"\"}'),
(42,	1770385938,	0,	'tester',	'untitled',	0,	NULL,	0,	0,	1,	1,	'{\"email\": \"tester.tester@va.gov\", \"lastName\": \"Tester\", \"userName\": \"tester\", \"firstName\": \"Tester\", \"middleName\": \"\"}'),
(43,	1770385948,	0,	'tester',	'untitled',	0,	NULL,	0,	0,	1,	1,	'{\"email\": \"tester.tester@va.gov\", \"lastName\": \"Tester\", \"userName\": \"tester\", \"firstName\": \"Tester\", \"middleName\": \"\"}'),
(44,	1770386035,	0,	'tester',	'untitled',	0,	NULL,	0,	0,	1,	1,	'{\"email\": \"tester.tester@va.gov\", \"lastName\": \"Tester\", \"userName\": \"tester\", \"firstName\": \"Tester\", \"middleName\": \"\"}'),
(45,	1770386216,	0,	'tester',	'untitled',	0,	NULL,	0,	0,	1,	1,	'{\"email\": \"tester.tester@va.gov\", \"lastName\": \"Tester\", \"userName\": \"tester\", \"firstName\": \"Tester\", \"middleName\": \"\"}'),
(46,	1770386291,	0,	'tester',	'untitled',	0,	NULL,	0,	0,	1,	1,	'{\"email\": \"tester.tester@va.gov\", \"lastName\": \"Tester\", \"userName\": \"tester\", \"firstName\": \"Tester\", \"middleName\": \"\"}'),
(47,	1770386301,	0,	'tester',	'untitled',	0,	NULL,	0,	0,	1,	1,	'{\"email\": \"tester.tester@va.gov\", \"lastName\": \"Tester\", \"userName\": \"tester\", \"firstName\": \"Tester\", \"middleName\": \"\"}'),
(48,	1770386312,	0,	'tester',	'untitled',	0,	NULL,	0,	0,	1,	1,	'{\"email\": \"tester.tester@va.gov\", \"lastName\": \"Tester\", \"userName\": \"tester\", \"firstName\": \"Tester\", \"middleName\": \"\"}');


DROP TABLE IF EXISTS `records_dependencies`;
CREATE TABLE `records_dependencies` (
  `recordID` mediumint unsigned NOT NULL,
  `dependencyID` smallint NOT NULL,
  `filled` tinyint NOT NULL DEFAULT '0',
  `time` int unsigned DEFAULT NULL,
  UNIQUE KEY `recordID` (`recordID`,`dependencyID`),
  KEY `filled` (`dependencyID`,`filled`),
  KEY `time` (`time`),
  CONSTRAINT `fk_records_dependencies_deletion` FOREIGN KEY (`recordID`) REFERENCES `records` (`recordID`) ON DELETE CASCADE,
  CONSTRAINT `fk_records_dependencyID` FOREIGN KEY (`dependencyID`) REFERENCES `dependencies` (`dependencyID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

INSERT INTO `records_dependencies` (`recordID`, `dependencyID`, `filled`, `time`) VALUES
(3,	9,	0,	NULL),
(34,	5,	1,	1747431022),
(34,	9,	0,	1747431372),
(41,	-1,	1,	1770302409),
(41,	5,	1,	1770302398);

DROP TABLE IF EXISTS `records_step_fulfillment`;
CREATE TABLE `records_step_fulfillment` (
  `recordID` mediumint unsigned NOT NULL,
  `stepID` smallint NOT NULL,
  `fulfillmentTime` int unsigned NOT NULL,
  UNIQUE KEY `recordID` (`recordID`,`stepID`) USING BTREE,
  CONSTRAINT `fk_records_step_fulfillment_deletion` FOREIGN KEY (`recordID`) REFERENCES `records` (`recordID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

INSERT INTO `records_step_fulfillment` (`recordID`, `stepID`, `fulfillmentTime`) VALUES
(34,	1,	1747431368),
(34,	3,	1747431372),
(41,	-3,	1770302400),
(41,	-2,	1770302409);


DROP TABLE IF EXISTS `records_workflow_state`;
CREATE TABLE `records_workflow_state` (
  `recordID` mediumint unsigned NOT NULL,
  `stepID` smallint NOT NULL,
  `blockingStepID` tinyint unsigned NOT NULL DEFAULT '0',
  `lastNotified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `initialNotificationSent` tinyint(1) DEFAULT '0',
  UNIQUE KEY `recordID` (`recordID`,`stepID`),
  KEY `idx_lastNotified` (`lastNotified`),
  CONSTRAINT `fk_records_workflow_state_deletion` FOREIGN KEY (`recordID`) REFERENCES `records` (`recordID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `route_events`;
CREATE TABLE `route_events` (
  `workflowID` smallint NOT NULL,
  `stepID` smallint NOT NULL,
  `actionType` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `eventID` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  UNIQUE KEY `workflowID_2` (`workflowID`,`stepID`,`actionType`,`eventID`),
  KEY `eventID` (`eventID`),
  KEY `workflowID` (`workflowID`,`stepID`,`actionType`),
  KEY `actionType` (`actionType`),
  CONSTRAINT `route_events_ibfk_1` FOREIGN KEY (`actionType`) REFERENCES `actions` (`actionType`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `route_events_ibfk_2` FOREIGN KEY (`eventID`) REFERENCES `events` (`eventID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `route_events` (`workflowID`, `stepID`, `actionType`, `eventID`) VALUES
(-1,	-2,	'approve',	'LeafSecure_Certified'),
(-2,	-5,	'approve',	'LeafSecure_DeveloperConsole'),
(-2,	-4,	'approve',	'LeafSecure_DeveloperConsole'),
(-2,	-5,	'approve',	'std_email_notify_completed'),
(-2,	-4,	'approve',	'std_email_notify_completed'),
(-1,	-2,	'approve',	'std_email_notify_completed'),
(-2,	-1,	'submit',	'std_email_notify_next_approver'),
(-1,	-3,	'approve',	'std_email_notify_next_approver'),
(-1,	-1,	'submit',	'std_email_notify_next_approver');

DROP TABLE IF EXISTS `service_chiefs`;
CREATE TABLE `service_chiefs` (
  `serviceID` smallint NOT NULL,
  `userID` varchar(50) NOT NULL,
  `backupID` varchar(50) NOT NULL DEFAULT '',
  `locallyManaged` tinyint(1) DEFAULT '0',
  `active` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`userID`,`serviceID`,`backupID`),
  KEY `serviceID` (`serviceID`),
  KEY `userID` (`userID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;


DROP TABLE IF EXISTS `services`;
CREATE TABLE `services` (
  `serviceID` smallint NOT NULL AUTO_INCREMENT,
  `service` varchar(100) NOT NULL,
  `abbreviatedService` varchar(25) NOT NULL,
  `groupID` mediumint DEFAULT NULL,
  PRIMARY KEY (`serviceID`),
  KEY `groupID` (`groupID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;


DROP TABLE IF EXISTS `sessions`;
CREATE TABLE `sessions` (
  `sessionKey` varchar(40) NOT NULL,
  `variableKey` varchar(40) NOT NULL DEFAULT '',
  `data` text NOT NULL,
  `lastModified` int unsigned NOT NULL,
  UNIQUE KEY `sessionKey` (`sessionKey`,`variableKey`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `settings`;
CREATE TABLE `settings` (
  `setting` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `data` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`setting`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

INSERT INTO `settings` (`setting`, `data`) VALUES
('adPath',	'{}'),
('dbversion',	'2025100200'),
('emailBCC',	'{}'),
('emailCC',	'{}'),
('heading',	'VA LEAF Privacy'),
('leafSecure',	'0'),
('national_linkedPrimary',	''),
('national_linkedSubordinateList',	''),
('orgchartImportTags',	'{\"0\":\"platform_privacy\"}'),
('requestLabel',	'Request'),
('sitemap_json',	'{\"buttons\":[]}'),
('siteType',	'standard'),
('subHeading',	'Office of Information &amp; Technology'),
('timeZone',	'America/New_York'),
('version',	'PUBLIC');

DROP TABLE IF EXISTS `short_links`;
CREATE TABLE `short_links` (
  `shortID` mediumint unsigned NOT NULL AUTO_INCREMENT,
  `type` varchar(20) NOT NULL,
  `hash` varchar(64) NOT NULL,
  `data` text NOT NULL,
  PRIMARY KEY (`shortID`),
  UNIQUE KEY `type_hash` (`type`,`hash`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

INSERT INTO `short_links` (`shortID`, `type`, `hash`, `data`) VALUES
(1,	'report',	'6f87561a1d39f4645c2a756bf0b0abf5ddf1374648f13ec12971dfff4f63297f',	'/?a=reports&v=3&query=N4IgLgpgTgtgziAXAbVASwCZJAYwIaQDmA9lAJ4CSAIiADQjEAO0Bp2AvHSDATgBbYAZqRgB9AKwBmSYPFdCBCNgCCAORoBfWuiyIQGCABsIkLPSYswbPZ3o8w/JAAZ6CyCvUgNAXXoArYjQAOwQUXxA4UjAkYC0QQhMqAjwkZBAARhBwwzQYNGjEdKdi%20hy8sAB5QUE4E2cNIA=&indicators=NobwRAlgdgJhDGBDALgewE4EkAiYBcYAjGADRhSIC2ApvmNiogAQCiANtTVMqWAM4YeeAAwBfALpA===&title=RGF0YSBFbGVtZW50cw%3D%3D'),
(2,	'report',	'161e9c3f4983a3b3c599bef0030bf900edfa9c3ed2450def0252a95d694c1a20',	'/?a=reports&v=3&query=N4IgLgpgTgtgziAXAbVASwCZJAYwIaQDmA9lAJ4CSAIiADQjEAO0Bp2AvHSDATgBbYAZqRgB9QQFYATAAYALF0IEI2AIIA5GgF9a6LIhAYIAGwiQs9JizBsDnejzD8kM%20kshrNILQF16AK2I0ADsEFD8QOFIwJGAdEEIzKgI8JGQQAGYuBQjjNBg0GMQARhky%20jyCsAB5QUE4MxctIA=&indicators=NobwRAlgdgJhDGBDALgewE4EkAiYBcYAzGADRhSIC2ApvmJjNVMhAGYTXqlgDOGy%20AAwBfEuGhwkaLLgIAWbhRp0AygHkASgDlufdALwiAukA===&title=U09STnM%3D'),
(3,	'report',	'd0cd3a52c9878e3b714275bbb0408e12b20407e78bc9df7d1ad830a09f3bc25f',	'/?a=reports&v=3&query=N4IgLgpgTgtgziAXAbVASwCZJAYwIaQDmA9lAJ4CSAIiADQjEAO0Bp2AvHSDATgBbYAZqRgB9QQFYATAAYALF0IEI2AIIA5GgF9a6LIhAYIAGwiQs9JizBsDnejzD8kM%2BkshrNILQF16AK2I0ADsEFD8QOFIwJGAdEEIzKgI8JGQQBXopBQjjNBg0GMQARhky%2BjyCsAB5QUE4MxctIA%3D&indicators=NobwRAlgdgJhDGBDALgewE4EkAiYBcYALGADRhSIC2ApvmAMoDyASgHKlgDOGy%2BADAF8S4aHCRosuAgCZiZCjTpM2AAgCqzADIdu6XnkEBdIA%3D%3D%3D&title=U09STnM%3D'),
(4,	'report',	'9e8b664977580e3acb2c05546dac12b1163ea803e74d99b457938229cfd629cc',	'/?a=reports&v=3&query=N4IgLgpgTgtgziAXAbVASwCZJAYwIaQDmA9lAJ4CSAIiADQjEAO0Bp2AvHSDATgBbYAZqRgB9AKwBmSYPFdCBCNgCCAORoBfWuiyJcikuWpcmLMGz2d6PMPyEjRsgEwAGACzzF2APIAlEFo62BgQADYQkFj0plCsUBxcNnaILvQKkCrqAQC69ABWxGgAdggouSBwpGBIwFoghBFUBHhIyCAAjFwe9E4AbFxOAOwg5aFoMGjViO0us%2FRjE2DegoJwEUguGkA%3D&indicators=NobwRAlgdgJhDGBDALgewE4EkAiYBcYAjGADRhSIC2ApvmNiogAQCiANtTVMqWAM4YeeQgF8S4aHCRosuAgBZeFGnQDKAeQBKAOV4D0QgExiJsBCgw46hgGxKqtApuoA3CNQDu1GEwbJaZPpCAMwmkGbSlnJghgDs9ioE2tQAHshMzm6evigB%2FIL48iIAukA'),
(5,	'report',	'873331dfa98b98a4a6d341b71168591f410fbab20edb56fc6d1dbb97422786e3',	'/?a=reports&v=3&query=N4IgLgpgTgtgziAXAbVASwCZJAYwIaQDmA9lAJ4CSAIiADQjEAO0Bp2AvHSDATgBbYAZqRgB9AKwBmSYPFdCBCNgCCAORoBfWuiyJcikuWpcmLMGz2d6PMPyEjRsgEwAGACzzF2APIAlEFo62BgQADYQkFj0plCsUBxcNnaILvQKkCrqAQC69ABWxGgAdggouSBwpGBIwFoghBFUBHhIyCAAjFwe9E4AbFxOAOwg5aFoMGjViO0us/RjE2DegoJwEUguGkA=&indicators=NobwRAlgdgJhDGBDALgewE4EkAiYBcYyEyANgKZgA0YUiAthQVWAM4bL4AMAvpeNHCRosuAgEZmtBvjDYUiAAQBRcgygdqbdBzxje/WAhQYcMgCyT6jMAGUA8gCUAcsy06ATPsiGhJ0WHcANktpAgcyADcIMgB3MhgFOWQKTXZ8AGYvASNhUwJ3AHYQ6ycyAA9kBXCo2MSUFNY0vDNuAF0gA&title=UHJpdmFjeSBSZXBvc2l0b3J5IFJldmlldyBEYXRlcw%3D%3D'),
(6,	'report',	'4f4f424234814edf361e7d69d239b059c327a93406d64abe9e73b84f8927d214',	'/?a=reports&v=3&query=N4IgLgpgTgtgziAXAbVASwCZJAYwIaQDmA9lAJ4CSAIiADQjEAO0Bp2AvHSDATgBbYAZqRgB9AKwBmSYPFdCBCNgCCAORoBfWuiyJcikuWpcmLMGz2d6PMPyEjRsgEwAGACzzF2APIAlEFo62BgQADYQkFj0plCsUBxcNnaILvQKkCrqAQC69ABWxGgAdggouSBwpGBIwFoghBFUBHhIyCAAjFwe9E4AbFxOAOwg5aFoMGjViO0us%2FRjE2DegoJwEUguGkA%3D&indicators=NobwRAlgdgJhDGBDALgewE4EkAiYBcYAjGADRhSIC2ApvmNiogAQCiANtTVMqWAM4YeeQgF8S4aHCRosuAgBZeFGnQDKAeQBKAOV4D0QgExiJsBCgw46hgGxKqtApuoA3CNQDu1GEwbJaZPpCAMwmkGbSlnJghgDs9ioE2tQAHshMzm6evigB%2FIL48iIAukA&title=UHJpdmFjeSBSZXBvc2l0b3J5IFJldmlldyBEYXRlcw%3D%3D');

DROP TABLE IF EXISTS `signatures`;
CREATE TABLE `signatures` (
  `signatureID` mediumint NOT NULL AUTO_INCREMENT,
  `signature` text NOT NULL,
  `recordID` mediumint unsigned NOT NULL,
  `stepID` smallint NOT NULL,
  `dependencyID` smallint NOT NULL,
  `message` longtext NOT NULL,
  `signerPublicKey` text NOT NULL,
  `userID` varchar(50) NOT NULL,
  `timestamp` int unsigned NOT NULL,
  PRIMARY KEY (`signatureID`),
  UNIQUE KEY `recordID_stepID_depID` (`recordID`,`stepID`,`dependencyID`),
  CONSTRAINT `fk_records_signatures_deletion` FOREIGN KEY (`recordID`) REFERENCES `records` (`recordID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;


DROP TABLE IF EXISTS `sites`;
CREATE TABLE `sites` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `launchpadID` mediumint unsigned NOT NULL,
  `site_type` varchar(8) NOT NULL,
  `site_path` varchar(250) NOT NULL,
  `site_uploads` varchar(250) DEFAULT NULL,
  `portal_database` varchar(250) DEFAULT NULL,
  `orgchart_path` varchar(250) DEFAULT NULL,
  `orgchart_database` varchar(250) DEFAULT NULL,
  `decommissionTimestamp` int DEFAULT '0',
  `isVAPO` varchar(8) NOT NULL DEFAULT 'true',
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `site_path` (`site_path`),
  KEY `site_type` (`site_type`),
  KEY `launchpadID` (`launchpadID`),
  KEY `isVAPO` (`isVAPO`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;


DROP TABLE IF EXISTS `step_dependencies`;
CREATE TABLE `step_dependencies` (
  `stepID` smallint NOT NULL,
  `dependencyID` smallint NOT NULL,
  UNIQUE KEY `stepID` (`stepID`,`dependencyID`),
  KEY `dependencyID` (`dependencyID`),
  CONSTRAINT `fk_step_dependencyID` FOREIGN KEY (`dependencyID`) REFERENCES `dependencies` (`dependencyID`),
  CONSTRAINT `step_dependencies_ibfk_3` FOREIGN KEY (`stepID`) REFERENCES `workflow_steps` (`stepID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

INSERT INTO `step_dependencies` (`stepID`, `dependencyID`) VALUES
(-4,	-1),
(-3,	-1),
(-2,	-1),
(1,	9),
(2,	9),
(3,	9);

DROP TABLE IF EXISTS `step_modules`;
CREATE TABLE `step_modules` (
  `stepID` smallint NOT NULL,
  `moduleName` varchar(50) NOT NULL,
  `moduleConfig` text NOT NULL,
  UNIQUE KEY `stepID_moduleName` (`stepID`,`moduleName`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

INSERT INTO `step_modules` (`stepID`, `moduleName`, `moduleConfig`) VALUES
(1,	'LEAF_workflow_indicator',	'{\"indicatorID\":10}'),
(2,	'LEAF_workflow_indicator',	'{\"indicatorID\":17}'),
(3,	'LEAF_workflow_indicator',	'{\"indicatorID\":16}');

DROP TABLE IF EXISTS `tags`;
CREATE TABLE `tags` (
  `recordID` mediumint unsigned NOT NULL,
  `tag` varchar(50) NOT NULL,
  `timestamp` int unsigned NOT NULL DEFAULT '0',
  `userID` varchar(50) NOT NULL,
  UNIQUE KEY `recordID` (`recordID`,`tag`),
  KEY `tag` (`tag`),
  CONSTRAINT `fk_records_tags_deletion` FOREIGN KEY (`recordID`) REFERENCES `records` (`recordID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;


DROP TABLE IF EXISTS `template_history_files`;
CREATE TABLE `template_history_files` (
  `file_id` int NOT NULL AUTO_INCREMENT,
  `file_parent_name` text,
  `file_name` text,
  `file_path` text,
  `file_size` mediumint DEFAULT NULL,
  `file_modify_by` text,
  `file_created` text,
  PRIMARY KEY (`file_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;


DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `userID` varchar(50) NOT NULL,
  `groupID` mediumint NOT NULL,
  `backupID` varchar(50) NOT NULL DEFAULT '',
  `primary_admin` tinyint(1) NOT NULL DEFAULT '0',
  `locallyManaged` tinyint(1) DEFAULT '0',
  `active` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`userID`,`groupID`,`backupID`),
  KEY `groupID` (`groupID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

INSERT INTO `users` (`userID`, `groupID`, `backupID`, `primary_admin`, `locallyManaged`, `active`) VALUES
('tester',	1,	'',	0,	0,	1);


DROP TABLE IF EXISTS `workflow_routes`;
CREATE TABLE `workflow_routes` (
  `workflowID` smallint NOT NULL,
  `stepID` smallint NOT NULL,
  `nextStepID` smallint NOT NULL,
  `actionType` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `displayConditional` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  UNIQUE KEY `workflowID` (`workflowID`,`stepID`,`actionType`),
  KEY `stepID` (`stepID`),
  KEY `actionType` (`actionType`),
  CONSTRAINT `workflow_routes_ibfk_1` FOREIGN KEY (`workflowID`) REFERENCES `workflows` (`workflowID`),
  CONSTRAINT `workflow_routes_ibfk_3` FOREIGN KEY (`actionType`) REFERENCES `actions` (`actionType`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `workflow_routes` (`workflowID`, `stepID`, `nextStepID`, `actionType`, `displayConditional`) VALUES
(-2,	-4,	0,	'approve',	''),
(-2,	-4,	0,	'sendback',	''),
(-1,	-3,	-2,	'approve',	''),
(-1,	-3,	0,	'sendback',	''),
(-1,	-2,	0,	'approve',	''),
(-1,	-2,	0,	'sendback',	''),
(1,	-1,	0,	'submit',	''),
(2,	1,	0,	'CloseRequest',	''),
(2,	1,	3,	'ProceedtoFinalReview',	''),
(2,	1,	0,	'sendback',	'{\"required\":false}'),
(2,	1,	2,	'SendtoPrivacyOfficer',	''),
(2,	2,	1,	'concur',	''),
(2,	2,	1,	'disapprove',	''),
(2,	3,	0,	'CloseRequest',	''),
(2,	3,	1,	'disapprove',	'');

DROP TABLE IF EXISTS `workflow_steps`;
CREATE TABLE `workflow_steps` (
  `workflowID` smallint NOT NULL,
  `stepID` smallint NOT NULL AUTO_INCREMENT,
  `stepTitle` varchar(64) NOT NULL,
  `stepBgColor` varchar(10) NOT NULL DEFAULT '#fffdcd',
  `stepFontColor` varchar(10) NOT NULL DEFAULT 'black',
  `stepBorder` varchar(20) NOT NULL DEFAULT '1px solid black',
  `jsSrc` varchar(128) NOT NULL,
  `posX` smallint DEFAULT NULL,
  `posY` smallint DEFAULT NULL,
  `indicatorID_for_assigned_empUID` smallint DEFAULT NULL,
  `indicatorID_for_assigned_groupID` smallint DEFAULT NULL,
  `requiresDigitalSignature` tinyint(1) DEFAULT NULL,
  `stepData` text,
  PRIMARY KEY (`stepID`),
  KEY `workflowID` (`workflowID`),
  CONSTRAINT `workflow_steps_ibfk_1` FOREIGN KEY (`workflowID`) REFERENCES `workflows` (`workflowID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

INSERT INTO `workflow_steps` (`workflowID`, `stepID`, `stepTitle`, `stepBgColor`, `stepFontColor`, `stepBorder`, `jsSrc`, `posX`, `posY`, `indicatorID_for_assigned_empUID`, `indicatorID_for_assigned_groupID`, `requiresDigitalSignature`, `stepData`) VALUES
(-2,	-4,	'Supervisory Review for LEAF Developer Console',	'#82b9fe',	'black',	'1px solid black',	'',	580,	146,	-6,	NULL,	NULL,	NULL),
(-1,	-3,	'Supervisory Review for LEAF-S Certification',	'#82b9fe',	'black',	'1px solid black',	'',	579,	146,	-4,	NULL,	NULL,	NULL),
(-1,	-2,	'Privacy Officer Review for LEAF-S Certification',	'#82b9fe',	'black',	'1px solid black',	'',	575,	331,	-1,	NULL,	NULL,	NULL),
(2,	1,	'Initial Review',	'#fffdcd',	'black',	'1px solid black',	'',	638,	136,	NULL,	NULL,	NULL,	NULL),
(2,	2,	'Privacy Officer Review',	'#fffdcd',	'black',	'1px solid black',	'',	1201,	127,	NULL,	NULL,	NULL,	NULL),
(2,	3,	'Final Review',	'#fffdcd',	'black',	'1px solid black',	'',	1224,	524,	NULL,	NULL,	NULL,	NULL);

DROP TABLE IF EXISTS `workflows`;
CREATE TABLE `workflows` (
  `workflowID` smallint NOT NULL AUTO_INCREMENT,
  `initialStepID` smallint NOT NULL DEFAULT '0',
  `description` varchar(64) NOT NULL,
  PRIMARY KEY (`workflowID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

INSERT INTO `workflows` (`workflowID`, `initialStepID`, `description`) VALUES
(-2,	-4,	'Leaf Developer Console'),
(-1,	-3,	'LEAF Secure Certification'),
(1,	0,	'General Status'),
(2,	1,	'Privacy Element Requests');
