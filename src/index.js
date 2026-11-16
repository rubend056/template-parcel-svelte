/**
 * Mounts the svelte app
 *
 * The only entry the page pulls in, so this is where the bundle starts: one
 * html, one script, and `src/App.svelte` owns what the page *is*.
 */

import App from "./App.svelte"

// Mount app
const app = new App({
	target: document.getElementById("app"),
	props: {}
})

export default app
