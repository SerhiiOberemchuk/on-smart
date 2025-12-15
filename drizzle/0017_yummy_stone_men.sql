CREATE TABLE `product_reviews` (
	`id` varchar(36) NOT NULL,
	`product_id` varchar(36) NOT NULL,
	`client_name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`rating` int NOT NULL,
	`comment` text NOT NULL,
	`is_approved` boolean DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `product_reviews_id` PRIMARY KEY(`id`)
);
