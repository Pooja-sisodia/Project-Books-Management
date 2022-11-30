const mongoose = require("mongoose")

const ReviewModel = new mongoose.Schema({
    bookId: {type:mongoose.Schema.Types.ObjectId,required:true, ref:"book"},
    
    reviewedBy: {type:String, required:true, default :'Guest',trim:true},
    reviewedAt: {type:Date, default:Date.now()},
    rating: {type:Number, required:true, trim:true},
    review: {type:String,trim:true},
    isDeleted: {type:Boolean, default: false}
 } , { timestamps: true })


module.exports = mongoose.model("Review", ReviewModel)