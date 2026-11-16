/**
 * A store and the functions that change it — one place, three lines each.
 *
 * `svelte/store` is an ordinary module: nothing here touches the DOM, so
 * `count.test.js` drives the real store under `node --test` and the component
 * that draws it (`src/comps/Counter.svelte`) has nothing to decide.
 *
 * The rule this template keeps: a store is written to by named functions, not
 * by poking `.set()` from components. That is what makes the cells below the
 * same question the buttons ask.
 */
import { derived, writable } from "svelte/store"

export const count = writable(0)

/** `$count * 2`, recomputed by svelte when the count moves. */
export const doubled = derived(count, (n) => n * 2)

/** Move the count; the default is one step up. */
export const step = (by = 1) => count.update((n) => n + by)

/** Back to zero. */
export const reset = () => count.set(0)
