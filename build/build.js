var path = require("path");
var builder = require("front-module-builder");

builder.build({
	mainJsPath: path.join(__dirname, "../index.js"),
	targetJsPath: path.join(__dirname, "../browser/browser-clean.js"),
	exportsCode: "var browserCleaner = "
});