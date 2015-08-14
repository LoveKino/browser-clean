var assert = require("assert");
var rinse = require("../lib/rinse.js");

describe("rinse", function() {
	it("should work for cover", function() {

		var obj = {
			a: 1,
			b: 2,
			c: 3
		}

		rinse.cover(obj);

	});

	it("should work for ObjectScene::init", function() {

		var obj = {
			a: 1,
			b: 2,
			c: 3
		}

		var scene = rinse.cover(obj);

	});

	it("should work for ObjectScene::recovery", function() {

		var obj = {
			a: 1,
			b: 2,
			c: 3
		}
		var scene = rinse.cover(obj);

		// modify obj
		obj.d = {
			e: 2
		}

		obj.a = "dskskds";
		delete obj.b;

		// recovery
		scene.recovery();
		assert.equal(1, obj.a);
		assert.equal(2, obj.b);
		assert.equal(3, obj.c);
		assert.equal(3, Object.getOwnPropertyNames(obj).length);

		// modify again
		obj.c = {
			e: "dshjfsdk"
		}

		// recovery
		scene.recovery();
		assert.equal(1, obj.a);
		assert.equal(2, obj.b);
		assert.equal(3, obj.c);
		assert.equal(3, Object.getOwnPropertyNames(obj).length);
	});

	it("should work for graph object", function() {

		var obj = {
			a: 1,
			b: 2,
			c: 3,
			att: {
				what: "the"
			}
		}
		obj.att.ok = obj; // this is a circle

		var scene = rinse.cover(obj);

		// modify obj
		obj.d = {
			e: 2
		}

		obj.a = "dskskds";
		delete obj.b;
		delete obj.att;

		// recovery
		scene.recovery();
		assert.equal(obj.att.ok, obj);
		assert.equal(obj.b, 2);
		assert.equal(obj.a, 1);

	});

	it("should work for modify array.length", function() {

		var obj = [1, 2, 3, 4];

		var scene = rinse.cover(obj);

		// modify obj
		obj.length = 0;

		// recovery
		scene.recovery();
		assert.equal(obj[0], 1);
		assert.equal(obj[1], 2);
		assert.equal(obj[2], 3);
		assert.equal(obj[3], 4);
		assert.equal(obj.length, 4);

		// modify obj
		obj.length = 10;
		scene.recovery();

		assert.equal(obj[0], 1);
		assert.equal(obj[1], 2);
		assert.equal(obj[2], 3);
		assert.equal(obj[3], 4);
		assert.equal(obj.length, 4);

	});

	it("should work for ignore config of string", function() {

		var obj = {
			a: 1,
			b: 2,
			c: 3,
			att: {
				what: "the"
			}
		}
		obj.att.ok = obj; // this is a circle

		var scene = rinse.cover(obj, {
			ignore: ["a", "att", "d"]
		});

		// modify obj
		obj.d = {
			e: 2
		}

		obj.a = "dskskds";
		delete obj.b;
		obj.att.what = "123456";

		// recovery
		scene.recovery();

		assert.equal(obj.att.ok, obj);
		assert.equal(obj.att.what, "123456");
		assert.equal(obj.a, "dskskds");
		assert.equal(obj.d.e, 2);
	});

	it("should work for ignore config of regExp", function() {

		var obj = {
			a: 1,
			b: 2,
			c: 3,
			att: {
				what: "the"
			}
		}
		obj.att.ok = obj; // this is a circle

		var scene = rinse.cover(obj, {
			ignore: [/att\.what/]
		});

		// modify obj
		obj.d = {
			e: 2
		}

		obj.a = "dskskds";
		delete obj.b;
		obj.att.what = "123456";

		// recovery
		scene.recovery();

		assert.equal(obj.att.what, "123456");
	});

	it("should work for ignore config of function", function() {

		var obj = {
			a: 1,
			b: 2,
			c: 3,
			att: {
				what: "the"
			}
		}
		obj.att.ok = obj; // this is a circle

		var scene = rinse.cover(obj, {
			ignore: [function(path) {
				return path === "att.what"
			}]
		});

		// modify obj
		obj.d = {
			e: 2
		}

		obj.a = "dskskds";
		delete obj.b;
		obj.att.what = "123456";

		// recovery
		scene.recovery();

		assert.equal(obj.att.what, "123456");
	});
});