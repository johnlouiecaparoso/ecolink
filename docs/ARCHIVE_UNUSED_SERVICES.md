# Files to Archive/Remove

## Unused Duplicate Services (Safe to Archive)

These files appear to be duplicates or test/debug versions that are not actively used:

1. `src/services/authServiceSimple.js` - Mock auth service (NOT imported anywhere)
2. `src/services/simpleMarketplaceService.js` - Simple version (may be used)
3. `src/services/debugMarketplaceService.js` - Debug version (NOT imported anywhere)
4. `src/services/sampleDataService.js` - Sample data creator (only for dev/testing)

## Recommendation

- **authServiceSimple.js**: ✅ SAFE TO DELETE (not imported)
- **debugMarketplaceService.js**: ✅ SAFE TO DELETE (not imported)
- **simpleMarketplaceService.js**: ⚠️ CHECK FIRST (may be used)
- **sampleDataService.js**: ✅ KEEP (but ensure it's dev-only)

## Debug Utilities (Dev Only)

These should remain but be documented as dev-only:

- `src/utils/debugAdminQueries.js`
- `src/utils/debugPermissions.js`
- `src/utils/diagnoseAdminDashboard.js`
- `public/debug-auth.js`

## Action

I recommend archiving these to a `src/services/_archive/` folder rather than deleting, in case they're needed for reference.

