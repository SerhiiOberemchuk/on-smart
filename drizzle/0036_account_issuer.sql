ALTER TABLE `account` ADD `issuer` varchar(255) NOT NULL DEFAULT '';--> statement-breakpoint
UPDATE `account` SET `issuer` = CASE WHEN `provider_id` = 'credential' THEN 'local:credential' ELSE CONCAT('local:oauth:', `provider_id`) END WHERE `issuer` = '';--> statement-breakpoint
ALTER TABLE `account` ALTER `issuer` DROP DEFAULT;
