/**
 * When true:
 * - Subscription/plan checks are bypassed (all FeatureGuard pages unlock).
 * - Route PermissionGuard always allows access (role/dept gates off).
 * - Sidebar shows every nav item for signed-in users.
 * - Mock subscription uses the enterprise plan (no HR free-tier employee cap messaging).
 * - Pricing page hides tier comparison (testing stub instead).
 *
 * Set to false before production or wire to import.meta.env when you split environments.
 */
export const TESTING_MODE_UNLOCK_ALL = true;
