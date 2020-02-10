
/**
 * @imports
 */
import {
	Call as _Call
} from '@onephrase/jsen';
import {
	_isUndefined,
	_isFunction
} from '@onephrase/commons/src/Js.js';

/**
 * ---------------------------
 * Call class
 * ---------------------------
 */				

const Call = class extends _Call {
	 
	/**
	 * @inheritdoc
	 */
	eval(context = null, callback = null) {
		return this.evalWith(context, this.args.eval(context, callback));
	}
	 
	/**
	 * @inheritdoc
	 */
	evalWith(context, args, callback = null) {
		var reference = this.reference.getEval(context, callback);
		if (!_isUndefined(reference.name)) {
			// -----------------------------
			if (_isFunction(callback)) {
				return callback(this, reference.context, reference.name, args);
			}
			// -----------------------------
			if (_isFunction(reference.context[reference.name.toUpperCase()])) {
				return reference.context[reference.name.toUpperCase()](...args);
			}
			throw new Error('"' + reference.name + '()" called on ' + typeof reference.context + '!');
		}
	}
	
	/**
	 * @inheritdoc
	 */
	static parse(expr, parseCallback, Static = Call) {
		return super.parse(expr, parseCallback, Static);
	}
}

/**
 * @exports
 */
export default Call;
