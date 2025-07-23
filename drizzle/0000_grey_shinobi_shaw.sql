CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `paper-directory_paper` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`courseName` text(256) NOT NULL,
	`courseCode` text(50) NOT NULL,
	`professorName` text(256) NOT NULL,
	`semester` text(50) NOT NULL,
	`department` text(100) NOT NULL,
	`paperType` text(20) NOT NULL,
	`paperPdfUrl` text(500) NOT NULL,
	`createdById` text(255) NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer,
	FOREIGN KEY (`createdById`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `paper_created_by_idx` ON `paper-directory_paper` (`createdById`);--> statement-breakpoint
CREATE INDEX `paper_course_name_idx` ON `paper-directory_paper` (`courseName`);--> statement-breakpoint
CREATE INDEX `paper_course_code_idx` ON `paper-directory_paper` (`courseCode`);--> statement-breakpoint
CREATE INDEX `paper_department_idx` ON `paper-directory_paper` (`department`);--> statement-breakpoint
CREATE INDEX `paper_semester_idx` ON `paper-directory_paper` (`semester`);--> statement-breakpoint
CREATE INDEX `paper_type_idx` ON `paper-directory_paper` (`paperType`);--> statement-breakpoint
CREATE TABLE `paper-directory_post` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text(256),
	`createdById` text(255) NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer,
	FOREIGN KEY (`createdById`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `created_by_idx` ON `paper-directory_post` (`createdById`);--> statement-breakpoint
CREATE INDEX `name_idx` ON `paper-directory_post` (`name`);--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer NOT NULL,
	`image` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
