/* global foreignCardData */
/* global scope */

var Ajax = {};
Ajax.baseUrl = "http://netrunnercards.info/api/search/";
Ajax.jsonpWrapper = "?jsonp=Ajax.callback";

Ajax.callback = function (cardData) {
	var card = cardData[0],
		key = card.indexkey;
	foreignCardData[key] = card;
	scope.setPreviewLink(key);
	scope.$apply();
};

Ajax.destroy = function () {
	this.parentNode.removeChild(this);
};

Ajax.getCardData = function (key) {
	var script = document.createElement("script");
	script.onload = Ajax.destroy;
	script.setAttribute("src", Ajax.baseUrl + key + Ajax.jsonpWrapper);
	document.body.appendChild(script);
};

// Get all corpo and runner cards in one query and fill foreignCardData global variable.
// If all works as intended then Ajax.getCardData will never need to fire.
// 
// This will be called automaticly in cardControllers constructor
Ajax.getAllCards = function() {
	var query = Ajax.baseUrl + "d:r|c?jsonp=Ajax.massImport",
		script = document.createElement("script");
	script.onload = Ajax.destroy;
	script.setAttribute("src", query);
	document.body.appendChild(script);
};

Ajax.massImport = function(data) {    
	for (var i in data) {
		if (!data.hasOwnProperty(i)) { continue; }
		foreignCardData[data[i].indexkey] = data[i];
	}
};
