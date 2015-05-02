function Card(args) {
	this.raw = args;
	this.agendaPoints = args.agendapoints || 0;
	this.att = (args.subtype || "").split(" - ");
	this.customInfluenceCalculation = args.customInfluenceCalculation;
	this.faction = args.faction;
	this.influence = args.factioncost || null;
	this.name = args.title;
	this.nriKey = args.code;
	this.qty = args.quantity || 3;
	this.set = args.setname;
	this.type = args.type;
	this.validate = args.validate || function () { return true; };
	this.side = args.side;

	if (this.type === identity) {
		this.minCards = args.minimumdecksize || 45;
		this.influenceAvailable = args.influencelimit || 15;
	}

	this.toString = function () {
		return this.name;
	};

	this.getInfluenceString = function (pad, qty) {
		var infString = "",	i;
		qty = qty || 1;
		if (this.influence !== null) {
			for (i = 0; i < this.influence * qty; i++) {
				infString += "\u25cf";
			}
			while (pad && (i < 5)) {
				infString += "\u25cb";
				i++;
			}
		}
		return infString;
	};
	this.getData = function () {
		return this.raw;
	};
}

var cards = [];
