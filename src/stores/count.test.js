import { test } from "node:test"
import assert from "node:assert/strict"

import { get } from "svelte/store"

import { count, doubled, step, reset } from "./count.js"

test("step moves the count by the amount given, one by default", () => {
	reset()
	step()
	assert.equal(get(count), 1)
	step()
	assert.equal(get(count), 2)
	step(-5)
	assert.equal(get(count), -3)
})

test("doubled follows the count", () => {
	reset()
	assert.equal(get(doubled), 0)
	step(4)
	assert.equal(get(doubled), 8)
})

test("reset puts the count back to zero", () => {
	step(9)
	reset()
	assert.equal(get(count), 0)
	assert.equal(get(doubled), 0)
})
