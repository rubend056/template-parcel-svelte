<script>
	import { Router, Route } from "../deps/routing";
	import Link from "../deps/routing/Link.svelte";
	import Books from "./Books.svelte";

	let name = "My Name";
</script>

<h1 class="main">
	Hello {name}!
</h1>

<input bind:value={name} />
<div id="normandy"><code>index.scss</code> is giving this element with id <code>normandy</code> the color yellow.</div>

<p>
	A router is optional but a common component of most webapps since you'll
	usually wanna let users navigate your page (by clicking on links).
</p>
<p>
	And this navigation to be saved on browser history (in case they copy/paste
	url, or simply reload the page) it really is a basic state of where the user
	has gone, and where they're at currently.
</p>
<p>
	The following library is unlike any other router on other frameworks. It's
	simple, the route without a path will be the default if no other matches.
</p>

<h2 style="text-align: center;">
	<!-- 
		This Link renders as a `<a href="..."></a>`
		but it intercepts the clicks so that the browser 
		doesn't reload the page and you stay within your app.
	-->
	<a href="/books/">Books</a>
</h2>

<hr />
<h3>Router 1</h3>
<Router>
	<Route>You're on the Default page</Route>
	<Route path="/books/">
		<h4>Book Index</h4>
		<Link to="/books/cenicienta">Cenicienta</Link>
	</Route>
	<Route path="books/:name" component={Books} />
</Router>
<hr />

<p>
	Because svelte places a premium on simplicy (yes I'm very opinonated, but not
	without reason I belive). You could read the code easily and modify it to do
	whatever you please.
</p>
<p>
	The same concept is extended with this library, which I modified to accept the
	token <code>:?</code> on parameters, making them optional. <br />
	Which just means that it'll match the route even when the parameter is empty, in
	this case, on location `/books/`
</p>
<p>Allowing you to do the following:</p>

<hr />
<h3>Router 2</h3>
<Router>
	<Route>You're on the Default page</Route>
	<Route path="books/:?name" component={Books} />
</Router>



<style>
	.main {
		position: relative;
	}
</style>
