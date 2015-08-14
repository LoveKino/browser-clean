/**
 * @author ddchen
 *
 * @todo 
 * 	1. white list
 */


var rinse = require("rinse");
var objectScenes = null;

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
	if (objectScenes) {
		for (var i = 0; i < objectScenes.length; i++) {
			var objectScene = objectScenes[i];
			objectScene.recovery();
		}
	}
});

module.exports = {
	addCleanRule: addCleanRule,
	record: function(confs) {
		objectScenes = [];
		for (var i = 0; i < confs.length; i++) {
			var conf = confs[i];
			var objectScene = rinse.cover(conf.target, conf.opts);
			objectScenes.push(objectScene);
		}
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