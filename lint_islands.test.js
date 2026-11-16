/**
 * The cells for the link lint: what it claims, what it refuses to claim, and —
 * the one that keeps this repo honest — that the real tree is clean.
 *
 * Every fixture is a `{ "src/…": source }` map, so a deliberate break is
 * checked here without ever writing the break into a real file.
 */
import { test } from "node:test"
import assert from "node:assert/strict"

import { ALIASES, TREE, exports_of, lint_tree, missing_exports, ours, unresolved_imports } from "./lint_islands.js"

test("ours maps relative specifiers and the aliases from package.json", () => {
	assert.equal(ours("src/pages/Home.svelte", "./About.svelte"), "src/pages/About.svelte")
	assert.equal(ours("src/utils/format.test.js", "./format.js"), "src/utils/format.js")
	assert.equal(ours("src/pages/Home.svelte", "@comps/Card.svelte"), "src/comps/Card.svelte")
	assert.equal(ours("src/index.html", "@styles/water.css"), "src/optics/styles/water.css")
	assert.equal(ours("src/pages/Home.svelte", "routing"), "deps/routing")
	// Not ours: node_modules keeps its own business
	assert.equal(ours("src/stores/count.js", "svelte/store"), null)
	assert.ok(ALIASES.length > 0, "the alias block is read from package.json")
})

test("exports_of reads the shapes it can and skips the ones it cannot", () => {
	assert.deepEqual(
		[...exports_of('export function a() {}\nexport const b = 1\n')].sort(),
		["a", "b"]
	)
	assert.deepEqual([...exports_of("const a = 1\nexport { a as other }")], ["other"])
	assert.deepEqual([...exports_of("export default 1")], ["default"])
	// Blind spots, honestly declared
	assert.equal(exports_of('export * from "./other.js"'), null)
	assert.equal(exports_of("export const { a, b } = stuff"), null)
	// A commented-out export is not an export, and not a claim either
	assert.equal(exports_of("// export const gone = 1\nexport const here = 1").has("gone"), false)
})

test("missing_exports sees a named import of something the target does not export", () => {
	assert.deepEqual(
		missing_exports({
			"src/a.js": 'import { yes } from "./b.js"\n',
			"src/b.js": "export const yes = 1\n"
		}),
		[]
	)

	const findings = missing_exports({
		"src/a.js": 'import { no } from "./b.js"\n',
		"src/b.js": "export const yes = 1\n"
	})
	assert.equal(findings.length, 1)
	assert.match(findings[0], /^src\/a\.js:1: "\.\/b\.js" exports no "no"/)
})

test("missing_exports follows the aliases, and skips what text cannot judge", () => {
	const broken = missing_exports({
		"src/pages/p.svelte": 'import { no } from "@utils/format.js"\n',
		"src/utils/format.js": "export function plural() {}\n"
	})
	assert.equal(broken.length, 1)
	assert.match(broken[0], /exports no "no"/)

	assert.deepEqual(
		missing_exports({
			// a .svelte target exports a component shape, not names
			"src/pages/p.svelte": 'import { anything } from "@comps/Card.svelte"\n',
			"src/comps/Card.svelte": "<h1>hi</h1>\n",
			// and a re-exporting module is a skip, never a claim
			"src/stores/s.js": 'import { anything } from "../utils/all.js"\n',
			"src/utils/all.js": 'export * from "./format.js"\n',
			// node_modules is the bundler's problem
			"src/x.svelte": 'import { writable } from "svelte/store"\n'
		}),
		[]
	)
})

test("unresolved_imports sees a specifier that lands on nothing", () => {
	assert.deepEqual(
		unresolved_imports({
			"src/a.js": 'import b from "./b.js"\n',
			"src/b.js": "export default 1\n"
		}),
		[]
	)

	const findings = unresolved_imports({ "src/a.js": 'import b from "./gone.js"\n' })
	assert.equal(findings.length, 1)
	assert.match(findings[0], /^src\/a\.js:1: cannot resolve "\.\/gone\.js"/)

	// A quoted specifier in prose is not an import; the alias lands for real.
	assert.deepEqual(
		unresolved_imports({
			"src/a.svelte": '<!-- import x from "./prose.js" -->\n<script>\n\timport { plural } from "@utils/format.js"\n</script>\n',
			"src/utils/format.js": "export const plural = 1\n"
		}),
		[]
	)
})

test("the real src/ tree links: no unresolved path, no missing name", () => {
	assert.deepEqual(lint_tree(), [], `a broken import under ${TREE} fails this cell`)
})
