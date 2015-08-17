/**
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
	proxy: proxyEventInterface,
	getRemoveName: getRemoveName,
	getAddName: getAddName,
	getErgodicList: getErgodicList
}