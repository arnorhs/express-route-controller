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

```javascript
module.exports = {
    myaction: function(req, res) {
    },
    myotheraction: function(req, res) {
    }
};
```

In your main app.js file (or wherever you set up express routes normally) simply call the helper
function (very sparse demo express app):

```javascript
var express = require('express');
var app = express();
var erc = require('express-route-controller');

// set up express route control:
erc(app, {
    controllers: __dirname + '/controllers',
    routes: {
        '/fetch_hotdogs': 'mycontroller#myaction',
        '/save_hotdogs': { action: 'mycontroller#myotheraction', method: 'post' }
    }
});

app.listen(3000);
```

You can make this even more easier, by defining your routes in a `routes.json` file, like so:
```json
{
    "/fetch_hotdogs": "mycontroller#myaction",
    "/save_hotdogs": { "action": "mycontroller#myotheraction", "method": "post" }
}
```

And loading the routes is as simple as:

```javascript
...

erc(app, {
    controllers: __dirname + '/controllers',
    routes: require('routes.json')
});

...
```

### Feedback

Pull requests, feature ideas and bug reports are welcome

### Todo

- Figuring out a way to deal with middleware, for non-gloabl type of middleware
- It would be nice to figure out a way to add unit tests
- Possibly there should be an easy mode for everybody who wants to use the defaults. Either that
  or having the basepath as a spearate variable and including a routes.json file if the routes argument
  passed is a string rather than an object
- It would be nice to have a command line utility to genearte the controllers. Possibly with a
  `res.send('name of action');` in the function body

### License

MIT

