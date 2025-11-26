ALTER TABLE `products` MODIFY COLUMN `id` serial AUTO_INCREMENT NOT NULL;--> statement-breakpoint
ALTER TABLE `products` MODIFY COLUMN `price` int NOT NULL;--> statement-breakpoint
ALTER TABLE `products` MODIFY COLUMN `old_price` int;--> statement-breakpoint
ALTER TABLE `products` MODIFY COLUMN `quantity` int;--> statement-breakpoint
ALTER TABLE `products` MODIFY COLUMN `images` json;--> statement-breakpoint
ALTER TABLE `products` MODIFY COLUMN `logo` text;