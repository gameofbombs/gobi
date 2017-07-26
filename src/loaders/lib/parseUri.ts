namespace gobi.loaders.lib {
	export function parseUri(str: string, opts: any): any {
		opts = opts || {};

		let o = {
			key: ['source', 'protocol', 'authority', 'userInfo', 'user', 'password', 'host', 'port', 'relative', 'path', 'directory', 'file', 'query', 'anchor'],
			q: {
				name: 'queryKey',
				parser: /(?:^|&)([^&=]*)=?([^&]*)/g
			},
			parser: {
				strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
				loose: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
			}
		};

		const m = o.parser[opts.strictMode ? 'strict' : 'loose'].exec(str)
		const uri: any = {};
		let i = 14;

		while (i--) uri[o.key[i]] = m[i] || '';

		uri[o.q.name] = {};
		uri[o.key[12]].replace(o.q.parser, function (t0: any, t1: any, t2: any) {
			if (t1) uri[o.q.name][t1] = t2
		});

		return uri;
	}
}
