angular.module('cardController', ['ngSanitize']);

// Note that the consts have to be strings, because that's what the form elements end up setting the values to
var // Preview type
	NONE			= "0",
	TEXT_ONLY		= "1",
	IMAGES_ONLY		= "2",
	IMAGES_AND_TEXT	= "3",
	// Preview behavior
	ON_HOVER		= "1",
	ON_CLICK		= "2";

function cardController($scope) {
	window.scope = $scope;
	$scope.bodyHeight = 0;
	$scope.deck = new Deck();
	$scope.decks = window.vault.getDecks();
	$scope.previewLink = "";
	// $scope.setCheckState = {};
	$scope.showAttributes = false;
	$scope.showSets = false;
	$scope.sides = sides;
	$scope.sides[corp].checkState = {};
	$scope.sides[runner].checkState = {};
	$scope.vault = window.vault;
	$scope.maxInfluenceOptions = [0, 1, 2, 3, 4, 5];
	$scope.deckImportModalShown = false;
	$scope.importText = "";
	$scope.importWarningsShown = false;
	$scope.importWarnings = [];
	$scope.previewImage = "";
	$scope.previewType = IMAGES_AND_TEXT;
	$scope.previewBehavior = ON_HOVER;

	Ajax.getAllCards();

	var i, j;
	// for (i in $scope.sets) {
	// 	if (!$scope.sets.hasOwnProperty(i)) { continue; }
	// 	for (j in $scope.sets[i]) {
	// 		if ($scope.sets[i].hasOwnProperty(j)) {
	// 			$scope.setCheckState[$scope.sets[i][j]] = true;
	// 		}
	// 	}
	// }

	$scope._persist = function () {
		// Note to self: If you're looking for how to force an update, use scope.$apply(). Don't use that inside the cardController, though.
		// Any weird stuff that needs to be done on redraw/refresh
		if ($scope.deckScrollPosition) {
			document.getElementById("deckScrollContainer").scrollTop = $scope.deckScrollPosition;
			// When Angular redraws, it does so many times. Wait 1/10th of a second before clearing the variable so that it's available to all the redraws.
			setTimeout(function () {
				$scope.deckScrollPosition = null;
			}, 100);
		}
	};
	$scope.addCard = function (c) {
		$scope.setDeckScroll();
		$scope.deck.add(c);
	};
	$scope.clearFilters = function (side) {
		var i;
		for (i in side.checkState) {
			if (side.checkState.hasOwnProperty(i)) {
				side.checkState[i] = false;
			}
		}
		side.maxInfluence = 5;
	};
	$scope.deleteDeck = function (deck) {
		$scope.vault.deleteDeck(deck.key);
		$scope.decks = $scope.vault.getDecks();
	};
	$scope.getCards = function (faction, type) {
		var toReturn = [], i, c;
		for (i = 0; i < cards.length; i++) {
			c = cards[i];
			if (c.type === type && c.faction === faction) {
				toReturn.push(c);
			}
		}
		return toReturn;
	};
	$scope.getCardFaction = function (card) {
		$scope._persist();
		card = getCardByNameOrId(card);
		return card.faction;
	};
	$scope.getInfluenceString = function (card, qty) {
		card = getCardByNameOrId(card);
		return card.getInfluenceString(false, qty);
	};
	$scope.getCardName = function (card) {
		card = getCardByNameOrId(card);
		return card.name;
	};
	$scope.getSubLine = function (card) {
		var toReturn = [],
			attributes = [],
			i,
			a = card.att;
		
		if (card.type === agenda) {
			toReturn.push(card.agendaPoints + " points");
		} else if (card.influence > 0) {
			toReturn.push(card.getInfluenceString(true));
		}

		for (i = 0; i < a.length; i++) {
			toReturn.push(a[i]);
		}

		if (card.qty !== 3) {
			toReturn.push("Core: x" + card.qty);
		}

		if ($scope.showAttributes) {
			(attributes.length > 0) ?  toReturn.push("Attributes: " + attributes.join(", ")) : toReturn.push("(no attributes)");
		}

		if ($scope.showSets) {
			toReturn.push("Set: " + card.set);
		}

		return toReturn.join(" - ");
	};
	$scope.getQty = function (card) {
		card = getCardByNameOrId(card);
		
		var retVal = $scope.deck.cards[card.nriKey] || 0;
		if (card.type === identity
			&& $scope.deck.identity
			&& $scope.deck.identity.name === card.name) {
			retVal = 1;
		}

		return retVal;
	};
	$scope.getMaxDeckHeight = function () {
			var height = document.documentElement.clientHeight - 150;

			if (deck.identity && deck.identity.side === corp) {
				// Subtract 20 for corp for the agenda line
				height -= 20;
			}

			if ($scope.previewType === IMAGES_ONLY || $scope.previewType === IMAGES_AND_TEXT) {
				height -= 418;
			} else if ($scope.previewType === TEXT_ONLY) {
				height -= 300;
			}


		return Math.max(height, 100);
	};
	$scope.getTableFilterClass = function (side) {
		var i, filters = [];
		for (i in side.checkState) {
			if (side.checkState[i] === true) {
				filters.push("filter-" + i);
			}
		}
		if (filters.length === 0) {
			filters.push("noFilter");
		}
		return filters.join(" ");
	};
	$scope.importDecklist = function () {
		var warnings = scope.deck.textImport(scope.importText);
		if (warnings) {
			scope.showImportWarnings(warnings);
		} else {
			scope.deckImportModalShown = false;
		}
	};
	$scope.isAddable = function (card) {
		// Identities are always addable
		if (card.type === identity) {
			return true;
		}
		var id = $scope.deck.identity;
		// Otherwise, only addable if the deck has an identity and it's the right side
		// Further, for agendas, only in-faction and neutral are addable
		if (id && id.side === card.side && id.validate(card)) {
			if (card.type === agenda) {
				return (card.faction === neut || card.faction === id.faction);
			}
			return true;
		}
		return false;
	};
	$scope.isFiltered = function (card) {
		var i,
			types = card.att,
			anyFilter = false,
			thisFilter = false,
			filterState = sides[card.side].checkState;

		// If this card's set is unchecked, it should always be hidden
		// if (!$scope.setCheckState[card.set]) {
		// 	return false;
		// }

		// If an identity of this card's faction is chosen,
		// and this card is from a different faction,
		// and it has an influence cost higher than current allowed setting,
		// then it should be hidden
		if (
			$scope.deck.identity
			&& $scope.deck.identity.side === card.side
			&& $scope.deck.identity.faction !== card.faction
			&& card.influence > $scope.sides[card.side].maxInfluence
		) {
			return false;
		}

		// If any of the card's types are checked, then it should be shown
		for (i = 0; i < types.length; i++) {
			if (filterState[types[i]]) {
				return true;
			}
		}

		// Else if none of the checkboxes are checked, then it should be shown
		for (i in filterState) {
			if (filterState.hasOwnProperty(i) && filterState[i]) {
				// console.log(filterState, card.side, card.name)
				return false;
			}
		}
		// console.log(filterState, card.side, card.name)
		return true;
	};
	$scope.loadDeck = function (deck) {
		$scope.deck.import($scope.vault.retrieve(deck.key));
		$scope.deck.name = deck.name;
		$scope.setBase(deck);
	};
	// $scope.massToggle = function (block, checked) {
	// 	var sets = scope.sets[block],
	// 		setKey, setName;

	// 	for (setKey in sets) {
	// 		if (!sets.hasOwnProperty(setKey)) { continue; }
	// 		setName = sets[setKey];
	// 		$scope.setCheckState[setName] = checked;
	// 	}
	// };
	$scope.newDeck = function (deck) {
		$scope.deck.reset();
		$scope.deck.name = null;
	};
	$scope.previewClick = function (card) {
		$scope.previewBehavior = ON_CLICK;
		$scope.previewSet(card);
	};
	$scope.previewHover = function (card) {
		if ($scope.previewBehavior === ON_HOVER) {
			$scope.previewSet(card);
		}
	};
	$scope.previewSet = function (card) {
		var data;
		if (typeof card === "string") {
			card = getCardByNameOrId(card);
			if (card) {
				data = card.getData();
			} else {
				return;
			}
		} else {
			data = card.getData();
		}

		if ($scope.previewType === IMAGES_AND_TEXT || $scope.previewType === TEXT_ONLY) {
			$scope.previewText = formatCard(data);
		} else {
			$scope.previewText = "";
		}

		if ($scope.previewType === IMAGES_AND_TEXT || $scope.previewType === IMAGES_ONLY) {
			$scope.previewImage = "http://netrunnerdb.com" + data.imagesrc;
		} else {
			$scope.previewImage = "";
		}
	};
	$scope.removeCard = function (cardKey) {
		$scope.setDeckScroll();
		$scope.deck.remove(cardKey);
	};
	$scope.saveDeck = function () {
		var name = $scope.deck.name || $scope.deck.identity.name;
		$scope.vault.store($scope.deck, name);
		$scope.decks = $scope.vault.getDecks();
		$scope.deck.name = name;
	};
	$scope.setBase = function (deck) {
		$scope.deck.setBase($scope.vault.retrieve(deck.key));
		$scope.deck.base.name = deck.name;
	};
	$scope.setDeckScroll = function () {
		$scope.deckScrollPosition = document.getElementById("deckScrollContainer").scrollTop;
	};
	$scope.showImportWarnings = function (warnings) {
		scope.importWarnings = warnings;
		scope.importWarningsShown = true;
	};

	var base = "Little Chiba - ",
		subs = [
			"Your Deck Chop Shop",
			"No Trolls Allowed",
			"Don't Run from the Shadows",
			"A Decker's Dream",
			"Console Cowboys Welcome",
			"G-mods Use Rear Entrance"
		],
		i = Math.floor(Math.random() * subs.length);
	document.title = base + subs[i];

	// Give the page a second to load and then set the minHeight of body, so when we filter it doesn't jump around
	setTimeout(function () {
		$scope.bodyHeight = document.body.offsetHeight - document.body.style.paddingTop;
	}, 1000);
};