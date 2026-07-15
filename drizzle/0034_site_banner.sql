CREATE TABLE `site_banner` (
	`id` varchar(36) NOT NULL,
	`message` text,
	`is_active` boolean NOT NULL DEFAULT false,
	`variant` enum('info','warning','success','promo') NOT NULL DEFAULT 'info',
	`link_url` varchar(500),
	`link_label` varchar(120),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `site_banner_id` PRIMARY KEY(`id`)
);
