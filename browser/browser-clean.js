var browserCleaner = (function(){var __moduleMap={};var define = function(path,func){__moduleMap[path] = {func:func};};var require = function(path){if(!__moduleMap[path])throw new Error('can not find module:'+path);if(__moduleMap[path].module)return __moduleMap[path].module.exports;var module={exports:{}};__moduleMap[path].func.apply(module, [require,module,module.exports]);__moduleMap[path].module = module;return __moduleMap[path].module.exports;};define('/Users/ddchen/Coding/opensource/browser-clean/node_modules/rinse/node_modules/captureobject/lib/captureobject.js', function(require, module, exports){
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
 *
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

	var Node = function(value, path) {
		path = path || "";
		this.pointer = value;
		this.type = getType(this.pointer);
		this.children = {};
		this.path = path;

		var arr = path.split(".");
		this.name = arr[arr.length - 1];
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
		var ignore = null;

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
			var showedNode = contain(close, node);
			if (showedNode) {
				node.setCircle(showedNode);
			}

			var condition = checkExpandCondition(node);
			if (condition) {
				expandChildren(node);
			}
			return node.getChildList();
		}

		var checkExpandCondition = function(node) {
			var obj = node.pointer;
			var isShowed = node.isShowed;
			var condition = !isLeafType(obj) && !isShowed;
			if (maxDeep !== null) {
				if (node.getDeepth() + 1 > maxDeep) {
					condition = false;
				}
			}
			return condition;
		}

		var expandChildren = function(parentNode) {
			var obj = parentNode.pointer;
			for (var name in obj) {
				if (obj.hasOwnProperty(name) &&
					name !== "length") {
					expandChild(parentNode, name);
				}
			}
			if (obj.hasOwnProperty("length")) {
				expandChild(parentNode, "length");
			}
		}

		var expandChild = function(parentNode, name) {
			var obj = parentNode.pointer;
			var path = parentNode.path;

			var childPath = name;
			if (path) {
				childPath = path + "." + childPath;
			}
			if (!shouldIgnore(childPath)) {
				var value = obj[name];
				var childNode = new Node(value, childPath);
				parentNode.addChild(name, childNode);
			}
		}

		var shouldIgnore = function(path) {
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

		return function(obj, conf) {
			conf = conf || {};
			open = [];
			close = [];
			maxDeep = conf.maxDepth;
			ignore = conf.ignore;
			return walk(obj);
		}
	})();

	if (typeof module !== "undefined" && module.exports) {
		module.exports = captureobject;
	} else {
		window.captureobject = captureobject;
	}
})();
});define('/Users/ddchen/Coding/opensource/browser-clean/node_modules/rinse/node_modules/captureobject/index.js', function(require, module, exports){
module.exports = require('/Users/ddchen/Coding/opensource/browser-clean/node_modules/rinse/node_modules/captureobject/lib/captureobject.js');
});define('/Users/ddchen/Coding/opensource/browser-clean/node_modules/rinse/lib/rinse.js', function(require, module, exports){
/**
 * @author  ddchen
 */

var captureobject = require('/Users/ddchen/Coding/opensource/browser-clean/node_modules/rinse/node_modules/captureobject/index.js');

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
});define('/Users/ddchen/Coding/opensource/browser-clean/node_modules/rinse/index.js', function(require, module, exports){
module.exports = require('/Users/ddchen/Coding/opensource/browser-clean/node_modules/rinse/lib/rinse.js');
});define('/Users/ddchen/Coding/opensource/browser-clean/lib/objectRinser.js', function(require, module, exports){
var rinse = require('/Users/ddchen/Coding/opensource/browser-clean/node_modules/rinse/index.js');
var objectScenes = [];


module.exports = {
	record: function(confs) {
		confs = confs || [];
		objectScenes = [];
		for (var i = 0; i < confs.length; i++) {
			var conf = confs[i];
			var objectScene = rinse.cover(conf.target, conf.opts);
			objectScenes.push(objectScene);
		}
	},
	clean: function() {
		for (var i = 0; i < objectScenes.length; i++) {
			var objectScene = objectScenes[i];
			objectScene.recovery();
		}
	}
}
});define('/Users/ddchen/Coding/opensource/browser-clean/lib/originalEventRinser.js', function(require, module, exports){
/**
 * rinser for browser original events
 * @author  ddchen
 *
 *  1. collect events
 *  2. release events, consider white list
 *
 * eventMatrix
 * 		[{
 * 		   node : document,
 * 		   events : [
 * 		   		{
 * 		   		   type: "click",
 * 		   		   handlers: [ handler ]
 * 		   		}
 * 		   ]
 * 		}]
 *
 *  proxyList
 *      [{
 *      	owner: owner,
 *      	funName: funName
 *      }]
 *
 * whiteList
 *      [{
 *      	node: node,   // must
 *      	type: "click", // must
 *      	handler: handler // must
 *      }]
 *
 * to-do
 *  1. Compatible IE
 *
 * represent: window and document
 * In safari, window.hasOwnProperty("addEventListener") => true
 */
var whiteList = null;

var eventMatrix = [];
var proxyList = [];

var globalObject = window;
var domRepresent = globalObject.document;

var proxyEventInterface = function() {
	proxyAddEvent(globalObject);
	proxyAddEvent(domRepresent);

	proxyRemoveEvent(globalObject);
	proxyRemoveEvent(domRepresent);
}

var clean = function() {
	var list = getErgodicList();
	for (var i = 0; i < list.length; i++) {
		var item = list[i];
		var node = item.node;
		var type = item.type;
		var handler = item.handler;
		var funName = getRemoveName();
		if (!containInWhiteList(node, type, handler)) {
			node[funName].apply(node, [type, handler]);
			removeEventInfoFromList(node, type, handler);
		}
	}
}

var proxyAddEvent = function(represent) {
	var funName = getAddName();
	proxyFun(represent, funName, function(owner, funName) {
		var oldFun = owner[funName];
		owner[funName] = function(eventType, eventHandler, useCapture) {
			var node = this;
			addEventInfoToList(node, eventType, eventHandler);
			return oldFun.apply(this, [eventType, eventHandler, useCapture]);
		}
	});
}

var proxyRemoveEvent = function(represent) {
	var funName = getRemoveName();
	proxyFun(represent, funName, function(owner, funName) {
		var oldFun = owner[funName];
		owner[funName] = function(eventType, eventHandler, useCapture) {
			var node = this;
			removeEventInfoFromList(node, eventType, eventHandler);
			return oldFun.apply(this, [eventType, eventHandler, useCapture]);
		}
	});
}

var proxyFun = function(represent, funName, callback) {
	var owner = findFunOwner(represent, funName);
	if (!owner || containInProxyList(owner, funName)) return;
	callback && callback(owner, funName);
	proxyList.push({
		owner: owner,
		funName: funName
	});
}

var addEventInfoToList = function(node, eventType, eventHandler) {
	if (!node || !eventType || !isFunction(eventHandler)) return;
	var eventList = findEventList(node, true);
	if (!eventList) return;
	var eventTypeList = findEventTypeList(eventType, eventList, true);
	if (!eventTypeList) return;
	eventTypeList.handlers.push(eventHandler);
}

var removeEventInfoFromList = function(node, eventType, eventHandler) {
	if (!node || !eventType || !isFunction(eventHandler)) return;
	var eventList = findEventList(node, false);
	if (!eventList) return;
	var eventTypeList = findEventTypeList(eventType, eventList, false);
	if (!eventTypeList) return;
	var handlers = eventTypeList.handlers;
	removeFromList(handlers, eventHandler);
	// clear
	if (handlers.length === 0) {
		removeFromList(eventList.events, eventTypeList);
	}
	if (eventList.events.length === 0) {
		removeFromList(eventMatrix, eventList);
	}
}

var findEventTypeList = function(eventType, eventList, auto) {
	var newEvt = null;
	if (!eventType) return newEvt;
	var events = eventList.events;
	for (var i = 0; i < events.length; i++) {
		var evt = events[i];
		if (eventType === evt.type) {
			return evt;
		}
	}
	if (auto) {
		newEvt = {
			type: eventType,
			handlers: []
		}
		events.push(newEvt);
	}
	return newEvt;
}

var findEventList = function(node, auto) {
	var newEventList = null;
	if (!node) return newEventList;
	for (var i = 0; i < eventMatrix.length; i++) {
		var eventList = eventMatrix[i];
		if (eventList.node === node) {
			return eventList;
		}
	}
	if (auto) {
		newEventList = {
			node: node,
			events: []
		}
		eventMatrix.push(newEventList);
	}
	return newEventList;
}

var containInProxyList = function(owner, funName) {
	for (var i = 0; i < proxyList.length; i++) {
		var proxyObj = proxyList[i];
		if (proxyObj.owner === owner && proxyObj.funName === funName) {
			return true;
		}
	}
	return false;
}

var findFunOwner = function(startObj, funName) {
	if (!startObj) return null;
	var curObj = startObj;
	while (curObj) {
		if (curObj.hasOwnProperty(funName)) {
			return curObj;
		} else {
			if (Object.getPrototypeOf) {
				curObj = Object.getPrototypeOf(curObj);
			} else {
				curObj = curObj.__proto__;
			}
		}
	}
	return null;
}

var getAddName = function() {
	return domRepresent.addEventListener ? "addEventListener" : "attachEvent";
}

var getRemoveName = function() {
	return domRepresent.removeEventListener ? "removeEventListener" : "detachEvent";
}

var isFunction = function(fn) {
	return !!fn && !fn.nodeName && fn.constructor != String &&
		fn.constructor != RegExp && fn.constructor != Array &&
		/function/i.test(fn + "");
}

var containInWhiteList = function(node, eventType, eventHandler) {
	if (!whiteList) return false;
	for (var i = 0; i < whiteList.length; i++) {
		var whitePart = whiteList[i];
		if (node === whitePart.node &&
			eventType === whitePart.type &&
			eventHandler === whitePart.handler) {
			return true;
		}
	}
	return false;
}

var getErgodicList = function() {
	var list = [];
	for (var i = 0; i < eventMatrix.length; i++) {
		var eventList = eventMatrix[i];
		var node = eventList.node;
		var events = eventList.events;
		for (var j = 0; j < events.length; j++) {
			var eventTypeList = events[j];
			var type = eventTypeList.type;
			var handlers = eventTypeList.handlers;
			for (var k = 0; k < handlers.length; k++) {
				var handler = handlers[k];
				list.push({
					node: node,
					type: type,
					handler: handler,
					eventList: eventList,
					eventTypeList: eventTypeList,
				});
			}
		}
	}
	return list;
}

var removeFromList = function(list, item) {
	for (var i = 0; i < list.length; i++) {
		if (list[i] === item) {
			list.splice(i, 1);
			i = i - 1;
		}
	}
}

module.exports = {
	record: function(confs) {
		confs = confs || {};
		whiteList = confs.whiteList;
		proxyEventInterface();
	},
	clean: clean
}
});define('/Users/ddchen/Coding/opensource/browser-clean/lib/browser-clean.js', function(require, module, exports){
/**
 * @author ddchen
 */

var objectRinser = require('/Users/ddchen/Coding/opensource/browser-clean/lib/objectRinser.js');
var originalEventRinser = require('/Users/ddchen/Coding/opensource/browser-clean/lib/originalEventRinser.js');

var cleanRules = [];
var confs = null;

var addCleanRule = function(rule) {
	cleanRules.push(rule);
}

var isFunction = function(fn) {
	return !!fn && !fn.nodeName && fn.constructor != String &&
		fn.constructor != RegExp && fn.constructor != Array &&
		/function/i.test(fn + "");
}

addCleanRule(function() {
	objectRinser.clean();
	if (confs.events && confs.events.on === true) {
		originalEventRinser.clean();
	}
});

module.exports = {
	addCleanRule: addCleanRule,
	record: function(opts) {
		confs = opts || {};
		objectRinser.record(confs.objects);
		if (confs.events && confs.events.on === true) {
			originalEventRinser.record(confs.events);
		}
	},
	clean: function() {
		for (var i = 0; i < cleanRules.length; i++) {
			var rule = cleanRules[i];
			isFunction(rule) && rule();
		}
	},
	generalConf: {
		windowIgnore: [/webkit/, "location", "document.location", "localStorage", "name", "sessionStorage", "history"]
	}
}
});define('/Users/ddchen/Coding/opensource/browser-clean/index.js', function(require, module, exports){
module.exports = require('/Users/ddchen/Coding/opensource/browser-clean/lib/browser-clean.js');
});return require('/Users/ddchen/Coding/opensource/browser-clean/index.js')})();