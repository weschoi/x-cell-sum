class TableModel {
	constructor(numCols = 10, numRows = 20) {
		this.numCols = numCols;
		this.numRows = numRows;
		this.data = {};
	}

	_getCellId(location) {
		return `${location.col}:${location.row}`;
	}

	getValue(location) {
		return this.data[this._getCellId(location)];
	}

	setValue(location, value) {
		this.data[this._getCellId(location)] = value;
	}
}

module.exports = TableModel;

// Trying to understand this
/*
const model = new TableModel();
const location = { row: 3, col: 5 };


const trial = model._getCellId(location);

console.log(trial);


console.log(model.getValue(location));
model.setValue(location, 'foo');
console.log(model.getValue(location));
console.log(model.data[trial] === 'foo');
console.log(model.data[5:3]==='foo');
*/
