ALTER TABLE `bundle_meta` ADD `documents` json DEFAULT ('[]') NOT NULL;--> statement-breakpoint
ALTER TABLE `bundle_meta` ADD `reviews` json DEFAULT ('[]') NOT NULL;