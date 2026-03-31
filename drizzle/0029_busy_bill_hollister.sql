ALTER TABLE `product_descrizione` ADD PRIMARY KEY(`product_id`);--> statement-breakpoint
ALTER TABLE `product_documents` ADD PRIMARY KEY(`product_id`);--> statement-breakpoint
ALTER TABLE `product_gallery` ADD PRIMARY KEY(`parent_product_id`);--> statement-breakpoint
ALTER TABLE `product_specifiche` ADD PRIMARY KEY(`product_id`);--> statement-breakpoint
ALTER TABLE `product_characteristic_product` ADD CONSTRAINT `uniq_product_characteristic` UNIQUE(`product_id`,`characteristic_id`);