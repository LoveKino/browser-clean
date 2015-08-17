/**
 * @author ddchen
 */

var objectRinser = require("./objectRinser.js");
var originalEventRinser = require("./originalEventRinser.js");

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
	addEventIgnore: originalEventRinser.addEventIgnore,
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