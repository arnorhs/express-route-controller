var ctrlr = require('ctrlr');


var allowedMethods = [ 'get', 'post', 'put', 'delete', 'patch', 'all' ];
module.exports = function(expressApp, config) {
	if (typeof config.routes !== 'object') {
		throw new Error('config.routes must be set to a valid route object map');
	}

	if (typeof config.controllers !== 'string') {
		throw new Error('config.controllers must be set to a valid directory path');
	}

	var controllers = ctrlr(config.controllers);

	function assignRoute(route, method, meta) {
		var method = (method || 'all').toLowerCase();
		if(allowedMethods.indexOf(method) === -1) throw new Error('Method: '+method+' - is not a valide method type');

		expressApp[method](route, function (req, res, next) {
			var action = meta.action.split('#');
			req.api = {
				'route': route,
				'controller': action[0],
				'action': action[1],
			};
			return next();
		});
		expressApp[method](route, controllers(meta.action));
	}

	for (var route in config.routes) {
		var meta = config.routes[route];

		if (typeof meta === 'string') {
			meta = { action: meta };
		}
		if (Array.isArray(meta.method)) {
			for( var m in meta.method){
				assignRoute(route, meta.method[m], meta);
			}
		}else{
			assignRoute(route, meta.method, meta);
		}
	}
};