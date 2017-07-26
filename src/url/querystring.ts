namespace gobi.url.querystring {
	function stringifyPrimitive(v: any): string {
		switch (typeof v) {
			case 'string':
				return v;

			case 'boolean':
				return v ? 'true' : 'false';

			case 'number':
				return isFinite(v) ? v : '';

			default:
				return '';
		}
	}

	export function encode(obj: any, sep?: string, eq?: string, name?: string) {
		sep = sep || '&';
		eq = eq || '=';
		if (obj === null) {
			obj = undefined;
		}

		if (typeof obj === 'object') {
			return Object.keys(obj).map(function (k) {
				let ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
				if (Array.isArray(obj[k])) {
					return obj[k].map(function (v: any) {
						return ks + encodeURIComponent(stringifyPrimitive(v));
					}).join(sep);
				} else {
					return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
				}
			}).join(sep);

		}

		if (!name) return '';
		return encodeURIComponent(stringifyPrimitive(name)) + eq +
			encodeURIComponent(stringifyPrimitive(obj));
	}


	export function decode(qs: string, sep?: string, eq?: string, options?: any) {
		sep = sep || '&';
		eq = eq || '=';
		let obj: { [key: string]: any } = {};

		if (typeof qs !== 'string' || qs.length === 0) {
			return obj;
		}

		let regexp = /\+/g;
		let qs_ = qs.split(sep);

		let maxKeys = 1000;
		if (options && typeof options.maxKeys === 'number') {
			maxKeys = options.maxKeys;
		}

		let len = qs_.length;
		// maxKeys <= 0 means that we should not limit keys count
		if (maxKeys > 0 && len > maxKeys) {
			len = maxKeys;
		}

		for (let i = 0; i < len; ++i) {
			let x = qs_[i].replace(regexp, '%20'),
				idx = x.indexOf(eq),
				kstr, vstr, k, v;

			if (idx >= 0) {
				kstr = x.substr(0, idx);
				vstr = x.substr(idx + 1);
			} else {
				kstr = x;
				vstr = '';
			}

			k = decodeURIComponent(kstr);
			v = decodeURIComponent(vstr);

			if (!obj.hasOwnProperty(k)) {
				obj[k] = v;
			} else if (Array.isArray(obj[k])) {
				obj[k].push(v);
			} else {
				obj[k] = [obj[k], v];
			}
		}

		return obj;
	}
}
