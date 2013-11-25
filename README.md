## express-route-controller

This is a helper function to assign controller actions to routes
in [express](http://expressjs.com/) (Not sure if it works with connect as well).

It provides just a tiny bit of structure on top of a normal express app, but also
doesn't get in the way at all, and you can continue to use express normally and
define even more routes manually if you wish.

### Usage:

In your express project install express-route-controller:

```
npm install express-route-controller
```

Now create a folder where you want all your controllers, eg. `controllers`, and add a file in there,
named `mycontroller.js`. Then define it somehow, like so:

```
module.exports = {
    myaction: function(req, res) {
    },
    myotheraction: function(req, res) {
    }
};
```

In your main app.js file (or wherever you set up express routes normally) simply call the helper
function (very sparse demo express app):

```
var express = require('express');
var app = express();
var erc = require('express-route-control');

// set up express route control:
erc(app, {
    controllers: __dirname + '/controllers',
    routes: {
        '/fetch_hotdogs': 'mycontroller#myaction',
        '/save_hotdogs': { action: 'mycontroller#myotheraction, method: 'post' }
    }
});

app.listen(3000);
```

You can make this even more easier, by defining your routes in a `routes.json` file, like so:
```
{
    "/fetch_hotdogs": "mycontroller#myaction",
    "/save_hotdogs": { "action": "mycontroller#myotheraction, "method": "post" }
}
```

And loading the routes is as simple as:

```
...

erc(app, {
    controllers: __dirname + '/controllers',
    routes: require('routes.json')
});

...
```

### Feedback

Pull requests, feature ideas and bug reports are welcome

### License

MIT

