const userModel = require('../models/userModel.js')
const bookModel = require('../models/bookModel')
const jwt=require('jsonwebtoken')
const mongoose = require('mongoose')

//======================================================createUser============================================================//
const createUser = async (req, res) => {
    try {
        let { title, name, phone, email, password,address } = req.body

        if (Object.keys(req.body).length == 0) {
            return res.status(400).send({ status: false, msg: "for registration user data is required" })
        }

        if (!title) {
            return res.status(400).send({ status: false, msg: "title is required for registration" })
        }

        if (!["Mr", "Mrs", "Miss"].includes(title)) {
            return res.status(400).send({ status: false, msg: "Title must be ['Mr','Mrs','Miss']" })
        }

        if (!name) {
            return res.status(400).send({ status: false, msg: "Enter your Name" });
        }

        if (!(/^[a-zA-Z]{2,}(?: [a-zA-Z]+){0,2}$/).test(name)) {
            return res.status(400).send({ status: false, msg: "Please enter a valid Name" })
        }

        if (!phone) {
            return res.status(400).send({ status: false, msg: "Enter your phone Number. Its mandatory" })
        }
        if (!(/^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$/).test(phone)) {
            return res.status(400).send({ status: false, msg: "Please Enter valid phone Number" })
        }

        let existphone = await userModel.findOne({ phone: phone })
        if (existphone) { return res.status(400).send({ status: false, msg: "User with this phone number is already registered." }) }

        if (!email) {
            return res.status(400).send({ status: false, msg: "Enter your email .Its mandatory for registration!!!" })
        }
        if (!(/^[a-z0-9_]{1,}@[a-z]{3,10}[.]{1}[a-z]{3}$/).test(email)) {
            return res.status(400).send({ status: false, msg: "Please Enter valid Email" })
        }

        let existEmail = await userModel.findOne({ email: email })
        if (existEmail) {

            return res.status(400).send({ status: false, msg: "User with this email is already registered" })
        }
        if (!password) {
            return res.status(400).send({ status: false, msg: "Please enter Password for registartion" })
        }

        if (!(/^[\s]*[0-9a-zA-Z@#$%^&*]{8,15}[\s]*$/).test(password)) {
        return res.status(400).send({ status: false, msg: "please Enter valid Password and it's length should be 8-15" })
        }
        if(address && typeof address !="object"){
            return res.status(400).send({status:false,message:"Address should be in object form"})
        }
      


        let savedData = await userModel.create(req.body);
        return res.status(201).send({ status: true, message: 'Success', data: savedData });
    } catch (err) {
        res.status(500).send({ status: false, msg: err.message });
    }
}

module.exports.createUser = createUser

//=========================================================Login-User====================================================================//

const loginUser = async function (req, res) {

    try {
        const email = req.body.email;
        const password = req.body.password;


        if (Object.keys(req.body).length == 0) {
            res.status(400).send({ status: false, msg: "Please enter Email and Password to login" })
        }

        if (Object.keys(req.body).length > 2) {
            res.status(400).send({ status: false, msg: "invalid request.Only email & password is required for logging In" })
        }


        if (!email) {
            return res.status(400).send({ msg: "Email is not present" });
        }

        if (!password) {
            return res.status(400).send({ msg: "Password is not present" });
        }

        let User = await userModel.findOne({ email: email, password: password });

        if (!User) {
            return res.status(404).send({ status: false, msg: "Email or Password is not corerct" });
        }

        let Payload = {
            userId: User._id.toString(),
            EmailID: User.email,
            Batch: "lithium",
            Group: "10",
            Project: "project-booksManagementementGroup40",
          }
          
         const  token = jwt.sign( Payload ,"project3-room10-key" ,  {expiresIn: "60m"} )
      
          return res.status(200).send({ status: true, message: "token is successfully generated",  token: token })
      
      
        } catch (error) {
          return res
            .status(500)
            .send({ status: false, message: error.message })
        }
      }

 
module.exports.loginUser = loginUser