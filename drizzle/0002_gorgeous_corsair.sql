CREATE TABLE `company_cities` (
	`company_id` text NOT NULL,
	`city_id` text NOT NULL,
	`created_at` integer NOT NULL,
	PRIMARY KEY(`company_id`, `city_id`),
	FOREIGN KEY (`company_id`) REFERENCES `official_companies`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`city_id`) REFERENCES `official_cities`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `company_cities_city_idx` ON `company_cities` (`city_id`);--> statement-breakpoint
CREATE TABLE `official_cities` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`normalized_name` text NOT NULL,
	`source_notion_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `official_cities_normalized_unique` ON `official_cities` (`normalized_name`);--> statement-breakpoint
CREATE UNIQUE INDEX `official_cities_source_notion_unique` ON `official_cities` (`source_notion_id`);--> statement-breakpoint
ALTER TABLE `official_companies` ADD `process_url` text;--> statement-breakpoint
ALTER TABLE `official_companies` ADD `priority` text;--> statement-breakpoint
ALTER TABLE `official_companies` ADD `source_notion_id` text;--> statement-breakpoint
CREATE UNIQUE INDEX `official_companies_source_notion_unique` ON `official_companies` (`source_notion_id`);
--> statement-breakpoint
INSERT INTO `official_companies` (
	`id`,
	`name`,
	`normalized_name`,
	`is_active`,
	`created_at`,
	`updated_at`
)
SELECT
	'promoted-' || `id`,
	`name`,
	`normalized_name`,
	1,
	`created_at`,
	`updated_at`
FROM `private_companies`
WHERE 1
ON CONFLICT (`normalized_name`) DO UPDATE SET
	`name` = excluded.`name`,
	`updated_at` = excluded.`updated_at`;
--> statement-breakpoint
UPDATE `submissions`
SET
	`official_company_id` = (
		SELECT `official_companies`.`id`
		FROM `private_companies`
		INNER JOIN `official_companies`
			ON `official_companies`.`normalized_name` = `private_companies`.`normalized_name`
		WHERE `private_companies`.`id` = `submissions`.`private_company_id`
	),
	`private_company_id` = NULL
WHERE `private_company_id` IS NOT NULL;
--> statement-breakpoint
DELETE FROM `private_companies`;
