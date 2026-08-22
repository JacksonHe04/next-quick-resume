ALTER TABLE `resumes` ADD `guest_device_id` text;--> statement-breakpoint
CREATE INDEX `resumes_guest_device_idx` ON `resumes` (`user_id`,`guest_device_id`,`updated_at`);