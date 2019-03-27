//
// hello-mongoose: MongoDB with Mongoose on Node.js example on Heroku.
// Mongoose is a object/data mapping utility for the MongoDB database.
//

// by Ben Wen with thanks to Aaron Heckmann

//
// Copyright 2015 ObjectLabs Corp.  
// ObjectLabs operates MongoLab.com a MongoDb-as-a-Service offering
//
// MIT Licensed
//

// Permission is hereby granted, free of charge, to any person
// obtaining a copy of this software and associated documentation files
// (the "Software"), to deal in the Software without restriction,
// including without limitation the rights to use, copy, modify, merge,
// publish, distribute, sublicense, and/or sell copies of the Software,
// and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:  

// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software. 

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
// BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
// CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE. 

//
// Preamble
var http = require ('http');	     // For serving a basic web page.
var mongoose = require ("mongoose"), // The reason for this demo.
    express  = require('express'),
    app = express(),
    bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended: false}));
// Here we find an appropriate database to connect to, defaulting to
// localhost if we don't find one.  
var uristring = 
  process.env.MONGODB_URI || 
  'mongodb://localhost/HelloMongoose';

// The http server will listen to an appropriate port, or default to
// port 5000.
var theport = process.env.PORT || 5000;

mongoose.connect(uristring, function (err, res) {
  if (err) { 
    console.log ('ERROR connecting to: ' + uristring + '. ' + err);
  } else {
    console.log ('Succeeded connected to: ' + uristring);
  }
});


var GameEntrySchema = new mongoose.Schema({
  gameId: { type: String, required: true },
  player: { type: String, required: true },
  score:  { type: Number, required: true },
  scope:  String,
  createdAt: { type: Date, 'default': Date.now }
});

var GameEntry = mongoose.model('GameEntry', GameEntrySchema);

function getList(gameId, options, cb) {
  options = options || {};
  var query = GameEntry.find({ gameId: gameId }, null, {})
    .lean()
    .sort({ score: options.order || -1 })
    .limit(options.limit || 10);
  if (options.scope) {
    query.where('scope', options.scope );
  }
  query.exec(cb);
}

function addToList(gameId, attributes, cb) {
  var item = new GameEntry(attributes);
  item.set('gameId', gameId);
  item.save(cb);
}


app.get('/:gameId', function(req, res) {
  var options = {
    order: req.query.reverse ? -1 : 1,
    limit: req.query.limit || 10,
    scope: req.query.scope || null
  };
  getList(req.params.gameId, options, function(err, items) {
    res.header('Access-Control-Allow-Origin', '*');
    res.type('application/json');
    if (err) {
      res.jsonp(400, { error: err.message });
    } else {
      res.jsonp({ items: items });
    }
  });
});

app.post('/:gameId', function(req, res) {
  addToList(req.params.gameId, req.body, function(err) {
    res.header('Access-Control-Allow-Origin', '*');
    res.type('application/json');
    if (err) {
      res.send(500, { error: err.message || 'Undefined error' });
    } else {
      res.send({ success: true });
    }
  });
});

app.listen(theport);
console.log("Started server at 172.0.0.1:8181");
