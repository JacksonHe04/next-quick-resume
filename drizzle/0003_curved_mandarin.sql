ALTER TABLE `users` ADD `inon_user_id` text;--> statement-breakpoint
CREATE UNIQUE INDEX `users_inon_user_id_unique` ON `users` (`inon_user_id`);