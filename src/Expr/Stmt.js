
/**
 * @imports
 */
import {
	Lexer
} from '../index.js';
import _isArray from '@onephrase/commons/js/isArray.js';
import _each from '@onephrase/commons/obj/each.js';
import _find from '@onephrase/commons/obj/find.js';
import Table from './Table.js';

/**
 * ---------------------------
 * Delete class
 * ---------------------------
 */				

const Stmt = class {
	
	/**
	 * @inheritdoc
	 */
	getToString(context, callback) {
		var strArray = [];
		_each(this.exprs, (clauseType, expr) => {
			var str = null;
			var clause = this.clauses[clauseType];
			if (clauseType === 'joins') {
				str = expr.map((join, i) => clause[i] + ' ' + join.toString(context)).join(' ');
			} else if (clauseType === 'table') {
				str = clause + ' ' + (
					_isArray(expr) ? expr.map(table => table.toString(context)).join(', ') : expr.toString(context)
				);
			} else if (!callback || !(str = callback(clauseType, expr, clause))) {
				str = clause + ' ' + expr.toString(context);
			}
			strArray.push(str);
		});
		return strArray.join(' ');
	}
	
	/**
	 * @inheritdoc
	 */
	static getParse(expr, stmtClauses, parseCallback, callback) {
		// Match clauses; case-insensitively
		var useRegex = 'i';
		var parse = Lexer.lex(expr, Object.values(stmtClauses), {useRegex:useRegex});
		if (parse.matches.length) {
			var exprs = {};
			var clauses = {};
			parse.matches.forEach((clause, i) => {
				var clauseType = _find(stmtClauses, c => clause.match(new RegExp(c, useRegex)), true/*deep*/);
				var _expr = parse.tokens[i + 1].trim();
				var _exprParse = null;
				if (clauseType === 'joins') {
					var _exprParse = parseCallback(_expr);
					if (_exprParse.type = clause.match(new RegExp('(INNER|CROSS|LEFT|RIGHT)', 'i'))) {
						_exprParse.type = _exprParse.type[0].toLowerCase();
					}
					if (!exprs[clauseType]) {
						exprs[clauseType] = [_exprParse];
						clauses[clauseType] = [clause];
					} else {
						exprs[clauseType].push(_exprParse);
						clauses[clauseType].push(clause);
					}
				} else {
					if (clauseType === 'table') {
						var tables = Lexer.split(_expr, [',']).map(
							table => parseCallback(table.trim(), [Table])
						);
						var _exprParse = tables.length === 1 ? tables[0] : tables;
					} else if (!callback || !(_exprParse = callback(clauseType, _expr))) {
						var _exprParse = parseCallback(_expr);
					}
					exprs[clauseType] = _exprParse;
					clauses[clauseType] = clause;
				}
			});
			return {exprs:exprs, clauses:clauses};
		}
	}
};

/**
 * @exports
 */
export default Stmt;
