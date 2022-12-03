const reviewModel = require('../models/reviewModel');
const bookModel = require('../models/bookModel'); 
const userModel = require('../models/userModel');
const { default: mongoose } = require('mongoose');
const moment = require('moment');

//=================================================Regex-And-Validators======================================================//
const isvalidName = function(reviewedBy){
   return /^[a-zA-Z. ]{3,20}$/
   .test(reviewedBy)
}

const isValid = function(value){
   if(typeof value == "undefined"|| value=="null")return false
   if(typeof value == "string" && value.trim().length==0) return false
   return true
}

const isValidfild = function (value){
   if (typeof value === "string" && value.trim().length === 0) return false
   return true
}

const isValidDate = function(releasedAt){
   return (/^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/)
   .test(releasedAt)
 }

const validRating = function(rating){
 return /^[+]?([1-4]*\[1-9]+|[1-5])$/
 .test(rating)
}

//===============================================Create-Review==============================================================//
const createReviews = async function(req,res){
 try{
    let bookId = req.params.bookId
    if(!mongoose.isValidObjectId(bookId)){return res.status(400).send({status:false, message:`${bookId} this id is not valid`})}

     let data = req.body
    

    let {reviewedBy,reviewedAt,rating,review,isDeleted} = data
    
    let validBook = await bookModel.findOne({isDeleted:false, _id:bookId})
    if(!validBook){return res.status(404).send({status:false, message:`this book is not found by ${bookId}`})}
     
    data["bookId"]= bookId
    if(reviewedBy){
      if(!isvalidName(reviewedBy)) return res.status(400).send({status:false , message:"please enter a valid name"})
      }else{data["reviewedBy"]= 'guest'}

      if(!isValid(rating)){return res.status(400).send({status:false, message:"rating is require"})}
      if(!validRating(rating)){return res.status(400).send({status:false, message:"please provied the rating in correct format,rate this book in between 1-5 "})}

      if(!isValidfild(review)){return res.status(400).send({status:false, message:"please provied the review in correct format"})}

      if(reviewedAt){
      if(!isValidDate(reviewedAt))return res.status(400).send({ status: false, message: 'Please enter a  release Date YYYY-MM-DD format' })
      }else{ data["releasedAt"] = moment().format('YYYY MM DD') }

      if(isDeleted==true){return res.status(400).send({status:false, message:"you can't delete the review while creating it"})}

      const reviewData = await reviewModel.create(data)
      let updateBook = await bookModel.findByIdAndUpdate({_id:bookId},{$inc:{reviews:+1}},{new:true})
      updateBook._doc["reviewsData"]= reviewData
      return res.status(201).send({status:true, message:"review is successfully created", data:updateBook})

 }catch(error){
    return res.status(500).send({status:false, message: error.message})
 }
}

//===================================================Update-Reviews=====================================================//
const updateReview = async function (req, res) {
   try {
       let data = req.body
       let bookId = req.params.bookId
       let reviewId = req.params.reviewId
       if (!isValid(bookId)) {
           return res.status(404).send({ messege: "Please provide  bookId" })
       }
       if (!mongoose.isValidObjectId(bookId)) {
           res.status(400).send({ status: false, message: 'You Are Providing Invalid bookId' });
           return;
       }
       if (!isValid(reviewId)) {
           return res.status(404).send({ message: "Please provide reviewId " })
       }
       if (!mongoose.isValidObjectId(reviewId)) {
           res.status(400).send({ status: false, message: 'You Are Providing Invalid reviewId' });
           return;
       }
       let bookFound = await bookModel.findOne({ _id: bookId, isDeleted: false })
       if (!bookFound) {
           return res.status(404).send({ message: "No book found" })
       }
       let checkReview = await reviewModel.findOne({ _id: reviewId, isDeleted: false })
       if (!checkReview) {
           return res.status(404).send({ status: false, message: "The Review Doesn't Exist" })
       }
       if (bookFound && checkReview) {
           if (checkReview.bookId == bookId) {
               if (Object.keys(data).length == 0) {
                   return res.status(400).send({ message: "Please Provide The Required data" })
               }

               const { reviewedBy, review, rating } = data
               if (reviewedBy) {
                   if (!isValid(reviewedBy)) {
                       return res.status(404).send({ message: "Please provide The reviewer's name" })
                   }
               }
               if (review) {
                   if (!isValid(review)) {
                       return res.status(404).send({ message: "Please Provide Your Review" })
                   }
               }
               if (rating) {
                   if (!isValid(rating)) {
                       return res.status(404).send({ message: "Please Enter Rating" })
                   }
                   if (rating < 1 || rating > 5) {
                       return res.status(400).send({ status: false, message: "Rating Value Should Be In Between 1 to 5" })
                   }
               }

               const updatedReview = await reviewModel.findOneAndUpdate({ _id: reviewId }, { ...data }, { new: true }).select({ __v: 0 })
               return res.status(200).send({ status: true, message: 'Review updated', data: updatedReview });
           }
           else {
               return res.status(400).send({ status: false, message: "You Are Not Authorized To Update The review" })
           }
       } else {
           return res.status(400).send({ status: false, message: "can't find book to review " })
       }
   } catch (error) {
       res.status(500).send({ status: false, message: error.message });
   }
}


//===================================================Delete-Reviews======================================================//
const deleteReviwsById = async function (req, res) {
   try {
       let bookId = req.params.bookId
       let reviewId = req.params.reviewId

       if (!bookId) {
           return res.status(400).send({ status: false, msg: "bookId is required to delete a Review " })
       }

       if (!reviewId) {
           return res.status(400).send({ status: false, msg: "reviewId is required to delete a Review" })
       }

       if (!mongoose.Types.ObjectId.isValid(bookId)) {
           return res.status(400).send({ status: false, msg: 'this  BookId is not a valid Id' })
       }

       if (!mongoose.Types.ObjectId.isValid(reviewId)) {
           return res.status(400).send({ status: false, msg: 'this  reviewId is not a valid Id' })
       }
//---------------------------------------finding book and review to be deleted-------------------------------------------//

       let book = await bookModel.findById(bookId)
       if (!book || book.isDeleted == true) {
           return res.status(404).send({ status: false, message: "Book not found" })
       }
       let review = await reviewModel.findById(reviewId)
       if (!review || review.isDeleted == true) {
           return res.status(404).send({ status: false, message: "Review not found" })
       }
       if (review.bookId != bookId) {
           return res.status(404).send({ status: false, message: "Review not found for this book" })
       }

       await reviewModel.findOneAndUpdate({ _id: reviewId }, { isDeleted: true }, { new: true })
       await bookModel.findOneAndUpdate({ _id: bookId }, { $inc: { reviews: -1 } })

       return res.status(200).send({ status: true, message: "Review deleted successfully" })

   } catch (err) {
       return res.status(500).send({ status: false, message: err.message })
   }
}

module.exports = {createReviews,updateReview,deleteReviwsById}

