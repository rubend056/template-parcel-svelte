# template-parcel-svelte

A starter for one app: **parcel 2.16** bundles it, **svelte 4** draws it,
**water.css** styles the bare tags, and a vendored router gives it a few
"pages" without a page load. No framework beyond that, no linter, no test
framework — the pure bits are checked with `node --test` and one file of lint.

Everything here is known to build: each dependency below is one the sibling
project (`talebox/web`) actually bundles with, not a wish list.

## Run it

```bash
yarn install
yarn start          # dev server on :41900
yarn test           # node --test cells + the link lint
yarn build          # dist/, minified, no source maps
```

To start your own project from it: `rm -rf .git && git init`, then rename
`name` in `package.json` and replace `src/`.

`:41900` is deliberate — this box has other services on 4000-4008 and 8000, so
the dev server takes a port nobody argues about. Change it in `scripts.start`.

## Layout

```
package.json          source, scripts, alias block, browserslist
.parcelrc             the svelte 4 transformer (+ raw:*)
.postcssrc            autoprefixer over every css/sass asset
.terserrc             minifier options (see "traps" below)
lint_islands.js       the link lint: imports resolve, and name what they import
lint_islands.test.js  its cells, including "the real src/ is clean"
src/
  index.html          the only entry (`source` in package.json)
  index.js            mounts the app
  App.svelte          the router and its three routes
  pages/              one component per route
  comps/              shared components (Card, Counter)
  stores/             svelte stores + their `node --test` cells
  utils/              pure functions + their cells
  optics/styles/      water.css (kognise) and index.scss (ours)
deps/routing/         the vendored router (svelte-routing), untouched
```

`deps/` is vendored third-party code, kept in the tree so a clone builds
offline and the version cannot drift. It stays out of `src/` on purpose: what
is ours and what is borrowed should not be one `ls` away from each other, and
the lint says so (it checks `src/`, and only resolves *into* `deps/`).

## Adding a page

1. `src/pages/Name.svelte`.
2. A route in `src/App.svelte`: `<Route path="/name" component={Name} />`.
3. A link in the same file's `<nav>`: `<Link to="/name">name</Link>`.
4. `yarn test` (or `node lint_islands.js`) — a typo'd path or a name the target
   does not export fails there, before the bundle does.

Both the `<Route>` and the `<Link>` have to be **inside** `<Router>`: `Link`
reads the router out of svelte's context and throws outside it. A route with no
`path` is the fallback for anything that matches nothing.

## The dependencies, and what each one earns

- **`parcel`** ^2.16.4 — the bundler. Zero configuration beyond the three dotfiles.
- **`parcel-transformer-svelte-v4`** ^1.2.3 — compiles `.svelte` for parcel 2.
  It replaces `@plasmohq/parcel-transformer-svelte`, which wanted svelte 3
  runtime too; this is the one the sibling project builds with.
- **`svelte`** ^4.2.20 — the runtime. **Svelte 4, not 5**: the transformer above
  emits that API (see "traps" for the compiler/runtime split).
- **`@parcel/transformer-sass`** ^2.16.4 — `@parcel/config-default` already asks
  for it; listed explicitly so the lockfile pins one sass pipeline.
- **`autoprefixer`** ^10.4 + **`postcss`** ^8 — `.postcssrc` hands every css and
  sass asset through autoprefixer, which prefixes against the `browserslist` in
  `package.json` (`user-select` in `src/comps/Counter.svelte` is the one the
  template still gets a `-webkit-` for). PostCSS itself has to be a dependency:
  `@parcel/transformer-postcss` loads it from the project as soon as a
  `.postcssrc` exists, and autoprefixer declares it as a peer, not a dependency.

Deliberately **not** here, each of which the sibling project carries for a
reason this template does not have: `@parcel/compressor-gzip`/`-brotli` (nothing
in a static build negotiates encodings), `@parcel/transformer-inline-string` /
`-webmanifest` / `@parcel/packager-raw-url` / `@parcel/optimizer-data-url` (no
`bundle-text:`, no manifest, no icon set, no inlined image), `sharp` (no image
target to resize), `parcel-resolver-ignore` (nothing to keep out of the graph —
the router in `deps/` is imported, not ignored), and any lint/test framework.

## Traps worth knowing

- **The transformer compiles with svelte 3.** `parcel-transformer-svelte-v4`
  declares `svelte ^3.44` as a *dependency* (and `^3` as its peer), so yarn
  installs svelte 3.59 next to it and that is the compiler; the `svelte` ^4 in
  this package is the *runtime* the compiled code imports. That pairing is what
  the sibling project builds and runs with — the yarn warning
  (`incorrect peer dependency "svelte@^3.0.0"`) is expected, and "fixing" it by
  pinning svelte 3 is a downgrade, not a fix.
- **`.terserrc` is not read by parcel 2.16.** Parcel minifies JS with
  `@parcel/optimizer-swc` by default (`@parcel/config-default`'s `optimizers`);
  `.terserrc` is the config for `@parcel/optimizer-terser`. The file is kept
  because it is where those options belong the day you swap the optimizer in,
  and until then it changes nothing.
- **`npm:` in front of an alias.** `href="npm:@styles/water.css"` in
  `src/index.html` means "resolve this specifier, do not treat it as a relative
  path". Without the prefix parcel sees a bare `@styles/...` and it still works
  for the aliases here, but the sibling project has hit files that stopped
  resolving when the prefix was dropped — so the template keeps it everywhere.
- **`raw:*`** in `.parcelrc` is the escape hatch for pulling a file in as text:
  `import text from "raw:./thing.txt"`. Nothing in `src/` needs it today.
- **Deep links.** The dev server answers any path with `index.html`, so
  `/thing/2` works while `yarn start` runs. A static host has to be told the
  same thing (serve `index.html` for unknown paths), or a reload on
  `/about` is a 404.
- **The build warns**, once per component that carries a `<style>` block:
  *"@parcel/optimizer-css: CSS modules cannot be tree shaken when imported with
  a default specifier"*. It points at `import App from "./App.svelte"`, which is
  the only way to import a svelte component; there is no config flag for it in
  parcel 2.16, and the sibling project lives with the same warning. Harmless.

## The link lint

`lint_islands.js` is one file, no dependencies, and it is a gate: it exits 1 on
a finding. It exists because `node --test` never resolves the module graph — a
moved file or a renamed export leaves every cell green and only `parcel build`
says no, which is later and slower than it needs to be. It reads the `alias`
block out of `package.json` (so a new alias is honoured without teaching the
lint about it) and checks two things under `src/`:

- every import specifier that is ours (relative, or aliased) lands on a file;
- every *named* import finds that name in a `.js` target's exports.

It skips what text cannot judge, and a skip is never a false failure:
`export * from`, destructured `export const { … } = …`, `.svelte` targets, bare
specifiers (node_modules), and the vendored router. `src/**/*.test.js` is not
walked, and comments are blanked first so a specifier quoted in prose is not a
finding.

`yarn test` runs its cells beside the suite, and one of them asserts the real
`src/` is clean — so a broken import fails `yarn test` even if you never run the
file by hand.
