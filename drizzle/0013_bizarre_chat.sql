CREATE TABLE `product_descrizione` (
	`product_id` varchar(36) NOT NULL,
	`images` json NOT NULL DEFAULT ('[]'),
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `product_documenti` (
	`product_id` varchar(36) NOT NULL,
	`title` varchar(255) NOT NULL,
	`link` json NOT NULL DEFAULT ('[]')
);
--> statement-breakpoint
CREATE TABLE `product_specifiche` (
	`product_id` varchar(36) NOT NULL,
	`images` json NOT NULL DEFAULT ('[]'),
	`title` varchar(255) NOT NULL,
	`description` json NOT NULL DEFAULT ('[]')
);
--> statement-breakpoint
CREATE TABLE `product_valutazione` (
	`id` varchar(36) NOT NULL,
	`product_id` varchar(191) NOT NULL,
	`clientName` varchar(191) NOT NULL,
	`rating` int NOT NULL,
	`comment` text NOT NULL,
	`date` varchar(30) NOT NULL,
	CONSTRAINT `product_valutazione_id` PRIMARY KEY(`id`)
);
