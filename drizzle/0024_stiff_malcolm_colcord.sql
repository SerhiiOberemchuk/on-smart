ALTER TABLE `products` ADD `ean` varchar(14) DEFAULT '123456789012' NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `length_cm` decimal(8,2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `width_cm` decimal(8,2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `height_cm` decimal(8,2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `weight_kg` decimal(8,3) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `product_type` enum('product','bundle') DEFAULT 'product' NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `bundle_product_ids` json;--> statement-breakpoint
ALTER TABLE `products` ADD `bundle_ids` json;--> statement-breakpoint
CREATE INDEX `product_type_idx` ON `products` (`product_type`);