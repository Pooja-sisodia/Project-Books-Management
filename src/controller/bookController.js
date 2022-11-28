const bookmodel=require("../model/bookmodel");
const mongoose=require('mongoose')

//===========getbook========//

let getbook=async(req,res)=>{
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
        let data=await bookmodel.find($and:[filterbook, {isDeleted:false}])
        .select({title:1, excerpt:1,category:1,releasedAt:1,userId:1, reviews:1}).sort({title:1})
         
        if(Object.keys(data).length==0) return res.status(404).send({status:false,message:'book not found'})
         res.status(200).send({status:true, message:'booklist',data:data})
    }
    catch (err){
        return res.status(500).send({status:false, message:err.message})
    }
}
