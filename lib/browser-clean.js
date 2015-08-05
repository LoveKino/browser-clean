var rinse = require("rinse");
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