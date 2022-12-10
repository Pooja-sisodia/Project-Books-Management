const mongoose = require("mongoose")
const ObjectId = mongoose.Schema.Types.ObjectId

const books = new mongoose.Schema({
    bookCover: {
        type: String
    },
    title: {
        type: String,
        unique: true,
        require: true,
        trim:true
    },
    excerpt: {
        type: String,
        require: true,
        trim:true
    },
    userId: {
        type: ObjectId,
        require: true,
        ref:"User"
    },
    ISBN: {
        type: String,
        require: true,
        unique: true,
        trim:true
    },
    category: {
        type: String,
        require: true,
        trim:true
    },
    subcategory: {
        type :[String],
        require:true,
        trim:true
    },
    reviews: {
        type: Number,
         default: 0 
             },
    deletedAt: {
        type: Date,
        default:null
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    releasedAt: {
        type:String,
        default:null
    }


}, { timestamps: true })

module.exports = mongoose.model("book", books)
