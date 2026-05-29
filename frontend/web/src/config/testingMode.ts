/**
 * When true:
 * - Subscription/plan checks are bypassed (all FeatureGuard pages unlock).
 * - Route PermissionGuard always allows access (role/dept gates off).
 * - Sidebar shows every nav item for signed-in users.
 * - Mock subscription uses the enterprise plan (no HR free-tier employee cap messaging).
 * - Pricing page hides tier comparison (testing stub instead).
 *
 * Enable only in local dev: set VITE_TESTING_MODE=true in .env.local
 */
export const TESTING_MODE_UNLOCK_ALL = import.meta.env.VITE_TESTING_MODE === 'true';
