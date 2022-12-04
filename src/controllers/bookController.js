const bookModel = require('../models/bookModel'); 
const userModel = require('../models/userModel');
const reviewModel = require('../models/reviewModel')
const mongoose = require('mongoose');
const moment = require('moment');
const ObjectId = require("mongoose").Types.ObjectId

//==================================================Regex-And-Validators==================================================================//
 const isValid = function(value){
    if(typeof value == "undefined"|| value=="null")return false
    if(typeof value  == "string" && value.trim().length==0) return false
    return true
 }

 const isValidISBN = function (ISBN) {
    const passRegex = /^[\d*\-]{10}|[\d*\-]{13}$/;
    return passRegex.test(ISBN);
  };
  
  const isValidName = function (body) {
    const nameRegex = /^[a-zA-Z_!@#$%^&()_+?"|:<>/.,;'} ]$/;
    return nameRegex.test(body);
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
    if(Object.keys(req.body)==0){ return res.status(400).send({status:false, meassage:"please provide entries to request body"})}
    
    let{title,excerpt,userId,ISBN,category,subcategory,releasedAt,reviews,isDeleted}=data


//============================================crendentials-checking==============================================================================//
    if(!title){return res.status(400).send({status:true, message:"please provide the title key"})}
    if(!excerpt){return res.status(400).send({status:true, message:"please provide the excerpt key"})}
    if(!userId){return res.status(400).send({status:true, message:"please provide the userId key"})}
    if(!ISBN){return res.status(400).send({status:true, message:"please provide the ISBN key"})}
    if(!category){return res.status(400).send({status:true, message:"please provide the category key"})}
    if(!subcategory){return res.status(400).send({status:true, message:"please provide the subcategory key"})}
    
    if(!isValid(title)){return res.status(400).send({status:false, message:"title is require"})}
    if(!isValid(excerpt)){return res.status(400).send({status:false, message:"excerpt is required"})}
    if(!isValid(userId)){return res.status(400).send({status:false, message:"userId is required"})}
    if(!isValid(ISBN)){return res.status(400).send({status:false, message:"ISBN is required"})}
    if(!isValid(category)){return res.status(400).send({status:false, message:"category is required"})}
    if(!isValid(subcategory)){return res.status(400).send({status:false, message:"subcategory is required"})}
    
    
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

//======================================================Get-Books================================================================//
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
const getBookById = async (req, res) => {
  try {
      let bookid1 = req.params.bookId
      if (!bookid1)
          return res.status(400).send({ status: false, msg: "please give book id" })
      if (!mongoose.Types.ObjectId.isValid(bookid1))
          return res.status(400).send({ status: false, msg: "please enter valid bookid" })

      let book = await bookModel.findById(bookid1)

      if (!book || book.isDeleted == true)
          return res.status(404).send({ status: false, message: "No Book Found" })

      const { title, _id, excerpt, userId, category, reviews, releasedAt } = book
      let reviewsdata = await reviewModel.find({ bookId: bookid1 })
      let result = { title, _id, excerpt, userId, category, reviews, releasedAt, reviewsdata }

      return res.status(200).send({ status: true, message: "Book list", data: result })
  } catch (error) {
      res.status(500).send({ status: false, msg: error.message });
  }

}
  
//=====================================================Update-Books==========================================================================//
const updateBooks = async function(req, res){
    try {
        let bookId = req.params.bookId;
        let { title, excerpt, releasedAt, ISBN } = req.body;
    
        if (!bookId) {
          return res
            .status(400)
            .send({ status: false, message: "please provide bookId" });
        }
        if (!mongoose.isValidObjectId(bookId)) {
          return res
            .status(400)
            .send({ status: false, message: "Enter valid bookId" });
        }
    
        if (Object.keys(req.body).length == 0) {
          return res
            .status(400)
            .send({ status: false, message: "Please provide any input to update" });
        }
    
    
        if(title){const isTitleAlreadyUsed = await bookModel.findOne({
          title,
          isDeleted: false,
        });
    
        if (isTitleAlreadyUsed) {
          return res
            .status(400)
            .send({ status: false, message: `title is already registered` });
        }}
  
    
        if (ISBN) {
          if (!isValidISBN(ISBN)) {
            return res
              .status(400)
              .send({ status: false, message: "Enter valid ISBN" });
          }
        }
    
        const isIsbnAlreadyUsed = await bookModel.findOne({
          ISBN,
          isDeleted: false,
        });
        
        const currentDate = moment().format('MMMM Do YYYY, h:mm:ss a')
        req.body["releasedAt"]=currentDate
    
        const update = await bookModel.findOneAndUpdate(
          { _id: bookId, isDeleted: false },
          {
            $set: {
              title: title,
              excerpt: excerpt,
              currentDate: releasedAt,
              ISBN: ISBN,
            },
          },
          { new: true }
        );
    
        if (!update) {
          return res.status(404).send({ status: false, message: "Book is not exist" });
        }
    
        return res
          .status(200)
          .send({ status: true, message: "Book List", data: update });
      } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
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

    const deleteBook = await bookModel.findByIdAndUpdate({ _id: bookId }, { $set: { isDeleted: true, deletedAt: Date.now() } });
       return res.status(200).send({ status: true, message: "book has been deleted successfully" })


    }catch(error){
        res.status(500).send({status: false, msg:error.message});

    }
}

module.exports ={createBooks,getbooks,getBookById,updateBooks,DeletedBook}