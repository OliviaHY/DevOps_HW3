var redis = require('redis')
var multer  = require('multer')
var express = require('express')
var fs      = require('fs')
var app = express()
// REDIS
var client = redis.createClient(6379, '127.0.0.1', {})
///////////// WEB ROUTES

// client.set("string key", "string val", redis.print);

function proxy(req,res){
  client.rpoplpush("servers","temp",function(err,item){
    if (err) throw err;
    console.log(item)
    res.redirect("http://localhost:"+item+req.url);
  });
  client.rpoplpush("temp","servers")
}

app.get('/', function (req, res) {
  proxy(req,res);
});


app.get('/set', function(req, res) {
  proxy(req,res);
})

app.get('/get', function(req, res) {
  proxy(req,res);
});


// Add hook to make it easier to get all visited URLS.
// app.use(function(req, res, next) 
// {
// 	console.log(req.method, req.url);

// 	client.rpush("recent",req.protocol + "://" + req.get('host') + req.originalUrl);
//   client.ltrim("recent",0,4);
//   console.log(req.method,req.protocol + "://" + req.get('host') + req.originalUrl);
// 	next(); // Passing the request to the next handler in the stack.
// });


app.get('/recent', function(req, res) {
  proxy(req,res);
});



app.post('/upload',[ multer({ dest: './uploads/'}), function(req, res){
   console.log('req.body')
   console.log(req.body) // form fields
   console.log('req.files')
   console.log(req.files) // form files

   if( req.files.image )
   {
     console.log('in req.files.images')
	   fs.readFile( req.files.image.path, function (err, data) {
	  		if (err) throw err;
	  		var img = new Buffer(data).toString('base64');
	  		//console.log(img);
        client.lpush("images",img);

		});
	}
   res.status(204).end()
}]);

app.get('/meow', function(req, res) {
	
		proxy(req,res);
});

// HTTP SERVER
var server = app.listen(3002, function () {

  var host = server.address().address
  var port = server.address().port
  client.lpush("servers",3002)
  console.log('Proxy server listening at http://%s:%s', host, port)
})




