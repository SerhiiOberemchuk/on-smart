CREATE TABLE `order_items` (
	`id` varchar(36) NOT NULL,
	`order_id` varchar(36) NOT NULL,
	`product_id` varchar(36),
	`quantity` int NOT NULL,
	`unit_price` decimal(10,2) NOT NULL,
	`title` varchar(255) NOT NULL,
	`brand_name` varchar(128),
	`category_name` varchar(128),
	`image_url` text,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL,
	CONSTRAINT `order_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36),
	`order_number` varchar(64) NOT NULL,
	`client_type` enum('privato','azienda') NOT NULL,
	`email` text NOT NULL,
	`numero_telefono` text NOT NULL,
	`nome` text,
	`cognome` text,
	`indirizzo` text,
	`numero_civico` text,
	`citta` text,
	`cap` text,
	`nazione` text,
	`provincia_regione` text,
	`codice_fiscale` text,
	`referente_contatto` text,
	`ragione_sociale` text,
	`partita_iva` text,
	`request_invoice` boolean NOT NULL DEFAULT false,
	`pec_azzienda` text,
	`codice_unico` text,
	`payment_order_id` text,
	`order_status` enum('PENDING_PAYMENT','PAID','FULFILLING','SHIPPED','READY_FOR_PICKUP','COMPLETED','CANCELED','REFUNDED') NOT NULL DEFAULT 'PENDING_PAYMENT',
	`tracking_number` text,
	`carrier` text,
	`delivery_adress` json,
	`shipped_at` timestamp(3),
	`delivered_at` timestamp(3),
	`same_as_billing` boolean NOT NULL DEFAULT true,
	`delivery_method` enum('CONSEGNA_CORRIERE','RITIRO_NEGOZIO') NOT NULL,
	`delivery_price` int NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_order_number_unique` UNIQUE(`order_number`),
	CONSTRAINT `orders_orderNumber_uq` UNIQUE(`order_number`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` varchar(36) NOT NULL,
	`order_id` varchar(36) NOT NULL,
	`order_number` varchar(64) NOT NULL,
	`provider` enum('paypal','sumup','klarna','bonifico') NOT NULL,
	`status` enum('CREATED','SUCCESS','PAYED','FAILED','CANCELED','PENDING_BONIFICO') NOT NULL DEFAULT 'CREATED',
	`currency` enum('EUR') NOT NULL DEFAULT 'EUR',
	`amount` decimal(10,2) NOT NULL,
	`provider_order_id` varchar(128),
	`notes` text,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`),
	CONSTRAINT `payments_provider_providerOrderId_uq` UNIQUE(`provider`,`provider_order_id`)
);
--> statement-breakpoint
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_orderId_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payments` ADD CONSTRAINT `payments_orderId_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `order_items_orderId_idx` ON `order_items` (`order_id`);--> statement-breakpoint
CREATE INDEX `order_items_productId_idx` ON `order_items` (`product_id`);--> statement-breakpoint
CREATE INDEX `order_items_brandName_idx` ON `order_items` (`brand_name`);--> statement-breakpoint
CREATE INDEX `orders_userId_idx` ON `orders` (`user_id`);--> statement-breakpoint
CREATE INDEX `payments_orderId_idx` ON `payments` (`order_id`);--> statement-breakpoint
CREATE INDEX `payments_providerOrderId_idx` ON `payments` (`provider_order_id`);