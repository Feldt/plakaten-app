/** Default map center: Copenhagen, Denmark */
export const MAP_DEFAULTS = {
  latitude: 55.6761,
  longitude: 12.5683,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
} as const;

/** Denmark bounding box */
export const DENMARK_BOUNDS = {
  north: 57.752,
  south: 54.559,
  east: 15.197,
  west: 8.073,
} as const;

/** API configuration */
export const API = {
  pageSize: 20,
  maxRetries: 3,
  retryDelay: 1000,
  realTimeThrottleMs: 500,
} as const;

/** Task configuration */
export const TASK = {
  maxClaimsPerWorker: 5,
  claimExpirationHours: 24,
  photoRequiredForCompletion: true,
  minPhotoWidth: 800,
  minPhotoHeight: 600,
} as const;

/** Poster rules */
export const POSTER_RULES = {
  minHeightMeters: 2.3,
  maxDistanceBetweenMeters: 50,
  minDistanceFromIntersectionMeters: 10,
  removeDaysAfterElection: 7,
} as const;

/** Currency */
export const CURRENCY = {
  code: 'DKK',
  locale: 'da-DK',
} as const;

/** Timezone */
export const TIMEZONE = 'Europe/Copenhagen';
