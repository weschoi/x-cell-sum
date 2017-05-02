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
    let sum = 0;
    for (let i = 0; i < this.model.numRows; i++) {
      let n = this.model.getValue({ col: this.currentCellLocation.col, row: i });

      if (n !== undefined && n != '') {
        sum += parseInt(n, 10);
      };
    }
    return sum
  }

  handleSheetClick(evt) {
    const col = evt.target.cellIndex;
    const row = evt.target.parentElement.rowIndex - 1;

    this.currentCellLocation = { col: col, row: row };
    this.renderTableBody();

    this.renderFormulaBar();
  }
}

module.exports = TableView;
