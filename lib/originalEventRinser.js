/**
 * rinser for browser original events
 * @author  ddchen
 */

var originalEventAgent = require("./originalEventAgent.js");
var whiteList = null;

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


var clean = function() {
	var list = originalEventAgent.getErgodicList();
	for (var i = 0; i < list.length; i++) {
		var item = list[i];
		var node = item.node;
		var type = item.type;
		var handler = item.handler;
		var funName = originalEventAgent.getRemoveName();
		if (!containInWhiteList(node, type, handler)) {
			node[funName].apply(node, [type, handler]);
		}
	}
}

module.exports = {
	record: function(confs) {
		confs = confs || {};
		whiteList = confs.whiteList;
		originalEventAgent.proxy();
	},
	clean: clean
}