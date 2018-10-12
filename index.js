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
		if (allowedMethods.indexOf(method) === -1) {
			throw new Error(`Method: ${method} - is not a valid method type`);
		}
		const [controller, action] = meta.action.split('#');

		function attachApi(req, res, next) {
			req.api = {
				route: route,
				controller,
				action,
			};
			next();
		}
		function checkPolicies(req, res, next) {
			const CPolicies = _.get(app, `config.policies.${controller}`);
			if (!CPolicies || !app.config.policies['*']) {
				return next();
			}

			const policies = _.chain([])
				.concat(app.config.policies['*'], CPolicies['*'], CPolicies[action])
				.compact()
				.uniq()
				.filter(
					(item, index, array) =>
						!array.includes(`!${item}`) && !item.includes('!')
				)
				.value();

			return async.each(
				policies,
				function(p, done) {
					if (res.headersSent) {
						return done('Headers Sent');
					}
					if (app.policies[p]) {
						return app.policies[p](req, res, () => done(res.headersSent));
					}

					console.log(p, 'is not a valid policy.');
					done();
				},
				function() {
					if (!res.headersSent) {
						return next();
					}
				}
			);
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
