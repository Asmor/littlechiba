/* global foreignCardData */
/* global scope */

var Ajax = {};
Ajax.baseUrl = "http://netrunnerdb.com/api/cards/";
Ajax.jsonpWrapper = "?jsonp=Ajax.callback";

Ajax.callback = function (cardData) {
	var card = cardData[0],
		key = card.code;
	foreignCardData[key] = card;
	scope.setPreviewLink(key);
	scope.$apply();
};

Ajax.destroy = function () {
	this.parentNode.removeChild(this);
};

// Get all corpo and runner cards in one query and fill foreignCardData global variable.
// This will be called automaticly in cardControllers constructor
Ajax.getAllCards = function() {
	var query = Ajax.baseUrl + "?jsonp=Ajax.massImport",
		script = document.createElement("script");
	script.onload = Ajax.destroy;
	script.setAttribute("src", query);
	document.body.appendChild(script);
};

Ajax.massImport = function(data) {    
	for (var i in data) {
		if (!data.hasOwnProperty(i)) { continue; }
		foreignCardData[data[i].code] = data[i];
	}
};
