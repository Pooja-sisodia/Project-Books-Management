const bookModel = require('../models/bookModel'); 
const userModel = require('../models/userModel');
const mongoose = require('mongoose');
const moment = require('moment');
const ObjectId = require("mongoose").Types.ObjectId

//==================================================Regex and Validators==================================================================//
 const isValidRequestBody = (value)=>{
  return Object.keys(value) > 0
  }

 const isValid = function(value){
    if(typeof value == "undefined"|| value=="null")return false
    if(typeof value == "string" && value.trim().length==0) return false
    return true
 }

 const isValidISBN = function (ISBN) {
    const passRegex = /^(?=(?:\D*\d){13}(?:(?:\D*\d){3})?$)[\d-]+$/;
    return passRegex.test(ISBN);
  };
  

  const validDate = function(releasedAt){
   return /^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/
   .test(releasedAt)
 }
 
 const isValidId = function(userId){
    return mongoose.Types.ObjectId.isValid(userId);
};

//================================================Create-Books============================================================================//
const createBooks = async function(req,res){
    try{
    let data = req.body
    if(!isValidRequestBody(data)){return res.status(400).send({status:false, message:"please provide entries to the request body"})}
    let {title,excerpt,userId,ISBN,category,subcategory,releasedAt,reviews,isDeleted} = data

//=============================================Authorization===============================================================================//
    const authUserId = req.authUser
    if (authUserId != userId) return res.status(403).send({ status: false, message: `${userId} This ID is not authorized` })

//============================================crendentials-checking==========================================================================//
    if(!title){return res.status(400).send({status:true, message:"please provide the excerpt key"})}
    if(!excerpt){return res.status(400).send({status:true, message:"please provide the excerpt key"})}
    if(!userId){return res.status(400).send({status:true, message:"please provide the userId key"})}
    if(!ISBN){return res.status(400).send({status:true, message:"please provide the ISBN key"})}
    if(!category){return res.status(400).send({status:true, message:"please provide the category key"})}
    if(!subcategory){return res.status(400).send({status:true, message:"please provide the subcategory key"})}
    if(!releasedAt){return res.status(400).send({status:true, message:"please provide the releasedAt key"})}

    if(!isValid(title)){return res.status(400).send({status:false, message:"title is require"})}
    if(!isValid(excerpt)){return res.status(400).send({status:false, message:"excerpt is required"})}
    if(!isValid(userId)){return res.status(400).send({status:false, message:"userId is required"})}
    if(!isValid(ISBN)){return res.status(400).send({status:false, message:"ISBN is required"})}
    if(!isValid(category)){return res.status(400).send({status:false, message:"excerpt is required"})}
    if(!isValid(subcategory)){return res.status(400).send({status:false, message:"excerpt is required"})}
    if(!isValid(releasedAt)){return res.status(400).send({status:false, message:"releasedAt is required"})}
    
    if(!isValidId(userId)){return res.status(400).send({status:false, message:"please enter a valid userId"})}
    let validUser = await userModel.findById(userId)
    if(!validUser){return res.status(404).send({status:false, message:"user not found by this userId "})}

    let uniqueTitle = await bookModel.findOne({title:title})
    if(uniqueTitle){return res.status(400).send({status:false, message:"this title is already exist"})}

    if(!isValidISBN(ISBN)){return res.status(400).send({status:false, message:"please provide the valid ISBN"})}
    let uniqueISBN = await bookModel.findOne({ISBN:ISBN})
    if(uniqueISBN){return res.status(400).send({status:false,message:"this ISBN is already used"})}

    let uniqueSubcategory = await bookModel.findOne({subcategory:subcategory})
    if(uniqueSubcategory){return res.status(400).send({status:false,message:"these subcatagory is already exist"})}
    
    if(releasedAt){
    if(!validDate(releasedAt)) return res.status(400).send({status:false, message:"Please enter a release Date YYYY-MM-DD format"})
    }else { data["releasedAt"] = moment().format('YYYY MM DD') } 
    
    if(isDeleted == true){return res.status(400).send({status:false, message:"you can't delete a book while creating"})}

    let book = await bookModel.create(data)
    return res.status(201).send({status:true, message:"Book is successfully created", data:book})

}catch(error){
    return res.status(500).send({status:false, message:error.message})
}
}
module.exports.createBooks = createBooks

//===============================================Get-Books===========================================================//

let getbooks=async(req,res)=>{
    try{
      let filterbook=req.query

        //-----validation------//

        if(filterbook.userId){
            if(!mongoose.Types.ObjectId.isValid(filterbook.userId))
            return res.status(400).send({status:false, message:'invalid UserId format'})

        }
        //----for two or more subcategory----//
        if(filterbook.subcategory){
            filterbook.subcategory={$in: filterbook.subcategory.split(',')};

        }
        //----findbook----//
        let data=await bookmodel.find({$and:[filterbook, {isDeleted:false}]})
        .select({title:1, excerpt:1,category:1,releasedAt:1,userId:1, reviews:1}).sort({title:1})
         
        if(Object.keys(data).length==0) return res.status(404).send({status:false,message:'book not found'})
         res.status(200).send({status:true, message:'booklist',data:data})
}catch(error){
    return res.status(500).send({status:false, message:err.message})
}
}

module.exports.getbooks = getbooks