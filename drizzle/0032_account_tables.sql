CREATE TABLE `customer_profiles` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`numero_telefono` varchar(32),
	`client_type` enum('privato','azienda') NOT NULL DEFAULT 'privato',
	`nome` varchar(128),
	`cognome` varchar(128),
	`codice_fiscale` varchar(32),
	`referente_contatto` varchar(128),
	`ragione_sociale` varchar(255),
	`partita_iva` varchar(16),
	`pec_azzienda` varchar(255),
	`codice_unico` varchar(16),
	`default_payment_method` enum('paypal','sumup','klarna','bonifico'),
	`default_delivery_method` enum('CONSEGNA_CORRIERE','RITIRO_NEGOZIO') NOT NULL DEFAULT 'CONSEGNA_CORRIERE',
	`request_invoice_default` boolean NOT NULL DEFAULT false,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `customer_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `customer_profiles_userId_uq` UNIQUE(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `user_addresses` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`label` varchar(64),
	`nome` varchar(128),
	`cognome` varchar(128),
	`numero_telefono` varchar(32),
	`indirizzo` varchar(255) NOT NULL,
	`numero_civico` varchar(16) NOT NULL,
	`citta` varchar(128) NOT NULL,
	`cap` varchar(10) NOT NULL,
	`provincia_regione` varchar(128) NOT NULL,
	`nazione` varchar(2) NOT NULL DEFAULT 'IT',
	`is_default_shipping` boolean NOT NULL DEFAULT false,
	`is_default_billing` boolean NOT NULL DEFAULT false,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `user_addresses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wishlist_items` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`product_id` varchar(36) NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `wishlist_items_id` PRIMARY KEY(`id`),
	CONSTRAINT `wishlist_user_product_uq` UNIQUE(`user_id`,`product_id`)
);
--> statement-breakpoint
ALTER TABLE `customer_profiles` ADD CONSTRAINT `customer_profiles_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_addresses` ADD CONSTRAINT `user_addresses_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `wishlist_items` ADD CONSTRAINT `wishlist_items_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `wishlist_items` ADD CONSTRAINT `wishlist_items_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `user_addresses_userId_idx` ON `user_addresses` (`user_id`);--> statement-breakpoint
CREATE INDEX `wishlist_items_userId_idx` ON `wishlist_items` (`user_id`);--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE set null ON UPDATE no action;