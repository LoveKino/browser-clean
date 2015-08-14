var assert = require("assert");
var captureobject = require("../lib/captureobject.js");

describe("captureobject test", function() {
	it("it should work for plain object", function() {

		var testObj = {
			a: 1,
			b: "djaskjla",
			c: true
		}

		var root = captureobject(testObj);
		assert.equal(1, root.children["a"].pointer);
		assert.equal("djaskjla", root.children["b"].pointer);
		assert.equal(true, root.children["c"].pointer);
	});

	it("it should work for tree object", function() {

		var testObj = {
			a: 1,
			b: "djaskjla",
			c: true,
			d: {
				e: [1, 2, 3],
				f: {
					r: "rrrr"
				}
			}
		}

		var root = captureobject(testObj);
		assert.equal(1, root.children["d"].children["e"].children[0].pointer);
		assert.equal(2, root.children["d"].children["e"].children[1].pointer);
		assert.equal(3, root.children["d"].children["e"].children[2].pointer);
		assert.equal("rrrr", root.children["d"].children["f"].children["r"].pointer);
	});

	it("it should work for graph object", function() {

		var testObj = {
			a: 1,
			sub: {
				s1: "s1"
			}
		}
		testObj.sub.self = testObj;

		var root = captureobject(testObj);
		assert.equal(true, root.children["sub"].children["self"].isShowed);
		assert.equal(root, root.children["sub"].children["self"].circleNode);
	});

	it("it should work for max deepth", function() {

		var testObj = {
			a: 1,
			sub: {
				s1: "s1"
			}
		}

		var root = captureobject(testObj, {
			maxDepth: 1
		});
		assert.equal(undefined, root.children["sub"].children["s1"]);
	});

	it("it should work for hidden properties", function() {

		var testObj = [1, 2, 3]; // length is the hidden property of array

		var root = captureobject(testObj);
		assert.equal(root.children["length"].pointer, 3);
	});

	it("it should work for Node::path", function() {

		var testObj = {
			a: {
				b: 1
			},
			c: [{
				d: 2
			}, 3],
			e: true
		}

		testObj.f = testObj;

		var root = captureobject(testObj);
		assert.equal(root.children["a"].path, "a");
		assert.equal(root.children["c"].path, "c");
		assert.equal(root.children["e"].path, "e");

		assert.equal(root.children["a"].children["b"].path, "a.b");
		assert.equal(root.children["c"].children["0"].path, "c.0");
		assert.equal(root.children["c"].children["1"].path, "c.1");

		assert.equal(root.children["c"].children["0"].children["d"].path, "c.0.d");

	});

	it("it should work for Node::name", function() {

		var testObj = {
			a: {
				b: 1
			},
			c: [{
				d: 2
			}, 3],
			e: true
		}

		testObj.f = testObj;

		var root = captureobject(testObj);
		assert.equal(root.name, "");
		assert.equal(root.children["a"].name, "a");
		assert.equal(root.children["c"].name, "c");
		assert.equal(root.children["c"].children["0"].name, 0);
		assert.equal(root.children["c"].children["0"].children["d"].name, "d");
	});

	it("it should work for ignore list", function() {

		var testObj = {
			a: {
				b: 1
			},
			c: [{
				d: 2
			}, 3],
			e: true,
			f: {
				g: 100
			}
		}

		testObj.f = testObj;

		var root = captureobject(testObj, {
			ignore: ["a", "c.0.d", /e/, function(path) {
				return path === "f.g";
			}]
		});
		assert.equal(root.children["a"], undefined);
		assert.equal(root.children["e"], undefined);
		assert.equal(root.children["f"].path, "f");
		assert.equal(root.children["f"].children["g"], undefined);
		assert.equal(root.children["c"].children["1"].pointer, 3);
		assert.equal(root.children["c"].children["0"].children["d"], undefined);
	});

});