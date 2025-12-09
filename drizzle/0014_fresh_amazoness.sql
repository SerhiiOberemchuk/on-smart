RENAME TABLE `product_documenti` TO `product_documents`;--> statement-breakpoint
ALTER TABLE `product_documents` ADD `documents` json NOT NULL;--> statement-breakpoint
ALTER TABLE `product_documents` DROP COLUMN `title`;--> statement-breakpoint
ALTER TABLE `product_documents` DROP COLUMN `link`;