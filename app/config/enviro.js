'use strict';
     
    // Include connection config file
    var config = require('./config.json');

    // preload variables from config file
    var geoserver_host = config.geoserver_host;

    // Overwrite variables if found in env variables
    if(process.env.GEOSERVER_HOST)
      geoserver_host = process.env.GEOSERVER_HOST;
     
    module.exports.geoserver_host = geoserver_host;