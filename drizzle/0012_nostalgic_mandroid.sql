CREATE TABLE `product_gallery` (
	`parent_product_id` varchar(36) NOT NULL,
	`images` json NOT NULL DEFAULT ('[]')
);
