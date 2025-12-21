CREATE TABLE `product_characteristics` (
	`id` varchar(36) NOT NULL,
	`category_id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`is_required` boolean NOT NULL DEFAULT false,
	`is_multiple` boolean NOT NULL DEFAULT false,
	`in_filter` boolean NOT NULL DEFAULT false,
	CONSTRAINT `product_characteristics_id` PRIMARY KEY(`id`),
	CONSTRAINT `product_characteristics_id_unique` UNIQUE(`id`)
);
--> statement-breakpoint
CREATE TABLE `product_characteristic_product` (
	`id` varchar(36) NOT NULL,
	`product_id` varchar(36) NOT NULL,
	`characteristic_id` varchar(36) NOT NULL,
	`characteristic_name` varchar(255) NOT NULL,
	`value_ids` json NOT NULL DEFAULT ('[]'),
	CONSTRAINT `product_characteristic_product_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `product_characteristic_values` (
	`id` varchar(36) NOT NULL,
	`characteristic_id` varchar(36) NOT NULL,
	`value` varchar(255) NOT NULL,
	CONSTRAINT `product_characteristic_values_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `products` ADD `category_id` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `brands_products` ADD CONSTRAINT `brands_products_brand_slug_unique` UNIQUE(`brand_slug`);--> statement-breakpoint
ALTER TABLE `categories_products` ADD CONSTRAINT `categories_products_category_slug_unique` UNIQUE(`category_slug`);--> statement-breakpoint
ALTER TABLE `products` ADD CONSTRAINT `products_slug_unique` UNIQUE(`slug`);--> statement-breakpoint
CREATE INDEX `idx_product` ON `product_characteristic_product` (`product_id`);--> statement-breakpoint
CREATE INDEX `idx_characteristic` ON `product_characteristic_product` (`characteristic_id`);