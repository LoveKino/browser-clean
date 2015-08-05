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
		assert.equal('{"a":1,"b":2,"c":3}', JSON.stringify(obj));

		// modify again
		obj.c = {
			e: "dshjfsdk"
		}

		// recovery
		scene.recovery();
		assert.equal('{"a":1,"b":2,"c":3}', JSON.stringify(obj));
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
		assert.equal(obj.att.ok , obj);
		assert.equal(obj.b , 2);
		assert.equal(obj.a , 1);

	});
});