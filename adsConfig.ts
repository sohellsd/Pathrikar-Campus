/**
 * Central Configuration for Google AdSense
 *
 * Publisher ID: ca-pub-9235566332265622
 * Note: Individual Ad Unit Slot IDs can be assigned below once created
 * in the Google AdSense dashboard. When undefined, standard responsive
 * ad behavior is used without inventing IDs.
 */

export const ADSENSE_CONFIG = {
  publisherId: 'ca-pub-9235566332265622',
  slots: {
    // Specific ad slot IDs can be configured here in the future
    betweenSections: undefined as string | undefined,
    belowFinalList: undefined as string | undefined,
    screenBottom: undefined as string | undefined
  }
} as const;
