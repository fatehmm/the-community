import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  sqliteTable,
  sqliteTableCreator,
  text,
} from "drizzle-orm/sqlite-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = sqliteTableCreator((name) => `${name}`);

export const post = createTable(
  "post",
  (d) => ({
    id: d.integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
    content: d.text({ length: 1000 }).notNull(), // Post content (like tweet text)
    mediaUrls: d.text(), // JSON array of media URLs (images, videos)
    isRetweet: d.integer({ mode: "boolean" }).$defaultFn(() => false), // Whether this is a retweet
    originalPostId: d.integer({ mode: "number" }), // Reference to original post if retweet
    replyToId: d.integer({ mode: "number" }), // Reference to parent post if reply
    quotePostId: d.integer({ mode: "number" }), // Reference to quoted post
    likeCount: d.integer({ mode: "number" }).$defaultFn(() => 0), // Number of likes
    retweetCount: d.integer({ mode: "number" }).$defaultFn(() => 0), // Number of retweets
    replyCount: d.integer({ mode: "number" }).$defaultFn(() => 0), // Number of replies
    viewCount: d.integer({ mode: "number" }).$defaultFn(() => 0), // Number of views
    isSensitive: d.integer({ mode: "boolean" }).$defaultFn(() => false), // Content warning flag
    isPinned: d.integer({ mode: "boolean" }).$defaultFn(() => false), // Whether post is pinned by user
    createdById: d
      .text({ length: 255 })
      .notNull()
      .references(() => user.id),
    createdAt: d
      .integer({ mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: d.integer({ mode: "timestamp" }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("created_by_idx").on(t.createdById),
    index("content_idx").on(t.content),
    index("original_post_idx").on(t.originalPostId),
    index("reply_to_idx").on(t.replyToId),
    index("quote_post_idx").on(t.quotePostId),
    index("created_at_idx").on(t.createdAt),
  ],
);

// Add relations
export const postRelations = relations(post, ({ one }) => ({
  createdBy: one(user, {
    fields: [post.createdById],
    references: [user.id],
  }),
}));

// Like table for tracking user likes on posts
export const postLike = createTable(
  "post_like",
  (d) => ({
    id: d.integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
    postId: d
      .integer({ mode: "number" })
      .notNull()
      .references(() => post.id, { onDelete: "cascade" }),
    userId: d
      .text({ length: 255 })
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: d
      .integer({ mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
  }),
  (t) => [
    index("post_like_post_idx").on(t.postId),
    index("post_like_user_idx").on(t.userId),
    index("post_like_unique").on(t.postId, t.userId),
  ],
);

// Retweet table for tracking user retweets
export const postRetweet = createTable(
  "post_retweet",
  (d) => ({
    id: d.integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
    originalPostId: d
      .integer({ mode: "number" })
      .notNull()
      .references(() => post.id, { onDelete: "cascade" }),
    retweetPostId: d
      .integer({ mode: "number" })
      .notNull()
      .references(() => post.id, { onDelete: "cascade" }),
    userId: d
      .text({ length: 255 })
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: d
      .integer({ mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
  }),
  (t) => [
    index("retweet_original_idx").on(t.originalPostId),
    index("retweet_retweet_idx").on(t.retweetPostId),
    index("retweet_user_idx").on(t.userId),
    index("retweet_unique").on(t.originalPostId, t.userId),
  ],
);

// Bookmark table for tracking user bookmarks
export const postBookmark = createTable(
  "post_bookmark",
  (d) => ({
    id: d.integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
    postId: d
      .integer({ mode: "number" })
      .notNull()
      .references(() => post.id, { onDelete: "cascade" }),
    userId: d
      .text({ length: 255 })
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: d
      .integer({ mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
  }),
  (t) => [
    index("bookmark_post_idx").on(t.postId),
    index("bookmark_user_idx").on(t.userId),
    index("bookmark_unique").on(t.postId, t.userId),
  ],
);

// Hashtag table for tracking hashtags
export const hashtag = createTable(
  "hashtag",
  (d) => ({
    id: d.integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
    name: d.text({ length: 100 }).notNull().unique(),
    postCount: d.integer({ mode: "number" }).$defaultFn(() => 0),
    createdAt: d
      .integer({ mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
  }),
  (t) => [index("hashtag_name_idx").on(t.name)],
);

// Post hashtag relationship table
export const postHashtag = createTable(
  "post_hashtag",
  (d) => ({
    id: d.integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
    postId: d
      .integer({ mode: "number" })
      .notNull()
      .references(() => post.id, { onDelete: "cascade" }),
    hashtagId: d
      .integer({ mode: "number" })
      .notNull()
      .references(() => hashtag.id, { onDelete: "cascade" }),
    createdAt: d
      .integer({ mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
  }),
  (t) => [
    index("post_hashtag_post_idx").on(t.postId),
    index("post_hashtag_hashtag_idx").on(t.hashtagId),
    index("post_hashtag_unique").on(t.postId, t.hashtagId),
  ],
);

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", {
    mode: "timestamp",
  }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", {
    mode: "timestamp",
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
});
