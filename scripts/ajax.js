/* global scope */

var Ajax = {};
Ajax.baseUrl = "http://netrunnerdb.com/api/cards/";

Ajax.destroy = function () {
	this.parentNode.removeChild(this);
};

// This will be called automaticly in cardControllers constructor
Ajax.getAllCards = function() {
	var query = Ajax.baseUrl + "?jsonp=Ajax.massImport",
		script = document.createElement("script");
	script.onload = Ajax.destroy;
	script.setAttribute("src", query);
	document.body.appendChild(script);
};

Ajax.massImport = function(data) {    
	data.forEach(function (cardData) {
		cards.push(new Card(cardData));
	});

	scope.$apply(cleanCards);
};

function cleanCards() {
	cards.sort(function (a, b) {
		return (a.name > b.name) ? 1 : -1;
	});

	for (i = 0; i < cards.length; i++) {
		c = cards[i];

		// Build the index
		cardIndices[c.name] = i;
		cardIndices[c.nriKey] = i;

		// Build the list of filters
		s = c.side;

		a = c.att;

		for (j = 0; j < a.length; j++) {
			if (!a[j]) { continue; }
			if (sides[s].filters[a[j]]) { continue; }
			var t = "Attributes";
			sides[s].filters[t][a[j]] = { name: a[j], className: a[j], type: t };
		}
	}
}