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

		var root = captureobject(testObj, 1);
		assert.equal(undefined, root.children["sub"].children["s1"]);
	});
});