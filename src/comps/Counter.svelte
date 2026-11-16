<!--
	A component over a store. `$count` is svelte's auto-subscribe to the store
	imported from `@stores/count.js`; the same store is driven by
	`src/stores/count.test.js` in node, with no component in sight.
-->
<script>
	import { count, doubled, step, reset } from "@stores/count.js"
</script>

<div class="counter">
	<button type="button" on:click={() => step(-1)} aria-label="one less">−</button>
	<strong>{$count}</strong>
	<button type="button" on:click={() => step(1)} aria-label="one more">+</button>
	<button type="button" on:click={reset}>reset</button>
	<span class="muted">{$doubled} doubled</span>
</div>

<style>
	.counter {
		display: flex;
		align-items: center;
		gap: 0.75em;
	}

	.counter button {
		margin: 0;
		/* the one property here a browser still likes a prefix on — see .postcssrc */
		user-select: none;
	}
</style>
