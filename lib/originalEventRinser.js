/**
 * rinser for browser original events
 * @author  ddchen
 *
 *  ignores
 *      [{
 *      	node: node,   // must
 *      	type: "click", // must
 *      	handler: handler // must
 *      }]
 */

var originalEventAgent = require("./originalEventAgent.js");
var ignores = null;

var containInIgnores = function(node, eventType, eventHandler) {
	if (!ignores) return false;
	for (var i = 0; i < ignores.length; i++) {
		var whitePart = ignores[i];
		if (node === whitePart.node &&
			eventType === whitePart.type &&
			eventHandler === whitePart.handler) {
			return true;
		}
	}
	return false;
}

var clean = function() {
	var list = originalEventAgent.getErgodicList();
	for (var i = 0; i < list.length; i++) {
		var item = list[i];
		var node = item.node;
		var type = item.type;
		var handler = item.handler;
		var funName = originalEventAgent.getRemoveName();
		if (!containInIgnores(node, type, handler)) {
			node[funName].apply(node, [type, handler]);
		}
	}
}

var addEventIgnore = function(node, type, handler) {
	if (!ignores) ignores = [];
	ignores.push({
		node: node,
		type: type,
		handler: handler
	});
}

module.exports = {
	record: function(confs) {
		confs = confs || {};
		ignores = confs.ignores;
		originalEventAgent.proxy();
	},
	clean: clean,
	addEventIgnore: addEventIgnore
}