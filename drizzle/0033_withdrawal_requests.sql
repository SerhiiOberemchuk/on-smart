CREATE TABLE `withdrawal_requests` (
	`id` varchar(36) NOT NULL,
	`order_id` varchar(36),
	`order_number` varchar(32) NOT NULL,
	`user_id` varchar(36),
	`nome` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`message` text,
	`status` enum('RECEIVED','PROCESSING','ACCEPTED','REJECTED') NOT NULL DEFAULT 'RECEIVED',
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `withdrawal_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `withdrawal_requests` ADD CONSTRAINT `withdrawal_requests_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `withdrawal_requests` ADD CONSTRAINT `withdrawal_requests_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `withdrawal_requests_order_number_idx` ON `withdrawal_requests` (`order_number`);--> statement-breakpoint
CREATE INDEX `withdrawal_requests_user_idx` ON `withdrawal_requests` (`user_id`);