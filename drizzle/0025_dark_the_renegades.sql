CREATE TABLE `bundle_meta` (
	`bundle_id` varchar(36) NOT NULL,
	`included_products` json NOT NULL DEFAULT ('[]'),
	`advantages` json NOT NULL DEFAULT ('[]'),
	CONSTRAINT `bundle_meta_bundle_id` PRIMARY KEY(`bundle_id`)
);
