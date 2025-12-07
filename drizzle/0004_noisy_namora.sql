CREATE TABLE `filters` (
	`id` varchar(36) NOT NULL,
	`param` varchar(32) NOT NULL,
	`title` varchar(32) NOT NULL,
	`type` json NOT NULL,
	`options` json,
	`min` int,
	`max` int,
	CONSTRAINT `filters_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `products` RENAME COLUMN `brand` TO `brand_id`;--> statement-breakpoint
ALTER TABLE `products` RENAME COLUMN `category` TO `category_id`;--> statement-breakpoint
ALTER TABLE `products` RENAME COLUMN `description` TO `name_full`;--> statement-breakpoint
ALTER TABLE `products` RENAME COLUMN `logo` TO `brand_logo`;--> statement-breakpoint
ALTER TABLE `products` MODIFY COLUMN `id` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `products` MODIFY COLUMN `name_full` varchar(255);--> statement-breakpoint
ALTER TABLE `products` MODIFY COLUMN `in_stock` boolean NOT NULL DEFAULT true;--> statement-breakpoint
ALTER TABLE `products` MODIFY COLUMN `images` json NOT NULL;--> statement-breakpoint
ALTER TABLE `products` MODIFY COLUMN `brand_logo` text NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `slug` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `to_order` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `filters` json;--> statement-breakpoint
ALTER TABLE `products` ADD `has_variants` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `brands_products` ADD CONSTRAINT `brand_slug_unique` UNIQUE(`brand_slug`);--> statement-breakpoint
ALTER TABLE `categories_products` ADD CONSTRAINT `category_slug_unique` UNIQUE(`category_slug`);--> statement-breakpoint
ALTER TABLE `products` ADD CONSTRAINT `product_slug_unique` UNIQUE(`slug`);--> statement-breakpoint
CREATE INDEX `idx_category` ON `products` (`category_id`);--> statement-breakpoint
CREATE INDEX `idx_brand` ON `products` (`brand_id`);--> statement-breakpoint
ALTER TABLE `products` DROP COLUMN `quantity`;--> statement-breakpoint
ALTER TABLE `products` DROP COLUMN `img_src`;