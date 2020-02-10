
/**
 * @imports
 */
import {
	_avg,
	_unique,
	_max,
	_min,
	_sum,
	_rand
} from '@onephrase/commons/src/Arr.js';
import {
	_isNull
} from '@onephrase/commons/src/Js.js';
import {
	_after
} from '@onephrase/commons/src/Str.js';

/**
 * ---------------------------
 * Row class
 * ---------------------------
 */				

const Row = class {
	 
	/**
	 * @inheritdoc
	 */
	CONCAT(...args) {
		return args.join('');
	}
	 
	/**
	 * @inheritdoc
	 */
	CONCAT_WS(...args) {
		return args.join(args.shift());
	}
	
	/**
	 * ----------------
	 * AGGREGATE FUNCTIONS
	 * ----------------
	 */
	
	/**
	 * @inheritdoc
	 */
	COUNT(rows, column) {
		if (column.toString() === '*') {
			return rows.length;
		}
		if (arguments.length === 3 && column.toString().toUpperCase() === 'DISTINCT') {
			var vals = _unique(this.COLUMN(rows, arguments[2]));
		} else {
			var vals = this.COLUMN(rows, column);
		}
		return vals.filter(v => !_isNull(v)).length;
	}
	
	/**
	 * @inheritdoc
	 */
	GROUP_CONCAT(rows, column) {
		return this.COLUMN(rows, column).join('');
	}
	
	/**
	 * @inheritdoc
	 */
	GROUP_CONCAT_WS(rows, separator, column) {
		return this.COLUMN(rows, column).join(separator.eval(this));
	}
	
	/**
	 * @inheritdoc
	 */
	AVG(rows, column) {
		return _avg(this.COLUMN(rows, column));
	}
	
	/**
	 * @inheritdoc
	 */
	MAX(rows, column) {
		return _max(this.COLUMN(rows, column));
	}
	
	/**
	 * @inheritdoc
	 */
	MIN(rows, column) {
		return _min(this.COLUMN(rows, column));
	}
	
	/**
	 * @inheritdoc
	 */
	SUM(rows, column) {
		return _sum(this.COLUMN(rows, column));
	}

	/**
	 * ----------------
	 * AGGREGATE SUPPORT FUNCTIONS
	 * ----------------
	 */
	
	/**
	 * @inheritdoc
	 */
	ANY_VALUE(rows, column) {
		return _rand(this.COLUMN(rows, column));
	}
	
	/**
	 * @inheritdoc
	 */
	GROUPING(rows, ...onColumns) {
		if (!this.AGGR || !this.AGGR.isRollup) {
			return 0;
		}
		return onColumns.reduce((cum, column, i) => {
			var match = this.AGGR.by.filter(by => {
				var byStr = by.toString();
				var columnStr = column.toString();
				if (columnStr.indexOf('.') === -1 && byStr.indexOf('.') > -1) {
					byStr = _after(byStr, '.');
				}
				return columnStr === byStr;
			});
			return match.length ? i + 1 : cum;
		}, 0);
	}
	
	/**
	 * @inheritdoc
	 */
	COLUMN(rows, arg) {
		return rows.map(row => arg.eval(row));
	}
	
	/**
	 * @inheritdoc
	 */
	COLUMNS(rows, args) {
		return args.map(arg => this.COLUMN(rows, arg));
	}
};

/**
 * @exports
 */
export default Row;
