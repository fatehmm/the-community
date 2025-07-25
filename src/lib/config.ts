// Real-time polling configuration
export const POLLING_CONFIG = {
  // How often to check for new posts (in milliseconds)
  POSTS_INTERVAL: 30000, // 30 seconds

  // How often to check for new comments (in milliseconds)
  COMMENTS_INTERVAL: 15000, // 15 seconds

  // How often to check for new likes/retweets (in milliseconds)
  INTERACTIONS_INTERVAL: 10000, // 10 seconds

  // Whether to enable background polling
  ENABLE_BACKGROUND_POLLING: true,

  // Whether to poll when tab becomes visible
  POLL_ON_VISIBILITY_CHANGE: true,

  // Whether to poll when window gains focus
  POLL_ON_FOCUS: true,
} as const;

// Cache configuration
export const CACHE_CONFIG = {
  // How long to consider data fresh (in milliseconds)
  STALE_TIME: 1000 * 60 * 5, // 5 minutes

  // How long to keep data in cache (in milliseconds)
  GC_TIME: 1000 * 60 * 10, // 10 minutes
} as const;
