var vault = {};
vault.makeKey = function (s) {
	return "deck:" + s;
};
vault.friendlyName = function (s) {
	if (s.indexOf("deck:") === 0) {
		return s.substring(5);
	}
	return s;
};
if (false && window.chrome && chrome.storage) {
	vault.storage = chrome.storage.sync;
	vault.decks = {};
	vault.storage.get(null, function (o) {
		vault.decks = o;
		scope.decks = vault.getDecks();
		scope.$apply();
	});
	vault.store = function (deck, name) {
		var key = vault.makeKey(name),
			o = {};
		o[key] = deck.export();
		vault.storage.set(o);
		scope.decks = vault.getDecks();
		scope.$apply();
	};
	vault.retrieve = function (key) {
		return vault.decks[key];
	}
	vault.getDecks = function () {
		var keys = Object.keys(vault.decks),
			out = [],
			i,
			k,
			name = "";
		for (i = 0; i < keys.length; i++) {
			k = keys[i];
			name = vault.friendlyName(k);
			if (name !== k && vault.decks[k]) {
				out.push({name: name, key: k});
			}
		}
		out.sort(function (a, b) {
			return a.name > b.name ? 1 : -1;
		});
		return out;
	}
	vault.deleteDeck = function (key) {
		vault.storage.remove(key);
		// scope.decks[key] = undefined;
		// scope.$apply();
	}
} else {
	vault.store = function (deck, name) {
		if (!window.localStorage) {
			alert("This browser doesn't support local storage. You will be unable to save decks.");
			return;
		}
		var key = vault.makeKey(name),
			s = JSON.stringify(deck.export());
		if (s.indexOf("[object Object]") > -1) {
			alert("An error was encountered while preparing your deck to be saved. It has not been saved. Please email itoltz@gmail.com with details on what you were doing when you received this message");
		}
		localStorage.setItem(key, s);
	};
	vault.retrieve = function (key) {
		return localStorage[key];
	};
	vault.getDecks = function () {
		//Weird hack to make FF load localStorage correctly...
		localStorage.length;
		var keys = Object.keys(localStorage),
			out = [],
			i,
			k,
			name = "";
		for (i = 0; i < keys.length; i++) {
			k = keys[i];
			name = vault.friendlyName(k);
			if (name !== k && localStorage[k]) {
				out.push({name: name, key: k});
			}
		}
		out.sort(function (a, b) {
			return a.name > b.name ? 1 : -1;
		});
		return out;
	};
	vault.deleteDeck = function (key) {
		localStorage.removeItem(key);
	};
}