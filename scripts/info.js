var corp = "Corporation",
	runner = "Runner",
	identity = "Identity",
	agenda = "Agenda",
	asset = "Asset",
	ice = "Ice",
	operation = "Operation",
	upgrade = "Upgrade",
	event = "Event",
	hardware = "Hardware",
	program = "Program",
	resource = "Resource",
	hb = "Haas-Bioroid",
	jin = "Jinteki",
	nbn = "NBN",
	wey = "Weyland",
	ana = "Anarchs",
	crim = "Criminal",
	shap = "Shapers",
	neut = "Neutral",
	cardTypes = {},
	factions = {},
	sides = {},
	setNames = {
		anr: "Android: NetRunner",
		gen1: "What Lies Ahead",
		gen2: "Trace Amount",
		gen3: "Cyber Exodus",
		gen4: "A Study in Static",
		gen5: "Humanity's Shadow",
		gen6: "Future Proof",
		cnc: "Creation & Control",
		spin1: "Opening Moves",
		spin2: "Second Thoughts",
		spin3: "Mala Tempora",
		spin4: "True Colors",
		spin5: "Fear and Loathing",
		spin6: "Double Time"
	}, // For backwards compatibility
	sets = {
		"Core": {
			anr: "Android: NetRunner"
		},
		"Genesis Cycle": {
			gen1: setNames.gen1,
			gen2: setNames.gen2,
			gen3: setNames.gen3,
			gen4: setNames.gen4,
			gen5: setNames.gen5,
			gen6: setNames.gen6
		},
		"Big Boxes": {
			cnc: setNames.cnc
		},
		"Spin Cycle": {
			spin1: setNames.spin1,
			spin2: setNames.spin2,
			spin3: setNames.spin3,
			spin4: setNames.spin4,
			spin5: setNames.spin5/*,
			spin6: setNames.spin6*/
		}
	}

sides[corp] = { name: "Corp", cardTypes: {}, factions: {} };
sides[runner] = { name: "Runner", cardTypes: {}, factions: {} };
sides[corp].cardTypes = [ identity, agenda, asset, ice, operation, upgrade ];
sides[runner].cardTypes = [ identity, event, hardware, program, resource ];
sides[corp].factions = [ hb, jin, nbn, wey, neut ],
sides[runner].factions = [ ana, crim, shap, neut ];
sides[corp].maxInfluence = 5;
sides[runner].maxInfluence = 5;
