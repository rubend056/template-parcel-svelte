<script>
	import Card from "@comps/Card.svelte"
	import { title_case } from "@utils/format.js"
</script>

<Card title={title_case("about this template")}>
	<p>
		Parcel 2 does the bundling, svelte 4 draws the page, and <code>yarn test</code>
		runs plain <code>node --test</code> cells over the pure bits.
	</p>
	<p>
		<code>node lint_islands.js</code> is the other half: a build is the only
		thing that normally notices a moved file or a renamed export, and it is
		slower and later than it needs to be.
	</p>
</Card>
