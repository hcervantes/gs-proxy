var fs = require('fs'),
    jwt = require('jsonwebtoken'),
    express = require('express'),
    app = express(),
    headerFn = require('./headerFunctions');

var proxyFn = require('./proxy_functions');





// This responds with "Hello World" on the homepage
app.get('/', function (req, res) {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write('<h1>Token Generator</h1><p>Use <a href="/token">/token</a></p>');
  res.end();
})

// This responds a POST request for the homepage
app.post('/', function (req, res) {
   console.log("Got a POST request for the homepage");
   res.send('Hello POST');
})

// This responds a DELETE request for the /del_user page.
app.delete('/del_user', function (req, res) {
   console.log("Got a DELETE request for /del_user");
   res.send('Hello DELETE');
})

// This responds a GET request for the /list_user page.
app.get('/token', function (req, res) {
  
    // Generate token
    // sign with RSA SHA256
    var jwtPayload = JSON.parse(fs.readFileSync('exampleJWT.json'));
    var cert = fs.readFileSync('private.key');  // get private key
    //var token = jwt.sign(jwtPayload, cert);
    var token = jwt.sign(jwtPayload, 'secret', { expiresIn: '1h' });
    
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write(token.toString());
    res.end();
})

// Validate token in header
app.get('/validate', function(req, res) {   
    console.log("Got a GET request for /validate");

    // Get the token from headers and validate
    var token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token'];
    if(token == undefined){
        console.log("Token is not defined: ");
        // Write output to screen
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write('<h1>Token is not defined!</h1>');
        res.end();
        return;
    }
    //console.log('token: ' + token);

    var token = headerFn.verifyToken(token);
       
    if(token.PKI_GROUPS == undefined){
        console.log("Error with token: " + token.err);
        // Write output to screen
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write('<h1>Token is invalid!</h1><p>Error with token: ' + token.err.message + '</p>');
        res.end();
        return;
    }
    else{
        var visas = token.PKI_GROUPS.visas;
        console.log(visas) 
        // Write output to screen
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write('<h1>Token is valid!</h1>');
        res.end();
    }

});

var server = app.listen(5060, function () {

   var host = server.address().address
   var port = server.address().port

   console.log("Example app listening at http://%s:%s", host, port)
})