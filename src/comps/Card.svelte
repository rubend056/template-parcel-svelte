<!--
	The smallest useful shared component: a box with a heading and a slot.
	`export let title` is the public prop; the `<style>` is scoped to this
	component, so `.card` here cannot leak onto a page that uses `card` for
	something else.
-->
<script>
	export let title = ""
</script>

<section class="card">
	{#if title}
		<h3>{title}</h3>
	{/if}
	<slot />
</section>

<style>
	.card {
		border: 1px solid var(--border);
		border-radius: 0.4em;
		background: var(--background-alt);
		padding: 0.5em 1.25em 1em;
		margin-block: 1.5em;
	}

	.card h3 {
		margin-block: 0.5em 0.75em;
	}
</style>
