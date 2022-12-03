const bookModel = require('../models/bookModel'); 
const userModel = require('../models/userModel');
const mongoose = require('mongoose');
const moment = require('moment');
const ObjectId = require("mongoose").Types.ObjectId

//==================================================Regex-And-Validators==================================================================//
 const isValidRequestBody = (value)=>{
  return Object.keys(value) > 0
  }

 const isValid = function(value){
    if(typeof value == "undefined"|| value=="null")return false
    if(typeof value == "string" && value.trim().length==0) return false
    return true
 }

 const isValidISBN = function (ISBN) {
    const passRegex = /^[\d*\-]{10}|[\d*\-]{13}$/;
    return passRegex.test(ISBN);
  };
  

  const isValidDate = function(releasedAt){
   return (/^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/)
   .test(releasedAt)
 }
 
 const isValidId = function(userId){
    return mongoose.Types.ObjectId.isValid(userId);
};

//================================================Create-Books============================================================================//
const createBooks = async function(req,res){
    try{
    let data = req.body
    
    let{title,excerpt,userId,ISBN,category,subcategory,releasedAt,reviews,isDeleted}=data

//==============================================Authorization===================================================================================//
const authUserId = req.body.userId
    if (authUserId != userId) return res.status(403).send({ status:false, message: `${userId} This ID is not authorized` })

//============================================crendentials-checking==============================================================================//
    if(!title){return res.status(400).send({status:true, message:"please provide the title key"})}
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
    if(!isValid(category)){return res.status(400).send({status:false, message:"category is required"})}
    if(!isValid(subcategory)){return res.status(400).send({status:false, message:"subcategory is required"})}
    if(!isValid(releasedAt)){return res.status(400).send({status:false, message:"releasedAt is required"})}
    
    if(!isValidId(userId)){return res.status(400).send({status:false, message:"please enter a valid userId"})}
    let validUser = await userModel.findById(userId)
    if(!validUser){return res.status(404).send({status:false, message:"user not found by this userId "})}

    let uniqueTitle = await bookModel.findOne({title:title})
    if(uniqueTitle){return res.status(400).send({status:false, message:"this title is already exist"})}

    if(!isValidISBN(ISBN)){return res.status(406).send({status:false, message:"please provide the valid ISBN"})}
    let uniqueISBN = await bookModel.findOne({ISBN:ISBN})
    if(uniqueISBN){return res.status(400).send({status:false,message:"this ISBN is already used"})}

   
    if(releasedAt){
        if(!isValidDate(releasedAt)) return res.status(400).send({ status: false, message: 'Please enter a  release Date YYYY-MM-DD format' })
    }else{ data["releasedAt"] = moment().format('YYYY MM DD') }

    if(reviews) return res.status(406).send({status:false, message: 'default value of reviews is 0 while book registering' })
    
    if(isDeleted == true){return res.status(400).send({status:false, message:"you can't delete a book while creating"})}

    let book = await bookModel.create(data)
    return res.status(201).send({status:true, message:"Book is successfully created", data:book})

}catch(error){
    return res.status(500).send({status:false, message:error.message})
}
}




//=================================getByquery============================================//

