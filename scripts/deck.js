function Deck(isBase) {
	this.reset = function () {
		this.cards = {};
		this.identity = null;
		this.influenceAvailable = 0;
		this.minCards = 0;
		this.name = "";
		if (!isBase) {
			this.base = new Deck(true);
			this.baseSet = false;
		}
		this.recalculate();
	};
	this.recalculate = function () {
		this.cardCount = 0;
		this.totalPoints = 0;
		this.influenceTotal = 0;

		// Larger decks require more agenda points
		this.minPoints = 0;

		for (name in this.cards) {
			if (this.cards.hasOwnProperty(name)) {
				var card = getCardByNameOrId(name),
					qty = this.cards[name];
				if (qty === 0) {
					delete this.cards[name];
					continue;
				}
				this.cardCount += qty;
				if (card.faction !== this.identity.faction) {
					this.influenceTotal += card.influence * qty;
				}
				if (card.type === agenda) {
					this.totalPoints += card.agendaPoints * qty;
				}
			}
		}

		if (this.identity && this.identity.customInfluenceCalculation) {
			this.influenceTotal = this.identity.customInfluenceCalculation(this.cards);
		}

		this.minPoints = getMinPoints(Math.max(this.cardCount, this.minCards));
		this.notEmpty = !!this.identity; // Negate twice to return a bool
		this.isCorp = !!(this.identity && this.identity.side === corp);
		this.enoughCards = (this.cardCount >= this.minCards);
		this.enoughAgendaPoints = (this.totalPoints >= this.minPoints);
		this.withinInfluenceLimit = (this.influenceTotal <= this.influenceAvailable);
		this.countCardTypes();
		if (!isBase) {
			this.calculateDiff();
		}
		this.generateTextExport();
	}
	this.add = function (card) {
		var returnVal;
		card = getCardByNameOrId(card);
		if (card.type === identity) {
			returnVal = this.setIdentity(card);
		} else {
			returnVal = this.addToDeck(card);
		}
		this.recalculate();
		// resize();
		return returnVal;
	};
	this.calculateDiff = function () {
		var cardDiffs = {},
			n = this.cards,
			o = this.base.cards,
			diffSort = function (a, b) {
				return (a > b) ? 1 : -1;
			},
			i, diffQty, diff;
		this.diff = {
			removed: [],
			added: []
		}
		for (card in n) {
			if (!n.hasOwnProperty(card)) { continue; }
			cardDiffs[card] = n[card];
		}
		for (card in o) {
			if (!o.hasOwnProperty(card)) { continue; }
			cardDiffs[card] = cardDiffs[card] || 0;
			cardDiffs[card] -= o[card];
		}
		for (card in cardDiffs) {
			if (!cardDiffs.hasOwnProperty(card)) { continue; }
			diffQty = cardDiffs[card];
			diff = {
				name: card,
				qty: diffQty
			}
			if (diffQty > 0) {
				diff.qty = "+" + diff.qty;
				this.diff.added.push(diff);
			} else if (diffQty < 0) {
				this.diff.removed.push(diff);
			}
		}
		if (this.diff.added.length || this.diff.removed.length) {
			this.diff.added.sort(diffSort);
			this.diff.removed.sort(diffSort);
			this.hasDiff = true;
		} else {
			this.hasDiff = false;
		}
	};
	this.countCardTypes = function () {
		var card;
		this.cardsByType = {};
		this.cardQuantitiesByType = {};
		for (name in this.cards) {
			if (this.cards.hasOwnProperty(name)) {
				var card = getCardByNameOrId(name);
				if (!this.cardsByType[card.type]) {
					this.cardsByType[card.type] = {
						cards: {},
						qty: 0
					};
				}
				this.cardsByType[card.type].cards[name] = this.cards[name];
				this.cardsByType[card.type].qty += this.cards[name];
			}
		}
	};
	this.setBase = function (s) {
		this.baseSet = true;
		this.base.import(s);
		this.recalculate();
	}
	this.setIdentity = function (card) {
		var c, i;
		this.identity = card;
		// Remove out-of-faction agendas and out-of-side cards when
		// identity is set
		for (i in this.cards) {
			if (this.cards.hasOwnProperty(i)) {
				c = getCardByNameOrId(i);
				if (c.side !== this.identity.side
					|| (c.type === agenda
						&& c.faction !== this.identity.faction
						&& c.faction !== neut)) {
					delete this.cards[i];
				}
			}
		}
		this.influenceAvailable = card.influenceAvailable;
		this.minCards = card.minCards;
		return true;
	};
	this.addToDeck = function (card) {
		if (!this.identity) { return false; }
		if (!this.identity.validate(card)) { return false; }
		if (card.type === agenda
			&& card.faction !== this.identity.faction
			&& card.faction !== neut) {
			return false;
		}
		this.cards[card.nriKey] = (this.cards[card.nriKey] || 0) + 1;
		if (this.cards[card.nriKey] > 3) {
			this.cards[card.nriKey] = 3;
			return false;
		}
		return true;
	};
	this.generateTextExport = function () {
		this.textExport = "";
		if (!this.identity) { return; }

		var lines = [],
			cardsByType = {},
			cardTypes = [],
			i, j, c, t, infS;

		lines.push("Identity: " + this.identity.faction + ": " + this.identity.name);
		lines.push("");
		lines.push("Cards: " + this.cardCount + " / " + this.minCards);
		if (this.identity.side === corp) {
			lines.push("Agenda points: " + this.agendaPoints + " / " + this.minPoints);
		}
		lines.push("Influence: " + this.influenceTotal + " / " + this.influenceAvailable);
		lines.push("");

		for (i in this.cards) {
			if (!this.cards.hasOwnProperty(i)) { return; }
			c = getCardByNameOrId(i);
			if (!cardsByType[c.type]) {
				cardsByType[c.type] = [];
				cardTypes.push(c.type);
				cardsByType[c.type].qty = 0;
			}
			infS = (c.faction === this.identity.faction) ? "" : c.getInfluenceString(false, this.cards[i]);
			cardsByType[c.type].push({ name: c.name, qty: this.cards[i], inf: infS });
			cardsByType[c.type].qty += this.cards[i];
		}
		
		cardTypes.sort();
		for (i = 0; i < cardTypes.length; i++) {
			t = cardTypes[i];
			lines.push(t + " (" + cardsByType[t].qty + ")");
			cardsByType[t].sort(function (a, b) { return (a.name > b.name) ? 1 : -1; });
			for (j = 0; j < cardsByType[t].length; j++) {
				c = cardsByType[t][j];
				lines.push(c.qty + "x " + c.name + " " + c.inf);
			}
			lines.push("");
		}

		this.textExport = lines.join("\n");
	};
	this.remove = function (card) {
		card = getCardByNameOrId(card);
		if (card.type === identity) {
			this.identity = null;
			this.setTableClass();
			this.reset();
			return true;
		}
		if (!this.cards[card.nriKey]) {
			return false;
		}
		this.cards[card.nriKey]--;
		this.recalculate();
		return true;
	};
	this.getInfluence = function () {
		var i, inf = 0, card;
		for (i in this.cards) {
			if (this.cards.hasOwnProperty(i)) {
				card = getCardByNameOrId(i);
				if (card.faction !== this.identity.faction
					&& card.influence) {
					inf += card.influence * this.cards[i];
				}
			}
		}
		return inf;
	};
	this.getAgendaPoints = function () {
		var i, points = 0, card;
		for (i in this.cards) {
			if (this.cards.hasOwnProperty(i)) {
				card = getCardByNameOrId(i);
				if (card.agendaPoints) {
					points += card.agendaPoints * this.cards[i];
				}
			}
		}
		return points;
	};

	this.export = function () {
		if (!this.identity) {
			return null;
		}
		var o = {
			identity: this.identity.nriKey,
			cards: this.cards
		}, i;
		for (i in o.cards) {
			if (o.cards.hasOwnProperty(i) && o.cards[i] === 0) {
				delete o.cards[i];
			}
		}
		return o;
	};

	this.import = function (s) {
		var i, j, card, o;
		if (typeof s === "string") {
			o = JSON.parse(s);
		} else {
			o = s;
		}
		this.reset();
		this.add(getCardByNameOrId(o.identity));
		if (!this.identity) {
			return;
		}
		for (i in o.cards) {
			if (o.cards.hasOwnProperty(i)) {
				card = getCardByNameOrId(i);
				if (card) {
					for (j = 0; j < o.cards[i]; j++) {
						this.add(card);
					}
				}
			}
		}
	};

	this.textImport = function (s) {
		var lines = s.split("\n"),
			cards = [],
			warnings = [],
			foundIdentity = false,
			c, i, j, m, q;
		for (i = 0; i < lines.length; i++) {
			// Order of evaluation:
			// First, look for 3x Cardname
			// Second, look for Cardname x3
			// Finally, just match entire line
			m = lines[i].match(/^\s*(\d+)(.*)|^(.*)x\s*(\d+)|(.*)/);
			c = fuzzyMatch(m[2] || m[3] || m[5]);
			if (!c) { continue; }
			q = m[1] || m[4] || 1;
			if (c.name) {
				if (c.type === identity) {
					this.reset();
					foundIdentity = true;
					this.add(c);
				} else {
					cards.push({
						card: c,
						qty: q
					})
				}
			} else if (c.join) {
				warnings.push("Multiple matches found for \"" + lines[i] + "\": " + c.join(", "))
			}
		}

		if (foundIdentity) {
			for (i = 0; i < cards.length; i++) {
				for (j = 0; j < cards[i].qty; j++)
				this.add(cards[i].card);
			}
		} else {
			warnings.push("No identity found");
		}

		if (warnings.length) {
			return warnings;
		}
	};

	this.reset();
}

function getMinPoints(n) {
	return (Math.floor(n / 5) + 1) * 2;
}
