var Ajax = {};
Ajax.baseUrl = "http://netrunnercards.info/api/search/";
Ajax.jsonpWrapper = "?jsonp=Ajax.callback";

Ajax.callback = function (cardData) {
	var card = cardData[0],
		key = card.indexkey;
	foreignCardData[key] = card;
	scope.setPreviewLink(key);
	scope.$apply();
}

Ajax.destroy = function () {
	this.parentNode.removeChild(this);
}

Ajax.getCardData = function (key) {
	var script = document.createElement("script");
	script.onload = Ajax.destroy;
	script.setAttribute("src", Ajax.baseUrl + key + Ajax.jsonpWrapper);
	document.body.appendChild(script)
};