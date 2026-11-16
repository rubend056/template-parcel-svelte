/**
 * The link lint — **a gate, not a printout**: every import under `src/` has to
 * land on a file, and every *named* import has to name something that file
 * exports.
 *
 * The name is borrowed from the sibling project this template comes from,
 * where every app was an "island" swapped into a shell and the same gate asked
 * the same question. Here there is one island — `src/` — and the question did
 * not change:
 *
 *   `node --test` never resolves the module graph. A moved file or a renamed
 *   export leaves every cell green and the build red, which is later and
 *   slower than it needs to be.
 *
 * Two passes over the same walk:
 *
 *   - `unresolved_imports` — the specifier. Relative ones and the aliases from
 *     `package.json` (`@comps/*`, `@utils/*`, … `routing`) are both resolved.
 *     Anything else is a bare specifier (`svelte/store`) and belongs to
 *     node_modules: left to the bundler, which does it properly.
 *   - `missing_exports` — the names. Only a specifier that resolves to a `.js`
 *     file *inside `src/`* is checked: that is the case where a text linter can
 *     be certain. A `.svelte` target exports a component shape and the vendored
 *     router in `deps/` is not ours to police.
 *
 * Textual and best-effort, so **a blind spot is a skip, never a false error**:
 * `export * from` and `export const { a } = …` answer "cannot tell" and are
 * left alone (see `exports_of`). Comments are blanked first, so a specifier
 * quoted in prose is not a finding.
 *
 * One file, no dependencies, and it exits 1 the moment a finding exists —
 * `yarn test` runs the cell beside it, so breaking an import fails the suite
 * here even if you forget to run this by hand.
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, posix, resolve } from "node:path"

const ROOT = new URL("./", import.meta.url)

/** The tree this gate owns. One app, one directory. */
export const TREE = "src/"

/**
 * The alias block from `package.json`, longest key first — read, never
 * restated, so an alias added there is honoured here the moment it is written.
 * A key ending in `*` is a prefix (`@comps/*` → `src/comps/`); any other key is
 * an exact specifier (`routing` → `deps/routing`).
 */
