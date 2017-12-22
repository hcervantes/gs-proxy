const http = require('http'),
httpProxy = require('http-proxy'),
headerFn = require('./headerFunctions'),
querystring = require('querystring'),
enviro = require('./app/config/enviro');

//
// Create a proxy server with custom application logic
//
var proxy = httpProxy.createProxyServer({});

// To modify the proxy connection before data is sent, you can listen
// for the 'proxyReq' event. When the event is fired, you will receive
// the following arguments:
// (http.ClientRequest proxyReq, http.IncomingMessage req,
//  http.ServerResponse res, Object options). This mechanism is useful when
// you need to modify the proxy request before the proxy connection
// is made to the target.
//
proxy.on('proxyReq', function(proxyReq, req, res, options) {
    // proxyReq.setHeader('X-Special-Proxy-Header', 'foobar');
    // console.log("Set special header");
  
});

var server = http.createServer(function(req, res) {
  // You can define here your custom logic to handle the request
  // and then proxy the request.
  // Only add Security filters to OGC requests, so we will check if it is a WMS, or WFS request
  let path = req.url;
  let isOGC = path.toLowerCase().includes('/wms') || path.toLowerCase().includes('/wfs');
  if (isOGC) {
    
    

    // Get the JWT
    console.log("Validating JWT");
    
    // Get the token from headers and validate
    var token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token'];
    if(token == undefined){
        console.log("Token is not defined: ");
        // Write output to screen
        res.writeHead(401, { 'Content-Type': 'text/html' });
        res.write('<h1>Token is not defined, therefore, not authorized to submit OGC requests!</h1>');
        res.end();
        return;
    }
    //console.log('token: ' + token);
    // verify the token
    var token = headerFn.verifyToken(token);
        
    if(token.PKI_GROUPS == undefined){
        console.log("Error with token: " + token.err);
        // Write output to screen
        res.writeHead(401, { 'Content-Type': 'text/html' });
        res.write('<h1>Token is invalid!</h1><p>Error with token: ' + token.err.message + '</p>');
        res.end();
        return;
    }
    else{
      // Grab the visas from PKI
        var visas = token.PKI_GROUPS.visas;
        let visaCQL='';
        var joiner =  '';
        //i.e. &CQL_FILTER=VISAS LIKE '%US%' OR VISAS LIKE '%GA%' OR VISAS LIKE '%IQ%'
        console.log("Found Visas: ");
        visas.forEach(visa => {
          visaCQL = visaCQL + joiner + 'VISAS LIKE \'%' + visa + '%\' ';
          joiner = ' OR ';
          console.log(visa);
        });
        visaCQL = '[' + visaCQL + ']';
        // Apend to path
        visaCQL = querystring.stringify( {CQL_FILTER: visaCQL});
        // Manually URL encode apostrophe's (')
        visaCQL = visaCQL.replace(/'/g,"%27");

        // Determine if existing URL has existing CQL_Filter, if so, append to it
        if(path.toUpperCase().includes('CQL_FILTER=')){
          var i = path.toUpperCase().indexOf('CQL_FILTER=');
          var  i2 = path.indexOf('&', i); // find the next i
          // Find the lenth to the next & splitting query params
          var l = i2 > i ? (i2 - i ): path.length; // must be grater than start, otherwise, lenth of path
          // Append to the CQL Filter, 
          // note "CQL_Filter=" is 11 characters long, so substring after that

          visaCQL = visaCQL + '%20AND%20' + path.substr(i + 11, l); 
          let existingCQL = path.substr(i, l);
          // Remove existing CQL from path
          path = path.replace(existingCQL, '');
          
        }
        path = path + '&' + visaCQL;
        req.url = path;
        console.log('Visa Query: ' + visaCQL);
        

    }
  } 

  // Get the geoserver host from config
  var gs_host = enviro.geoserver_host;

  proxy.web(req, res, {
    target: gs_host
  });
});

console.log("Proxy listening on port 5050")
server.listen(5050);



/*
var server = http.createServer(function(req, res) {
  // You can define here your custom logic to handle the request
  // and then proxy the request.
  proxy.web(req, res, {
    target: 'http://127.0.0.1:9090/'
  });
});

console.log("listening on port 5050")
server.listen(5050);

function name(params) {
  
}

*/