CREATE TABLE `email_verification_codes` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`code_hash` text NOT NULL,
	`expires_at` integer NOT NULL,
	`attempt_count` integer DEFAULT 0 NOT NULL,
	`consumed_at` integer,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `email_codes_email_expires_idx` ON `email_verification_codes` (`email`,`expires_at`);--> statement-breakpoint
CREATE TABLE `password_reset_tokens` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`token_hash` text NOT NULL,
	`expires_at` integer NOT NULL,
	`consumed_at` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `password_reset_tokens_token_hash_unique` ON `password_reset_tokens` (`token_hash`);--> statement-breakpoint
CREATE INDEX `password_tokens_user_expires_idx` ON `password_reset_tokens` (`user_id`,`expires_at`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`token_hash` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`last_seen_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_token_hash_unique` ON `sessions` (`token_hash`);--> statement-breakpoint
CREATE INDEX `sessions_user_expires_idx` ON `sessions` (`user_id`,`expires_at`);--> statement-breakpoint
CREATE TABLE `batches` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`strategy_markdown` text,
	`start_date` integer,
	`end_date` integer,
	`archived_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `batches_user_archived_updated_idx` ON `batches` (`user_id`,`archived_at`,`updated_at`);--> statement-breakpoint
CREATE TABLE `user_preferences` (
	`user_id` text PRIMARY KEY NOT NULL,
	`current_batch_id` text,
	`timezone` text DEFAULT 'Asia/Singapore' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`current_batch_id`) REFERENCES `batches`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `official_companies` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`normalized_name` text NOT NULL,
	`logo_url` text,
	`website_url` text,
	`careers_url` text,
	`industry` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `official_companies_normalized_unique` ON `official_companies` (`normalized_name`);--> statement-breakpoint
CREATE INDEX `official_companies_active_name_idx` ON `official_companies` (`is_active`,`name`);--> statement-breakpoint
CREATE TABLE `official_positions` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`normalized_name` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `official_positions_normalized_unique` ON `official_positions` (`normalized_name`);--> statement-breakpoint
CREATE INDEX `official_positions_active_sort_idx` ON `official_positions` (`is_active`,`sort_order`);--> statement-breakpoint
CREATE TABLE `private_companies` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`normalized_name` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `private_companies_user_normalized_unique` ON `private_companies` (`user_id`,`normalized_name`);--> statement-breakpoint
CREATE TABLE `private_positions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`normalized_name` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `private_positions_user_normalized_unique` ON `private_positions` (`user_id`,`normalized_name`);--> statement-breakpoint
CREATE TABLE `stages` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `stages_code_unique` ON `stages` (`code`);--> statement-breakpoint
CREATE INDEX `stages_active_sort_idx` ON `stages` (`is_active`,`sort_order`);--> statement-breakpoint
CREATE TABLE `interviews` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`submission_id` text NOT NULL,
	`stage_id` text NOT NULL,
	`name` text NOT NULL,
	`scheduled_at` integer,
	`duration_minutes` integer,
	`meeting_url` text,
	`status` text NOT NULL,
	`review_markdown` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`submission_id`) REFERENCES `submissions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`stage_id`) REFERENCES `stages`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "interviews_status_check" CHECK("interviews"."status" IN ('pending_interview', 'pending_result', 'passed', 'failed')),
	CONSTRAINT "interviews_duration_positive" CHECK("interviews"."duration_minutes" IS NULL OR "interviews"."duration_minutes" > 0)
);
--> statement-breakpoint
CREATE INDEX `interviews_user_scheduled_idx` ON `interviews` (`user_id`,`scheduled_at`);--> statement-breakpoint
CREATE INDEX `interviews_submission_idx` ON `interviews` (`submission_id`);--> statement-breakpoint
CREATE TABLE `submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`client_mutation_id` text NOT NULL,
	`batch_id` text NOT NULL,
	`official_company_id` text,
	`private_company_id` text,
	`official_position_id` text,
	`private_position_id` text,
	`position_name` text NOT NULL,
	`jd_url` text,
	`location` text,
	`channel` text,
	`applied_at` integer NOT NULL,
	`notes_markdown` text,
	`status_source` text NOT NULL,
	`direct_status` text NOT NULL,
	`current_interview_id` text,
	`status_updated_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`batch_id`) REFERENCES `batches`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`official_company_id`) REFERENCES `official_companies`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`private_company_id`) REFERENCES `private_companies`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`official_position_id`) REFERENCES `official_positions`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`private_position_id`) REFERENCES `private_positions`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`current_interview_id`) REFERENCES `interviews`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "submissions_company_xor" CHECK(("submissions"."official_company_id" IS NULL) != ("submissions"."private_company_id" IS NULL)),
	CONSTRAINT "submissions_position_xor" CHECK(("submissions"."official_position_id" IS NULL) != ("submissions"."private_position_id" IS NULL)),
	CONSTRAINT "submissions_status_source_check" CHECK("submissions"."status_source" IN ('direct', 'interview')),
	CONSTRAINT "submissions_direct_status_check" CHECK("submissions"."direct_status" IN ('submitted', 'screening', 'resume_passed', 'resume_failed', 'offer', 'cancelled', 'closed', 'expired'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `submissions_user_mutation_unique` ON `submissions` (`user_id`,`client_mutation_id`);--> statement-breakpoint
CREATE INDEX `submissions_user_applied_idx` ON `submissions` (`user_id`,`applied_at`);--> statement-breakpoint
CREATE INDEX `submissions_user_batch_idx` ON `submissions` (`user_id`,`batch_id`);--> statement-breakpoint
CREATE TABLE `interview_questions` (
	`user_id` text NOT NULL,
	`interview_id` text NOT NULL,
	`question_id` text NOT NULL,
	`created_at` integer NOT NULL,
	PRIMARY KEY(`interview_id`, `question_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`interview_id`) REFERENCES `interviews`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `interview_questions_user_idx` ON `interview_questions` (`user_id`);--> statement-breakpoint
CREATE INDEX `interview_questions_question_idx` ON `interview_questions` (`question_id`);--> statement-breakpoint
CREATE TABLE `questions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`question_text` text NOT NULL,
	`answer_markdown` text DEFAULT '' NOT NULL,
	`category` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `questions_user_category_updated_idx` ON `questions` (`user_id`,`category`,`updated_at`);--> statement-breakpoint
CREATE TABLE `resumes` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`data_json` text NOT NULL,
	`display_config_json` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "resumes_positive_version" CHECK("resumes"."version" > 0)
);
--> statement-breakpoint
CREATE INDEX `resumes_user_updated_idx` ON `resumes` (`user_id`,`updated_at`);--> statement-breakpoint
ALTER TABLE `users` ADD `password_hash` text NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `name` text NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `email_verified_at` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `disabled_at` integer;