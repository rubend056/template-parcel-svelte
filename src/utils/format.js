/**
 * Formatting helpers that every page ends up writing twice.
 *
 * Pure, dependency-free and DOM-free, which is the bar for `@utils/*` here:
 * a page, a component and a `node --test` cell import the same function, and
 * the cell is the one that says what it does.
 */

/** `1 thing`, `2 things` — a count and the noun that agrees with it. */
export function plural(n, one, many = `${one}s`) {
	return `${n} ${n === 1 ? one : many}`
}

/** `about us` → `About us`: a heading out of something written lowercase. */
export function title_case(text) {
	const s = String(text).trim()
	return s ? s[0].toUpperCase() + s.slice(1) : s
}
