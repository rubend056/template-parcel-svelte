<!--
	`/thing/:id` — the router hands `id` over as a prop, as a string, always
	present for this route (the regexes in `deps/routing/utils.js` match
	mandatory segments only, `:id` vs `:id?`).
-->
<script>
	import Card from "@comps/Card.svelte"
	import { plural } from "@utils/format.js"

	export let id = "0"
</script>

<Card title={plural(Number(id), "thing")}>
	<p>
		This one is <code>/thing/{id}</code>: the same component answering two
		links, which is what a route param buys you.
	</p>
</Card>
