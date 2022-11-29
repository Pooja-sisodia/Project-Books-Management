const jwt = require('jsonwebtoken');

const authentication = async function(req,req,next){
    try{
    let token = req.header["auth-x-key"]
    if(!token){return res.status(400).send({status:false,message:"please enter the token"})}
    try{
        let decodedToken = jwt.varify(token, "project3-room10-key")
            req.auth = decodedToken.userId
    }catch(error){
        return res.status(401).send({ status: false, message: "authentication can't happen", message: error.message })
    }
    next()
}catch(error){
    return res.status(500).send({status:false, message: error.message})
}
}

module.exports.authentication = authentication