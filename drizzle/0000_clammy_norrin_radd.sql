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
CREATE TABLE `hashtag` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text(100) NOT NULL,
	`postCount` integer,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `hashtag_name_unique` ON `hashtag` (`name`);--> statement-breakpoint
CREATE INDEX `hashtag_name_idx` ON `hashtag` (`name`);--> statement-breakpoint
CREATE TABLE `post` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`content` text(1000) NOT NULL,
	`mediaUrls` text,
	`isRetweet` integer,
	`originalPostId` integer,
	`replyToId` integer,
	`quotePostId` integer,
	`likeCount` integer,
	`retweetCount` integer,
	`replyCount` integer,
	`viewCount` integer,
	`isSensitive` integer,
	`isPinned` integer,
	`createdById` text(255) NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer,
	FOREIGN KEY (`createdById`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `created_by_idx` ON `post` (`createdById`);--> statement-breakpoint
CREATE INDEX `content_idx` ON `post` (`content`);--> statement-breakpoint
CREATE INDEX `original_post_idx` ON `post` (`originalPostId`);--> statement-breakpoint
CREATE INDEX `reply_to_idx` ON `post` (`replyToId`);--> statement-breakpoint
CREATE INDEX `quote_post_idx` ON `post` (`quotePostId`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `post` (`createdAt`);--> statement-breakpoint
CREATE TABLE `post_bookmark` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`postId` integer NOT NULL,
	`userId` text(255) NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`postId`) REFERENCES `post`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `bookmark_post_idx` ON `post_bookmark` (`postId`);--> statement-breakpoint
CREATE INDEX `bookmark_user_idx` ON `post_bookmark` (`userId`);--> statement-breakpoint
CREATE INDEX `bookmark_unique` ON `post_bookmark` (`postId`,`userId`);--> statement-breakpoint
CREATE TABLE `post_hashtag` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`postId` integer NOT NULL,
	`hashtagId` integer NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`postId`) REFERENCES `post`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`hashtagId`) REFERENCES `hashtag`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `post_hashtag_post_idx` ON `post_hashtag` (`postId`);--> statement-breakpoint
CREATE INDEX `post_hashtag_hashtag_idx` ON `post_hashtag` (`hashtagId`);--> statement-breakpoint
CREATE INDEX `post_hashtag_unique` ON `post_hashtag` (`postId`,`hashtagId`);--> statement-breakpoint
CREATE TABLE `post_like` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`postId` integer NOT NULL,
	`userId` text(255) NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`postId`) REFERENCES `post`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `post_like_post_idx` ON `post_like` (`postId`);--> statement-breakpoint
CREATE INDEX `post_like_user_idx` ON `post_like` (`userId`);--> statement-breakpoint
CREATE INDEX `post_like_unique` ON `post_like` (`postId`,`userId`);--> statement-breakpoint
CREATE TABLE `post_retweet` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`originalPostId` integer NOT NULL,
	`retweetPostId` integer NOT NULL,
	`userId` text(255) NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`originalPostId`) REFERENCES `post`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`retweetPostId`) REFERENCES `post`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `retweet_original_idx` ON `post_retweet` (`originalPostId`);--> statement-breakpoint
CREATE INDEX `retweet_retweet_idx` ON `post_retweet` (`retweetPostId`);--> statement-breakpoint
CREATE INDEX `retweet_user_idx` ON `post_retweet` (`userId`);--> statement-breakpoint
CREATE INDEX `retweet_unique` ON `post_retweet` (`originalPostId`,`userId`);--> statement-breakpoint
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
