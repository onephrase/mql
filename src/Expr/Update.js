
/**
 * @imports
 */
import {
	Lexer
} from '../index.js';
import _mixin from '@onephrase/commons/js/mixin.js';
import _isArray from '@onephrase/commons/js/isArray.js';
import UpdateInterface from './UpdateInterface.js';
import Assignment from './Assignment.js';
import Base from '../Base/Base.js';
import Stmt from './Stmt.js';

/**
 * ---------------------------
 * Update class
 * ---------------------------
 */				

const Update = class extends _mixin(Stmt, UpdateInterface) {
	 
	/**
	 * @inheritdoc
	 */
	constructor(exprs, clauses) {
		super();
		this.exprs = exprs;
		this.clauses = clauses;
	}
	
	/**
	 * @inheritdoc
	 */
	eval(database) {
		// ---------------------------
		// INITIALIZE DATASOURCES WITH JOIN ALGORITHIMS APPLIED
		// ---------------------------
		var tables = (_isArray(this.exprs.table) ? this.exprs.table : [this.exprs.table]).concat(this.exprs.joins || []);
		tables = tables.map(table => table.eval(database))
		this.base = new Base(tables.shift(), this.exprs.where, ...tables);
		var rowCount = 0;
		while (this.base.next()) {
			var rowBase = this.base.fetch();
			this.exprs.assignments.forEach(assignment => assignment.eval(rowBase));
			rowCount ++;
		}
		return rowCount;
	}
	
	/**
	 * @inheritdoc
	 */
	toString(context = null) {
		return this.getToString(context, (clauseType, expr, clause) => {
			if (clauseType === 'assignments') {
				return clause + ' ' + expr.map(assignment => assignment.toString(context)).join(', ');
			}
		});
	}
	
	/**
	 * @inheritdoc
	 */
	static parse(expr, parseCallback, Static = Update) {
		if (expr.trim().substr(0, 6).toLowerCase() === 'update') {
			var stmtParse = super.getParse(expr, Static.clauses, parseCallback, (clauseType, _expr) => {
				if (clauseType === 'assignments') {
					return Lexer.split(_expr, [','])
						.map(assignment => parseCallback(assignment.trim(), [Assignment]));
				}
			});
			return new Static(stmtParse.exprs, stmtParse.clauses);
		}
	}
};

/**
 * @prop object
 */
Update.clauses = {
	table: 'UPDATE',
	assignments: 'SET',
	where: 'WHERE',
	// inner join, cross join, {left|right} [outer] join
	joins: '(INNER[ ]+|CROSS[ ]+|(LEFT|RIGHT)([ ]+OUTER)?[ ]+)?JOIN',
};

/**
 * @exports
 */
export default Update;
