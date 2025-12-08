ALTER TABLE `products` MODIFY COLUMN `in_stock` int NOT NULL;--> statement-breakpoint
ALTER TABLE `products` DROP COLUMN `max_qnt_order`;