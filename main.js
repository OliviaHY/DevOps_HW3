var redis = require('redis')
var multer  = require('multer')
var express = require('express')
var fs      = require('fs')
var app = express()
// REDIS
var client = redis.createClient(6379, '127.0.0.1', {})

///////////// WEB ROUTES

// client.set("string key", "string val", redis.print);

app.get('/', function (req, res) {
  res.send('Hello There!');
});


app.get('/set', function(req, res) {
  client.set("key", "This message will self-destruct in 10 seconds");
  client.expire("key",10);
  res.end();
})

app.get('/get', function(req, res) {
  client.get("key",function(err, reply) {
    // reply is null when the key is missing
    //console.log("Hello");
    if(reply == null)
    {
      res.send('There is no value for key');
    }
    else
    {
      res.send(reply);
    }
    });
})


// Add hook to make it easier to get all visited URLS.
app.use(function(req, res, next) 
{
	console.log(req.method, req.url);

	client.rpush("recent",req.protocol + "://" + req.get('host') + req.originalUrl);
  client.ltrim("recent",0,4);
  console.log(req.method,req.protocol + "://" + req.get('host') + req.originalUrl);
	next(); // Passing the request to the next handler in the stack.
});


app.get('/recent', function(req, res) {
  client.lrange("recent",0,-1,function(err,reply)
  {
    console.log(reply);
    res.send(reply)
  });
})



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
	{
		//if (err) throw err
		res.writeHead(200, {'content-type':'text/html'});
		// items.forEach(function (imagedata) 
		// {
  //  		res.write("<h1>\n<img src='data:my_pic.jpg;base64,"+imagedata+"'/>");
		// });
    client.lpop("images",function(err,reply)
   {
    if (err) throw err
    console.log(reply);
    res.write("<h1>\n<img src='data:my_pic.jpg;base64,"+reply+"'/>");
    res.end();
   });
  }
})

// HTTP SERVER
var server = app.listen(3000, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)
})



