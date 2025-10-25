/**
 * Fallback marketplace service for when database is empty or has issues
 */

export function getFallbackMarketplaceListings() {
  return {
    listings: [],
    stats: {
      totalListings: 0,
      totalCreditsAvailable: 0,
      totalMarketValue: 0,
    },
  }
}

export function getFallbackUserPortfolio() {
  return []
}




