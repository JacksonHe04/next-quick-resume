CREATE TABLE `resume_photos` (
	`resume_id` text PRIMARY KEY NOT NULL,
	`photo_data` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`resume_id`) REFERENCES `resumes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `resume_photos_resume_idx` ON `resume_photos` (`resume_id`);