const getbooks = async (req, res) => {
    try {
        const filter = { isDeleted: false }

        const queryParams = req.query
        {
            const { userId, category, subcategory } = queryParams
            if (userId) {
                if (!mongoose.Types.ObjectId.isValid(userId)) {
                    return res.status(400).send({ status: false, msg: `please enter a valid userID` })
                }
                filter["userId"] = userId
            }

            if (category) {
                filter['category'] = category
            }

            if (subcategory) {
                filter['subcategory'] = subcategory
            }
        }

        const books = await bookModel.find(filter).select({ title: 1, excerpt: 1, userId: 1, category: 1, reviews: 1, releasedAt: 1 }).collation({ locale: "en" }).sort({ title: 1 })

        if (Object.keys(books).length == 0)
            return res.status(404).send({ status: false, msg: "No Such book found" })

        res.status(200).send({ status: true, message: 'Books list', data: books })

    }
    catch (err) {
        console.log(err.message)
        res.status(500).send({ status: false, Error: err.message })
    }
}
//================================================Get-Books-By-Id===========================================================================//
const getBookById = async function (req, res) {
    try {
        let bookId = req.params.bookId
  
        if (!mongoose.Types.ObjectId.isValid(bookId)) {
            return res.status(400).send({ status: false, message: "Please provide a valid book id." })
        }
  
        let bookData = await bookModel.findOne({ id: bookId, isDeleted: false }).select({ "ISBN": 0, "isDeleted": 0, "subcategory": 0, "_v": 0, "createdAt": 0, "updatedAt": 0 })
  
        if (bookData) {
            return res.status(200).send({ status: true, message: "Books List", data: bookData })
        } else {
            return res.status(404).send({ status: false, message: "No books found with this id." })
        }
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
  }


  
//=====================================================Update-Books==========================================================================//
const updateBooks = async function(req, res){
 try{
    let data = req.body
    let {title, excerpt, ISBN, releasedAt} = data
   
    let id = req.params.bookId
    if(!mongoose.isValidObjectId(id)){return res.status(400).send({status:false, message: "please enter a valid userId"})}
    
    let bookUser = await bookModel.findById(id)
    if(!bookUser){return res.status(404).send({status:false, message:"Invalid book id"})}
    
 //=====================================================Authorization============================================================================//
 const decoded= req.decodedToken
    if(decoded.userId != bookUser.userId) return res.status(403).send({status:false, message: `${userId} This ID is not authorized` })
 

 //====================================================Checking-Crendentials========================================================================//
 
    if(ISBN){
        if(!isValidISBN(ISBN)) return res.status(406).send({ status: false, message: 'Plese enter valid ISBN' })
        }
 
        const unique = await bookModel.findOne({ $or: [{ title: title }, { ISBN: ISBN }] })
 
        if(unique){
             if(unique.title == title.trim()){
                 return res.status(400).send({ message: `${title} is  alrady exist` })
             }else{ return res.status(400).send({ message: `${ISBN}:--This ISBN is alrady exist  ` }) }
           
            }

        if(releasedAt){
            if(!isvalidDate(releasedAt)) return res.status(406).send({status:false, message: 'Plese enter a release Date YYYY-MM-DD format' })
        }
 
        const newUpdate = await bookModel.findOneAndUpdate({bookId: id, isDeleted: false}, { $set: { title: title, excerpt: excerpt, releasedAt: releasedAt, ISBN: ISBN } }, { new: true })
 
        if(!newUpdate) { return res.status(404).send({status:false, message: "book not found so can't update anything" }) }
 
        res.status(200).send({status:true, message: "updated successfully", data: newUpdate })

    }catch(error) {
       return res.status(500).send({status:false, message: error.message })
    }

}

//==========================================================deleteBook==========================================================================//
const DeletedBook = async function (req, res) {
    try {
        let bookId = req.params.bookId
        if (!mongoose.Types.ObjectId.isValid(bookId))
            return res.status(400).send({ status: false, msg: "please enter valid bookid" })
        const savedata = await bookModel.findById(bookId)
        if(!savedata) { return res.status(404).send({status:false, message: "book not found so can't update anything" }) }
        
        if (savedata.isDeleted == true) {
            return res.status(404).send({ status: false, message: "book is already deleted" })
        }
//====================================================Authorization================================================================================//
const decoded= req.decodedToken
    if(decoded.userId != savedata.userId) return res.status(403).send({status:false, message: `${userId} This ID is not authorized` })

    const deleteBook = await bookModel.findByIdAndUpdate({ _id: bookId }, { $set: { isDeleted: true, deletedAt: Date.now() } });
       return res.status(200).send({ status: true, message: "book has been deleted successfully" })


    }catch(error){
        res.status(500).send({status: false, msg:error.message});

    }
}

module.exports ={createBooks,getbooks,getBookById,updateBooks,DeletedBook}