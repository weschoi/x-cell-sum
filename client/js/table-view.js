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
    removeChildren(this.footerRowEl);
    for (let col = 0; col < this.model.numCols; col++) {
      let columnSum = 0;
      for (let row = 0; row < this.model.numRows; row++) {
        const position = { col: col, row: row };
        const value = parseInt(this.model.getValue(position));
        if (!isNaN(value)) {
          columnSum += value;
        }
      }
      this.footerRowEl.appendChild(createTD(columnSum));
    }
  }

  sumColumn() {
    let columnSum = 0;
    for (let row = 0; row < this.model.numRows; row++) {
      let value = this.model.getValue({ col: this.currentCellLocation.col, row: row });

      if (value !== undefined && value != '' && !isNaN(value)) {
        columnSum += parseInt(value, 10);
      }
    }
    return columnSum
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
    this.renderTableBodyAfterAddRow();
  }

  renderTableBodyAfterAddRow() {
    const fragment = document.createDocumentFragment();

    const tr = createTR();
    for (let col = 0; col < this.model.numCols; col++) {
      const td = createTD('');
      tr.appendChild(td);
    }

    fragment.appendChild(tr);

    this.sheetBodyEl.appendChild(fragment);
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

  handleSheetClick(evt) {
    const col = evt.target.cellIndex;
    const row = evt.target.parentElement.rowIndex - 1;

    this.currentCellLocation = { col: col, row: row };
    this.renderTableBody();

    this.renderFormulaBar();
  }
}

module.exports = TableView;
