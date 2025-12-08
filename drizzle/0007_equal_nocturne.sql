ALTER TABLE `products` RENAME COLUMN `brand_id` TO `brand_slug`;--> statement-breakpoint
ALTER TABLE `products` RENAME COLUMN `category_id` TO `category_slug`;--> statement-breakpoint
ALTER TABLE `products` RENAME COLUMN `images` TO `imgSrc`;--> statement-breakpoint
DROP INDEX `idx_category` ON `products`;--> statement-breakpoint
DROP INDEX `idx_brand` ON `products`;--> statement-breakpoint
ALTER TABLE `products` MODIFY COLUMN `name_full` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `products` MODIFY COLUMN `rating` decimal(2,1) DEFAULT '5.0';--> statement-breakpoint
CREATE INDEX `slug_category` ON `products` (`category_slug`);--> statement-breakpoint
CREATE INDEX `slug_brand` ON `products` (`brand_slug`);--> statement-breakpoint
ALTER TABLE `products` DROP COLUMN `brand_logo`;--> statement-breakpoint
ALTER TABLE `products` DROP COLUMN `filters`;