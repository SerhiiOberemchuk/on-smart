CREATE TABLE `products` (
	`id` varchar(36) NOT NULL,
	`brand` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`category` varchar(255) NOT NULL,
	`price` decimal(10,2) NOT NULL,
	`old_price` decimal(10,2),
	`quantity` int NOT NULL DEFAULT 0,
	`rating` decimal(2,1) DEFAULT '0.0',
	`in_stock` int NOT NULL DEFAULT 0,
	`img_src` text NOT NULL,
	`images` json NOT NULL,
	`logo` text NOT NULL,
	`variants` json,
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
