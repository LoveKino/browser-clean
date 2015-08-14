/**
 * @author  ddchen
 */

var captureobject = require("captureobject");

var isFunction = function(fn) {
	return !!fn && !fn.nodeName && fn.constructor != String &&
		fn.constructor != RegExp && fn.constructor != Array &&
		/function/i.test(fn + "");
}

var ObjectScene = (function() {

	var reBuildObj = function(tree, ignore) {
		var pointer = tree.pointer;
		var children = tree.children;
		var type = tree.type;
		var isShowed = tree.isShowed; // pointer was reformed already
		var isIgnored = shouldIgnore(tree.path, ignore);

		if (isShowed) {
			return pointer;
		} else if (type === "leaf") {
			if (!isIgnored) {
				return pointer;
			} else {
				return tree.parent.pointer[tree.name];
			}
			return pointer;
		} else if (isIgnored) {
			return pointer;
		} else {
			// reshape object
			var standerdMap = getStanderdMap(children, ignore);
			diffObject(pointer, standerdMap, tree.path, ignore);
		}
		return pointer;
	}

	var diffObject = function(pointer, standerdMap, path, ignore) {
		for (var name in pointer) {
			if (pointer.hasOwnProperty(name)) {
				if (!standerdMap.hasOwnProperty(name) &&
					!shouldIgnore(joinPath(path, name), ignore)) {
					pointer[name] = undefined;
					delete pointer[name];
				}
			}
		}

		for (var name in standerdMap) {
			if (standerdMap.hasOwnProperty(name)) {
				if (!pointer.hasOwnProperty(name)) {
					pointer[name] = standerdMap[name];
				} else {
					if (pointer[name] !== standerdMap[name]) {
						pointer[name] = standerdMap[name];
					}
				}
			}
		}
	}

	var getStanderdMap = function(children, ignore) {
		var map = {};
		for (var name in children) {
			var child = children[name];
			var childObj = reBuildObj(child, ignore);
			map[name] = childObj;
		}
		return map;
	}

	var shouldIgnore = function(path, ignore) {
		if (!ignore) return false;
		for (var i = 0; i < ignore.length; i++) {
			var item = ignore[i];
			if (typeof item === "string") {
				if (path === item) return true;
			} else if (item instanceof RegExp) {
				if (item.test(path)) return true;
			} else if (isFunction(item)) {
				if (item(path)) return true;
			}
		}
		return false;
	}

	var joinPath = function(path, name) {
		if (!path) return name;
		return path + "." + name;
	}

	return {
		create: function(obj, conf) {
			conf = conf || {};
			var ignore = conf.ignore;
			var obj = obj;
			var tree = captureobject(obj, {
				maxDepth: conf.maxDepth,
				ignore: conf.ignore
			});

			return {
				recovery: function() {
					obj = reBuildObj(tree, ignore);
					return obj;
				}
			}
		}
	}
})();

module.exports = {
	/**
	 * obj the object to cover
	 * conf
	 *     maxDepth
	 *     ignore
	 */
	cover: function(obj, conf) {
		return ObjectScene.create(obj, conf);
	}
}