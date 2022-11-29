const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId

const bookSchema = new mongoose.Schema({
    title:{
        type:String,
        require:true,
        unique:true,
        trim:true
    },
    excerpt:{
        type:String,
        require:true,
        trim:true
    },
    userId:{
        type:ObjectId,
        require:true,
        ref:'User',
        trim:true
    },
    ISBN:{
        type:String,
        require:true,
        unique:true
    },
    category:{
        type:String,
        require:true,
        trim:true
    },
    subcategory:{
        type:String,
        require:true,
        unique:true,
        trim:true
    },
    reviews:{
        type:Number,
        default:0
    },
    releasedAt:{
        type:Date,
        required:true
    },
    deletedAt:{
        type:Date
    },
    isDeleted:{
        type:Boolean,
        default:false
    }
},{timestamps:true}
)
module.exports = mongoose.model("Book", bookSchema)