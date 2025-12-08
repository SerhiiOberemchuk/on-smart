ALTER TABLE `products` MODIFY COLUMN `price` decimal(10,2) NOT NULL;--> statement-breakpoint
ALTER TABLE `products` MODIFY COLUMN `old_price` decimal(10,2);