/**
 * Microsites hidden from the site while they have an open bug.
 *
 * The quality-issue-loop adds a slug here the moment a bug is filed against
 * a microsite (hide-first rule: a broken site must not be visible), and
 * removes it when the fix ships. Filtering happens at module load, so a
 * hidden microsite disappears from the home grid and its page stops being
 * generated (direct URLs 404).
 */
export const HIDDEN_MICROSITES: string[] = [];

/**
 * Filters a microsite list down to the ones that are not hidden.
 *
 * @param microsites - the full microsite config list
 * @returns the microsites whose slug is not in `HIDDEN_MICROSITES`
 */
export function withHiddenMicrositesRemoved<T extends { slug: string }>(microsites: T[]): T[] {
  return microsites.filter((microsite) => !HIDDEN_MICROSITES.includes(microsite.slug));
}
