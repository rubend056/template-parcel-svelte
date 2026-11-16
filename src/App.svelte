<!--
	The whole app: a router with three routes.

	`Router` comes from the vendored `deps/routing` (aliased as `routing` in
	package.json) — it is svelte-routing, not ours, kept in the tree so a clone
	builds offline and the version cannot drift.

	Two rules the router makes and this file has to keep:
	  - `<Link>` reads the router out of svelte's context, so it only works
	    *inside* `<Router>` — that is why the nav lives here rather than in a
	    top-level header;
	  - `<Route path="/thing/:id">` hands `id` to the page as a prop
	    (`src/pages/Thing.svelte`), and a route with no path is the fallback.
-->
<script>
	import { Router, Route, Link } from "routing"

	import Home from "./pages/Home.svelte"
	import About from "./pages/About.svelte"
	import Thing from "./pages/Thing.svelte"
</script>

<Router>
	<nav>
		<Link to="/">home</Link>
		<Link to="/about">about</Link>
		<Link to="/thing/1">thing 1</Link>
		<Link to="/thing/2">thing 2</Link>
	</nav>

	<main>
		<Route path="/" component={Home} />
		<Route path="/about" component={About} />
		<Route path="/thing/:id" component={Thing} />
	</main>
</Router>

<style>
	nav {
		display: flex;
		flex-wrap: wrap;
		gap: 0 1.25em;
		margin-block: 0 1.5em;
	}

	/* The router sets aria-current="page" on the link you are on */
	nav :global(a[aria-current="page"]) {
		font-weight: bold;
		text-decoration: none;
	}

	main {
		max-width: 42rem;
	}
</style>
