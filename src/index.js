/**
 * Mounts the svelte app
 */

import App from "./App.svelte"

// Mount app
const app = new App({
	target: document.getElementById("app"),
	props: {}
})
