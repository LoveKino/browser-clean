var browserCleaner = (function() {
	var __moduleMap = {};
	var define = function(path, func) {
		__moduleMap[path] = {
			func: func
		};
	};
	var require = function(path) {
		if (!__moduleMap[path]) throw new Error('can not find module:' + path);
		if (__moduleMap[path].module) return __moduleMap[path].module.exports;
		var module = {
			exports: {}
		};
		__moduleMap[path].func.apply(module, [require, module, module.exports]);
		__moduleMap[path].module = module;
		return __moduleMap[path].module.exports;
	};
	define('/Users/ddchen/Coding/opensource/browser-clean/node_modules/rinse/node_modules/captureobject/lib/captureobject.js', function(require, module, exports) {
		/**
		 * capture object structure, support graph type object.
		 * 
		 * @process 
		 *      1. analysis object, generate a tree.
		 *      2. you can set the max deepth of the tree.
		 *      3. node
		 *              pointer: point the value of object or attribute of object
		 *              type: the type of pointer, include leaf, function, array, map
		 *              children: the son nodes of currrent node
		 *              isShowed: if object has shown before in anothor node, this value will be true
		 *              circleNode: if object has shown before in anothor node, point the node
		 *         if isShowed is true, current node will not generate child nodes, because this object has shown before.
		 *              
		 * @author  ddchen
		 */

		!(function() {

			var isArray = function(arr) {
				return Object.prototype.toString.call(arr) === "[object Array]";
			}

			var isFunction = function(fn) {
				return !!fn && !fn.nodeName && fn.constructor != String &&
					fn.constructor != RegExp && fn.constructor != Array &&
					/function/i.test(fn + "");
			}

			var isLeafType = function(leaf) {
				var type = typeof leaf;
				return type === "undefined" ||
					type === "boolean" ||
					type === "number" ||
					type === "string" ||
					leaf === null;
			}

			var getType = function(obj) {
				if (isLeafType(obj)) return "leaf";
				if (isFunction(obj)) return "function";
				if (isArray(obj)) return "array";
				return "map";
			}

			var Node = function(value) {
				this.pointer = value;
				this.type = getType(this.pointer);
				this.children = {};
			}

			Node.prototype = {
				constructor: Node,
				addChild: function(name, child) {
					this.children[name] = child;
					child.parent = this;
				},
				getDeepth: function() {
					var count = 0;
					var parent = this.parent;
					while (parent) {
						count++;
						parent = parent.parent;
					}
					return count;
				},
				getChildList: function() {
					var childList = [];
					for (var name in this.children) {
						childList.push(this.children[name]);
					}
					return childList;
				},
				setCircle: function(node) {
					this.isShowed = true;
					this.circleNode = node;
				}
			}

			var contain = function(nodeList, nodeItem) {
				if (!isArray(nodeList)) return false;
				for (var i = 0; i < nodeList.length; i++) {
					if (nodeItem.pointer === nodeList[i].pointer) return nodeList[i];
				}
				return false;
			}

			var captureobject = (function() {

				var open = [];
				var close = [];
				var maxDeep = null;

				var walk = function(obj) {
					var node = new Node(obj);
					open.push(node);
					while (open.length) {
						var curNode = open.pop();
						var children = generateChildren(curNode);
						open = open.concat(children);
						close.push(curNode);
					}
					return node;
				}

				var generateChildren = function(node) {
					var obj = node.pointer;
					var showedNode = contain(close, node);
					if (showedNode) {
						node.setCircle(showedNode);
					}
					var condition = !isLeafType(obj) && !showedNode;
					if (maxDeep !== null) {
						if (node.getDeepth() + 1 > maxDeep) {
							condition = false;
						}
					}

					if (condition) {
						for (var name in obj) {
							if (obj.hasOwnProperty(name)) {
								var childNode = new Node(obj[name]);
								node.addChild(name, childNode);
							}
						}
					}
					return node.getChildList();
				}

				return function(obj, md) {
					open = [];
					close = [];
					maxDeep = md;
					return walk(obj);
				}
			})();

			if (typeof module !== "undefined" && module.exports) {
				module.exports = captureobject;
			} else {
				window.captureobject = captureobject;
			}
		})();
	});
	define('/Users/ddchen/Coding/opensource/browser-clean/node_modules/rinse/node_modules/captureobject/index.js', function(require, module, exports) {
		module.exports = require('/Users/ddchen/Coding/opensource/browser-clean/node_modules/rinse/node_modules/captureobject/lib/captureobject.js');
	});
	define('/Users/ddchen/Coding/opensource/browser-clean/node_modules/rinse/lib/rinse.js', function(require, module, exports) {
		/**
		 * @author  ddchen
		 */
		var captureobject = require('/Users/ddchen/Coding/opensource/browser-clean/node_modules/rinse/node_modules/captureobject/index.js');

		var ObjectScene = (function() {

			var reBuildObj = function(tree) {
				var pointer = tree.pointer;
				var children = tree.children;
				var type = tree.type;
				var isShowed = tree.isShowed; // pointer was reformed already
				if (type === "leaf" || isShowed) {
					return pointer;
				} else {
					if (type == "array") {
						pointer.length = 0;
					}
					var standerdMap = getStanderdMap(children);
					diffObject(pointer, standerdMap);
				}
				return pointer;
			}

			var diffObject = function(pointer, standerdMap) {
				for (var name in pointer) {
					if (pointer.hasOwnProperty(name) &&
						!standerdMap.hasOwnProperty(name)) {
						pointer[name] = undefined;
						delete pointer[name];
					}
				}

				for (var name in standerdMap) {
					if (!pointer.hasOwnProperty(name) &&
						standerdMap.hasOwnProperty(name)) {
						pointer[name] = standerdMap[name];
					} else if (pointer.hasOwnProperty(name) &&
						standerdMap.hasOwnProperty(name)) {
						if (pointer[name] !== standerdMap[name]) {
							pointer[name] = standerdMap[name];
						}
					}
				}
			}

			var getStanderdMap = function(children) {
				var map = {};
				for (var name in children) {
					var child = children[name];
					var childObj = reBuildObj(child);
					map[name] = childObj;
				}
				return map;
			}

			return {
				create: function(obj) {
					var obj = obj;
					var tree = captureobject(obj);

					return {
						recovery: function() {
							obj = reBuildObj(tree);
							return obj;
						}
					}
				}
			}
		})();

		module.exports = {
			cover: function(obj, maxdeepth) {
				return ObjectScene.create(obj, maxdeepth);
			}
		}
	});
	define('/Users/ddchen/Coding/opensource/browser-clean/node_modules/rinse/index.js', function(require, module, exports) {
		module.exports = require('/Users/ddchen/Coding/opensource/browser-clean/node_modules/rinse/lib/rinse.js');
	});
	define('/Users/ddchen/Coding/opensource/browser-clean/lib/browser-clean.js', function(require, module, exports) {
		var rinse = require('/Users/ddchen/Coding/opensource/browser-clean/node_modules/rinse/index.js');
		var objectScene = null;

		var cleanRules = [];

		var addCleanRule = function(rule) {
			cleanRules.push(rule);
		}

		var isFunction = function(fn) {
			return !!fn && !fn.nodeName && fn.constructor != String &&
				fn.constructor != RegExp && fn.constructor != Array &&
				/function/i.test(fn + "");
		}

		addCleanRule(function() {
			objectScene && objectScene.recovery();
		});

		module.exports = {
			addCleanRule: addCleanRule,
			record: function(maxDeepth) {
				objectScene = rinse.cover(window, maxDeepth);
			},
			clean: function() {
				for (var i = 0; i < cleanRules.length; i++) {
					var rule = cleanRules[i];
					if (isFunction(rule)) {
						rule();
					}
				}
			}
		}
	});
	define('/Users/ddchen/Coding/opensource/browser-clean/index.js', function(require, module, exports) {
		module.exports = require('/Users/ddchen/Coding/opensource/browser-clean/lib/browser-clean.js');
	});
	return require('/Users/ddchen/Coding/opensource/browser-clean/index.js')
})();