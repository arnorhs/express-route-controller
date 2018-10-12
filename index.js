var ctrlr = require('ctrlr');
var _ = require('lodash');

var allowedMethods = ['get', 'post', 'put', 'delete', 'patch', 'all'];
module.exports = function(expressApp, config) {
	if (typeof config.routes !== 'object') {
		throw new Error('config.routes must be set to a valid route object map');
	}

	var controllers;

	if (typeof config.controllers === 'object') {
		controllers = function(action) {
			var c = _.get(config.controllers, action.split('#'));
			if (!c) {
				throw new Error(action.replace('.', '.'), "doesn't exist.");
			}
			return c;
		};
	} else if (typeof config.controllers !== 'string') {
		throw new Error('config.controllers must be set to a valid directory path');
	} else {
		var controllers = ctrlr(config.controllers);
	}

	config.logs = [].concat(config.logs);
	var logs = {
		policies: !!config.logs.indexOf('policies'),
	};

	function assignRoute(route, method, meta) {
		var method = (method || 'all').toLowerCase();
		if (allowedMethods.indexOf(method) === -1)
			throw new Error('Method: ' + method + ' - is not a valid method type');
		var action = meta.action.split('#');

		function attachApi(req, res, next) {
			req.api = {
				route: route,
				controller: action[0],
				action: action[1],
			};
			next();
		}
		function checkPolicies(req, res, next) {
			const actionConfig = _.get(app, `config.policies.${action[0]}`);
			const hasConfig = actionConfig || _.get(app, 'config.policies.*');
			if (hasConfig) {
				var CPolicies = actionConfig || {};
				var policies = [].concat(
					app.config.policies['*'],
					CPolicies['*'],
					CPolicies[action[1]]
				);
				policies = _.chain(policies)
					.compact()
					.uniq()
					.filter(
						(item, index, array) =>
							!array.includes(`!${item}`) && !item.includes('!')
					)
					.value();
				return async.eachSeries(
					policies,
					function(p, done) {
						if (res.headersSent) {
							done('Headers Sent');
						} else if (app.policies[p]) {
							app.policies[p](req, res, function() {
								return done(res.headersSent);
							});
						} else {
							console.log(p, 'is not a valid policy.');
							done();
						}
					},
					function() {
						if (!res.headersSent) {
							return next();
						}
					}
				);
			} else {
				return next();
			}
		}

		expressApp[method](
			route,
			attachApi,
			checkPolicies,
			controllers(meta.action)
		);
	}

	for (var route in config.routes) {
		var meta = config.routes[route];

		if (typeof meta === 'string') {
			meta = { action: meta };
		} else if (!meta.action.match(/#/i)) {
			meta.action = meta.controller + '#' + meta.action;
		}
		if (Array.isArray(meta.method)) {
			for (var m in meta.method) {
				assignRoute(route, meta.method[m], meta);
			}
		} else {
			assignRoute(route, meta.method, meta);
		}
	}
};
