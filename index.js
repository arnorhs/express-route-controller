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
		if(allowedMethods.indexOf(method) === -1) throw new Error('Method: '+method+' - is not a valid method type');
		var action = meta.action.split('#');

		function attachApi(req, res, next) {
			req.api = {
				'route': route,
				'controller': action[0],
				'action': action[1],
			};
			next();
		};
		function checkPolicies(req, res, next){
			if(app.config.policies && (app.config.policies[action[0]] || app.config.policies['*'])){
				var CPolicies = app.config.policies[action[0]] || {};
				var policies = [].concat(app.config.policies['*'], CPolicies['*'], CPolicies[action[1]]);
					policies = _.chain(policies).compact().uniq().value();
				console.log(policies);
				return async.each(
					policies,
					function (p, done){
						if(app.policies[p]){
							app.policies[p](req, res, function(){ return done(res.headersSent); });
						}else{
							console.log(p, "is not a valid policy.");
							done();
						}
					},
					function(){ if(!res.headersSent) return next(); });
			}else{ return next(); }
		}
		expressApp[method](route, attachApi, checkPolicies, controllers(meta.action));
	}

	for (var route in config.routes) {
		var meta = config.routes[route];

		if (typeof meta === 'string') {
			meta = { action: meta };
		}else if(!meta.action.match(/#/i)){
			meta.action = meta.controller+'#'+meta.action;
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