var a, c, i, j, s, t,
	friendlyName,
	cardIndices = {},
	// cssSelectors = [],
	css = document.createElement("style");

sides[corp].filters = {
	"Attributes": {},
	"Keywords": {}
};
sides[runner].filters = {
	"Attributes": {},
	"Keywords": {}
};

for (i = 0; i < cards.length; i++) {
	c = cards[i];

	// Build the index
	cardIndices[c.name] = i;
	cardIndices[c.nriKey] = i;

	// Build the list of filters
	s = c.side;

	a = c.att.split(" ");

	for (j = 0; j < a.length; j++) {
		if (a[j] === "") { continue; }
		if (sides[s].filters[a[j]]) { continue; }
		friendlyName = getAttributeFriendlyName(a[j]);
		// If the term starts with a capital letter, it's a keyword from the card; otherwise it's an attribute I made up
		if (a[j].match(/^[A-Z]/)) {
			t = "Keywords";
		} else {
			t = "Attributes";
		}
		sides[s].filters[t][a[j]] = { name: friendlyName, className: a[j], type: t };
	}
}

function getCardByNameOrId(name) {
	if (!name) {
		return null;
	}
	// If we're supplied a card, just give it back
	if (name.name) {
		return name;
	}
	if (cardIndices[name] !== undefined) {
		return cards[cardIndices[name]];
	}
	return null;
}

function getAttributeFriendlyName(att) {
	var split = att.split(/(?=\B[A-Z][a-z])/).join(" "); // Break up camel case
	split = split.substring(0,1).toUpperCase() + split.substring(1); // Make sure first letter is capitalized
	return split;
}

function fuzzyMatch(name) {
	if (!name || !name.length || !name.match(/\w/)) { return null; }
	function fuzz(s) {
		return s.toLowerCase().replace(/[^a-z0-9]/g, "");
	}
	name = fuzz(name);

	var i, cName, score, possibleMatches = [];

	for (i = 0; i < cards.length; i++) {
		score = 0;
		cName = fuzz(cards[i].name);
		
		if (cName.match(name)) {
			score++;
		}
		if (name.match(cName)) {
			score++;
		}

		if (score === 2) {
			// Best possible match
			return cards[i];
		}

		if (score === 1) {
			// Probable match
			possibleMatches.push(cards[i]);
		}
	}

	// Only one probably match found
	if (possibleMatches.length === 1) {
		return possibleMatches[0];
	}

	// Multiple matches
	if (possibleMatches.length) {
		return possibleMatches;
	}

	return null;
}

function formatCard(data) {
	if (typeof data === "string") { return data; }

	var templateName = data.type,
		bodyText = data.text
			.replace(/\r/g, "")
			.replace(/\n/g, "<br>"),
		templateText;
	if (data.type === "Identity") {
		templateName = data.side + "_" + data.type;
	}

	templateText = document.querySelector("#templateContainer #" + templateName).innerHTML
		.replace(/CARDADVANCEMENT/g,	data.advancementcost)
		.replace(/CARDBASELINK/g,		data.baselink)
		.replace(/CARDCOST/g,			data.cost)
		.replace(/CARDFACTION/g,		data.faction)
		.replace(/CARDINFLUENCE/g,		data.factioncost)
		.replace(/CARDLINK/g,			data.url)
		.replace(/CARDMAXINFLUENCE/g,	data.influencelimit)
		.replace(/CARDMEMORY/g,			data.memoryunits)
		.replace(/CARDMINDECK/g,		data.minimumdecksize)
		.replace(/CARDNAME/g,			data.title)
		.replace(/CARDSCORE/g,			data.agendapoints)
		.replace(/CARDSTRENGTH/g,		data.strength || "-")
		.replace(/CARDSUBTYPE/g,		data.subtype || "")
		.replace(/CARDTEXT/g,			bodyText)
		.replace(/CARDTRASH/g,			data.trash)
		.replace(/CARDTYPE/g,			data.type)
		.replace(/\[Click\]/g,				"<span class='click sprite'></span>")
		.replace(/\[Credits\]/g,			"<span class='credits sprite'></span>")
		.replace(/\[Link\]/g,				"<span class='link sprite'></span>")
		.replace(/\[Memory Unit\]/g,		"<span class='memory_unit sprite'></span>")
		.replace(/\[Recurring Credits\]/g,	"<span class='recurring_credits sprite'></span>")
		.replace(/\[Subroutine\]/g,			"<span class='subroutine sprite'></span>")
		.replace(/\[Trash\]/g,				"<span class='trash sprite'></span>")
		.replace(/\[Unique\]/g,				"<span class='unique sprite'></span>")
	;

	return templateText;
}