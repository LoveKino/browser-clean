var rinse = require("rinse");
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