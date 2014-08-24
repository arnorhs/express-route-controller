var ctrlr = require('ctrlr');

module.exports = function(expressApp, config) {
    if (typeof config.routes !== 'object') {
        throw new Error('config.routes must be set to a valid route object map');
    }

    if (typeof config.controllers !== 'string') {
        throw new Error('config.controllers must be set to a valid directory path');
    }

    var controllers = ctrlr(config.controllers);
    var methods = ['get', 'head', 'post', 'put', 'delete', 'trace', 'options', 'connect', 'path'];

    for (var route in config.routes) {
        var meta = config.routes[route];

        if (typeof meta === 'string') { 
            expressApp.get(route, controllers(meta));
            continue;
        }

        for (var i = 0; i < methods.length; i++) 
            if (meta[methods[i]]) 
                expressApp[methods[i]](route, controllers(meta[methods[i]]));
    }
};