export const ALIASES = (() => {
	const pkg = JSON.parse(readFileSync(new URL("package.json", ROOT), "utf8"))
	return Object.entries(pkg.alias ?? {})
		.map(([from, to]) => ({ from, to: to.replace(/^\.?\//, "") }))
		.sort((a, b) => b.from.length - a.from.length)
})()

/**
 * Where `spec`, written in `from_path`, points — project-relative — or `null`
 * when it is not one of ours (a bare specifier: node_modules).
 */
export function ours(from_path, spec) {
	const clean = spec.split(/[?#]/)[0]
	if (!clean) return null
	if (clean.startsWith(".")) return posix.normalize(posix.join(posix.dirname(from_path), clean))
	for (const { from, to } of ALIASES) {
		if (from.endsWith("/*")) {
			const prefix = from.slice(0, -1)
			if (!clean.startsWith(prefix)) continue
			const rest = clean.slice(prefix.length)
			return (to.includes("$1") ? to.replace("$1", rest) : to + rest).replace(/^\/+/, "")
		}
		if (clean === from) return to
	}
	return null
}

/** Comments blanked to the newlines they held, so lines still count. */
export function strip_comments(src) {
	const blank = (m) => m.replace(/[^\n]/g, "")
	return src
		.replace(/<!--[\s\S]*?-->/g, blank)
		.replace(/\/\*[\s\S]*?\*\//g, blank)
		.replace(/^[ \t]*\/\/[^\n]*/gm, blank)
}

/** `import x from "y"`, `import("y")`, `import "y"` — anything with a specifier. */
const SPECIFIER = /(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)["']([^"']+)["']/g

// `import { a, b as c } from "…"`, an optional default binding before the braces
const NAMED = /\bimport\s+(?!type\b)[^;{}'"]*?\{([^}]*)\}\s*from\s*["']([^"']+)["']/g
const NAME = String.raw`[A-Za-z_$][\w$]*`
// A part of `{ a, b as c, type T }` — what it asks the target to *export*
const PART = new RegExp(String.raw`^(?:(${NAME})\s+as\s+)?(${NAME})$`)

/** Extensions a bundler would try, in the order it tries them. */
const EXTENSIONS = ["", ".js", ".svelte", "/index.js"]

const line_at = (src, i) => src.slice(0, i).split("\n").length

/**
 * Every source under `src/` that a bundle could hold, as `[path, text]` pairs
 * with project-relative paths (`src/utils/format.js`). The cells are text, not
 * build output, and `*.test.js` never reaches a page.
 */
function* sources(dir = new URL(TREE, ROOT), rel = TREE) {
	for (const e of readdirSync(dir, { withFileTypes: true })) {
		const path = `${rel}${e.name}`
		if (e.isDirectory()) yield* sources(new URL(`${e.name}/`, dir), `${path}/`)
		else if (/\.(svelte|js)$/.test(e.name) && !e.name.endsWith(".test.js"))
			yield [path, readFileSync(new URL(e.name, dir), "utf8")]
	}
}

/**
 * The pair of readers both passes use. `files` is a `{ "src/…": source }` map
 * for a test fixture; absent, they read the real tree. The fixture is what lets
 * the cells below check a *deliberate* break without breaking the repo.
 */
function readers(files) {
	const map = files ? new Map(Object.entries(files)) : null
	const source = (rel) => (map ? (map.get(rel) ?? null) : disk_source(rel))
	const is_file = (rel) => EXTENSIONS.some((ext) => source(rel + ext) != null)
	return { source, is_file }
}

function disk_source(rel) {
	const path = fileURLToPath(new URL(rel, ROOT))
	// `existsSync` is happy with a directory; a directory is not a module, and
	// `routing` legitimately names one (`deps/routing`) — the bundler finds its
	// `index.js`, so the extension pass below has to be the one that says so.
	return existsSync(path) && statSync(path).isFile() ? readFileSync(path, "utf8") : null
}

/**
 * **The paths.** Every import whose specifier is ours has to land on a file a
 * bundler would find — `""` (as written), `.js`, `.svelte` or `/index.js`.
 * `[]` is clean.
 */
export function unresolved_imports(files = null) {
	const { is_file } = readers(files)
	const findings = []
	for (const [path, raw] of files ? Object.entries(files) : sources()) {
		const src = strip_comments(raw)
		for (const m of src.matchAll(SPECIFIER)) {
			const rel = ours(path, m[1])
			if (rel == null || is_file(rel)) continue
			findings.push(
				`${path}:${line_at(src, m.index)}: cannot resolve "${m[1]}" — nothing at ${rel}`
			)
		}
	}
	return findings
}

/**
 * **The names, not just the paths.** `import { x } from "./y.js"` also has to
 * find `x` in what `y.js` exports, because a deleted export is the same class
 * of break as a deleted file. `files` is the fixture map described above; `[]`
 * is clean.
 */
export function missing_exports(files = null) {
	const { source } = readers(files)
	const findings = []
	const cache = new Map()
	/** A target's exported names, memoised; `null` is "cannot tell" */
	const exports_at = (rel) => {
		if (cache.has(rel)) return cache.get(rel)
		let names = null
		for (const candidate of [rel, `${rel}.js`, `${rel}/index.js`]) {
			if (!candidate.endsWith(".js")) continue
			const text = source(candidate)
			if (text == null) continue
			names = exports_of(text)
			break
		}
		cache.set(rel, names)
		return names
	}

	for (const [path, raw] of files ? Object.entries(files) : sources()) {
		const src = strip_comments(raw)
		for (const m of src.matchAll(NAMED)) {
			const rel = ours(path, m[2])
			// Not ours (node_modules), or a shape a text linter cannot read:
			// a `.svelte` component, the vendored router in `deps/`.
			if (rel == null || !rel.startsWith(TREE) || rel.endsWith(".svelte")) continue
			const names = exports_at(rel)
			if (names == null) continue
			const at = line_at(src, m.index)
			for (const part of m[1].split(",")) {
				const asked = PART.exec(part.trim())
				if (!asked) continue
				const name = asked[1] ?? asked[2]
				if (names.has(name)) continue
				findings.push(
					`${path}:${at}: "${m[2]}" exports no "${name}" — this import would fail to link`
				)
			}
		}
	}
	return findings
}

/**
 * The names one JS module exports, as far as text can say — a `Set`, or
 * **`null` for "cannot tell"**: the module re-exports with `export * from`
 * (its names live in files this linter does not follow) or exports a
 * destructured binding whose names are not on the line as written. A caller
 * treats `null` as a skip, never as "exports nothing".
 */
export function exports_of(src) {
	const decl = strip_comments(src)
	if (/\bexport\s*\*\s*(?:as\s+[\w$]+\s*)?from\b/.test(decl)) return null
	if (/\bexport\s+(?:const|let|var)\s*[{\[]/.test(decl)) return null
	const names = new Set()
	if (/\bexport\s+default\b/.test(decl)) names.add("default")
	const decls = new RegExp(
		String.raw`\bexport\s+(?:(?:async\s+)?function\s*\*?\s*|const\s+|let\s+|var\s+|class\s+)(${NAME})`,
		"g"
	)
	for (const m of decl.matchAll(decls)) names.add(m[1])
	const braces = new RegExp(String.raw`\bexport\s*\{([^}]*)\}`, "g")
	for (const m of decl.matchAll(braces))
		for (const part of m[1].split(",")) {
			const asked = new RegExp(String.raw`^(${NAME})(?:\s+as\s+(${NAME}))?$`).exec(part.trim())
			if (asked) names.add(asked[2] ?? asked[1])
		}
	return names
}

/** Both passes over the real tree — `[]` is clean. */
export function lint_tree() {
	return [...unresolved_imports(), ...missing_exports()]
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	const findings = lint_tree()
	const files = [...sources()].length
	for (const f of findings) console.error(f)
	if (findings.length) {
		console.error(`\n${findings.length} broken import(s) under ${TREE} — see above.`)
		process.exit(1)
	}
	console.log(`${TREE} links: ${files} files, every import resolves and names what it asks for.`)
}
