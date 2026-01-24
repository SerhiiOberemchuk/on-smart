ALTER TABLE `product_characteristics` MODIFY COLUMN `in_filter` tinyint NOT NULL;--> statement-breakpoint
ALTER TABLE `product_characteristics` MODIFY COLUMN `in_filter` tinyint NOT NULL DEFAULT 0;