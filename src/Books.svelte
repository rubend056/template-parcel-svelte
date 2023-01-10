<script>
	export let name;
</script>

{#if name}
This is book: {name}
{:else}
This book <b>name</b> evaluates to <b>false</b>. Yeah, empty strings in javascript evaluate to false
{/if}

