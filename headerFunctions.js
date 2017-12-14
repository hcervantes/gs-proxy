var fs = require('fs'),
jwt = require('jsonwebtoken'),
exports = module.exports =[];

exports.verifyToken = function(token){ 
  // verify a token asymmetric
  let cert = fs.readFileSync('private.key');  // get public key
  let decoded = null
  try {
    decoded = jwt.verify(token, 'secret');
  } catch (error) {
    decoded = {success: false, err: error};
  }
  
  
  return decoded; 
  
};

/*
try {
  jwt.verify(token, 'secret', function(err, decoded) {
   if(err){
     console.log("Error with token: " + err.message);
     return {success: false, msg: err.message};
   }
   else{
     return {success: true, msg: decoded};
   }
 });
 
} catch (error) {
 console.log('Verify Token error:' + error);
 return {success: false, msg: error};
}
*/