import { test } from "node:test"
import assert from "node:assert/strict"

import { plural, title_case } from "./format.js"

test("plural is singular only at exactly one", () => {
	assert.equal(plural(1, "route"), "1 route")
	assert.equal(plural(0, "route"), "0 routes")
	assert.equal(plural(2, "route"), "2 routes")
	assert.equal(plural(1.5, "route"), "1.5 routes")
})

test("plural takes the irregular many when given one", () => {
	assert.equal(plural(1, "person", "people"), "1 person")
	assert.equal(plural(2, "person", "people"), "2 people")
})

test("title_case capitalises the first letter and leaves the rest alone", () => {
	assert.equal(title_case("about us"), "About us")
	assert.equal(title_case("  demo "), "Demo")
	assert.equal(title_case("iPhone"), "IPhone")
	assert.equal(title_case(""), "")
})
