CREATE TABLE `brands_products` (
	`id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`title_full` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`image` varchar(1024) NOT NULL,
	`category_slug` varchar(255) NOT NULL,
	CONSTRAINT `brands_products_id` PRIMARY KEY(`id`)
);
