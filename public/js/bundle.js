(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
const TableModel = require('./table-model');
const TableView = require('./table-view');

const model = new TableModel();
const tableView = new TableView(model);
tableView.init();

},{"./table-model":4,"./table-view":5}],2:[function(require,module,exports){
const getRange = function(fromNum, toNum) {
  return Array.from({ length: toNum - fromNum + 1 },
    (unused, i) => i + fromNum);
};

const getLetterRange = function(firstLetter = 'A', numLetters) {
  const rangeStart = firstLetter.charCodeAt(0);
  const rangeEnd = rangeStart + numLetters - 1;
  return getRange(rangeStart, rangeEnd)
    .map(charCode => String.fromCharCode(charCode));
};

module.exports = {
  getRange: getRange,
  getLetterRange: getLetterRange
}

},{}],3:[function(require,module,exports){
const removeChildren = function(parentEl) {
  while (parentEl.firstChild) {
    parentEl.removeChild(parentEl.firstChild);
  }
};

const createEl = function(tagName) {
  return function(text) {
    const el = document.createElement(tagName);
    if (text) {
      el.textContent = text;
    }
    return el;
  };
};

const createTH = createEl('TH');
const createTR = createEl('TR');
const createTD = createEl('TD');

module.exports = {
  createTH: createTH,
  createTR: createTR,
  createTD: createTD,
  removeChildren: removeChildren,
}

},{}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
const { getLetterRange } = require('./array-util');
const { removeChildren, createTH, createTR, createTD } = require('./dom-util');

class TableView {
  constructor(model) {
    this.model = model;
  }

  init() {
    this.initDomReferences();
    this.initCurrentCell();
    this.renderTable();
    this.attachEventHandlers();
  }

  initDomReferences() {
    this.headerRowEl = document.querySelector('THEAD TR');
    this.sheetBodyEl = document.querySelector('TBODY');
    this.footerRowEl = document.querySelector('TFOOT TR');
    this.formulaBarEl = document.querySelector('#formula-bar');
    this.addColumnButton = document.querySelector('#addColumn');
    this.addRowButton = document.querySelector('#addRow');
  }

  initCurrentCell() {
    this.currentCellLocation = { col: 0, row: 0 };
    this.renderFormulaBar();
  }

  normalizeValueForRendering(value) {
    return value || '';
  }

  renderFormulaBar() {
    const currentCellValue = this.model.getValue(this.currentCellLocation);
    this.formulaBarEl.value = this.normalizeValueForRendering(currentCellValue);
    this.formulaBarEl.focus();
  }

  renderTable() {
    this.renderTableHeader();
    this.renderTableBody();
    this.renderTableFooter();
  }

  renderTableHeader() {
    // clear header row
    removeChildren(this.headerRowEl);
    // get letters and build elements
    getLetterRange('A', this.model.numCols)
      .map(colLabel => createTH(colLabel))
      .forEach(th => this.headerRowEl.appendChild(th));
  }


  isCurrentCell(col, row) {
    return this.currentCellLocation.row === row &&
      this.currentCellLocation.col === col;
  }

  renderTableBody() {
    const fragment = document.createDocumentFragment();
    for (let row = 0; row < this.model.numRows; row++) {
      const tr = createTR();
      for (let col = 0; col < this.model.numCols; col++) {
        const position = { col: col, row: row };
        const value = this.model.getValue(position);
        const td = createTD(value);

        if (this.isCurrentCell(col, row)) {
          td.className = 'current-cell';
        }

        tr.appendChild(td);
      }
      fragment.appendChild(tr);
    }
    removeChildren(this.sheetBodyEl);
    this.sheetBodyEl.appendChild(fragment);
  }

  renderTableFooter() {
    // clear header row
    removeChildren(this.footerRowEl);
    // get letters and build elements
    for (let col = 0; col < this.model.numCols; col++) {
      const position = { col: col, row: this.model.numRows };
      const value = this.model.getValue(position);
      const td = createTD(value);
      this.footerRowEl.appendChild(td);
    }
  }

  attachEventHandlers() {
    this.sheetBodyEl.addEventListener('click', this.handleSheetClick.bind(this));
    this.formulaBarEl.addEventListener('keyup', this.handleFormulaBarChange.bind(this));
    this.addColumnButton.addEventListener('click', this.handleAddColumn.bind(this));
    this.addRowButton.addEventListener('click', this.handleAddRow.bind(this));
  }

  handleAddColumn() {
    this.model.numCols++;
    this.renderTable();
  }

  handleAddRow() {
    this.model.numRows++;
    this.renderTable();
  }

  handleFormulaBarChange(evt) {
    const value = this.formulaBarEl.value;
    this.model.setValue(this.currentCellLocation, value);
    this.model.setValue(this.getFooterCellLocation(), this.sumColumn());
    this.renderTableBody();
    this.renderTableFooter();
  }

  getFooterCellLocation() {
    return { col: this.currentCellLocation.col, row: this.model.numRows };
  }

  sumColumn() {
    var sum = 0;
    for (var i = 0; i < this.model.numRows; i++) {
      var n = this.model.getValue({ col: this.currentCellLocation.col, row: i });

      if (n !== undefined && n != '') {
        sum += parseInt(n, 10);
      };
    }
    return sum
  }

  // this function is callled anytime a cell is clicked
  handleSheetClick(evt) {
    const col = evt.target.cellIndex;
    const row = evt.target.parentElement.rowIndex - 1;

    this.currentCellLocation = { col: col, row: row };
    this.renderTableBody();

    this.renderFormulaBar();
  }
}

module.exports = TableView;

},{"./array-util":2,"./dom-util":3}]},{},[1]);
