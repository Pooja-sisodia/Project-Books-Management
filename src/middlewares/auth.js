const jwt = require('jsonwebtoken');

const authentication = async function(req,req,next){
    let token = req.header["auth-x-key"]
    if(!token){return res}
}