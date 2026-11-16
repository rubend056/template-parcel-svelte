<!--
	A route is just a component. It gets the route params as props (none here),
	and it can use anything the rest of the tree exports — that is the point of
	`@comps`, `@stores` and `@utils`.
-->
<script>
	import Card from "@comps/Card.svelte"
	import Counter from "@comps/Counter.svelte"
	import { plural } from "@utils/format.js"

	const routes = ["/", "/about", "/thing/:id"]
</script>

<h2>Svelte !!!!</h2>

<p>
	One app, {plural(routes.length, "route")}, parcelled. The counter below is a
	svelte store in <code>src/stores/count.js</code>; the card is a shared
	component in <code>src/comps</code>.
</p>

<Card title="A shared component">
	<Counter />
</Card>

<p class="muted">
	Pick a route above — the links go through the router, so the page does not
	reload and a back button still works.
</p>
