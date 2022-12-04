const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bookModel = require('../models/bookModel');

//==============================================Authentication===================================================================================//

exports.authentication = async function (req, res, next) {
    try {
        const hedear = req.headers["x-api-key"]

        if (!hedear) return res.status(400).send({ status: false, msg: "token is not present" })

        jwt.verify(hedear, "project3-room10-key", function (err, token) {
            if (err) {
                return res.status(401).send({ status: false, msg: "Dost... Token is invalid Or Token has been Expired" })
            }
            else {
                req.userId = token.userId
                next()
            }
        })
    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}

//==============================================Authorization===================================================================================//
exports.Authorisation = async function (req, res, next) {
    try {
        const userId = req.userId
        let bookId = req.params.bookId
        if (!bookId) return res.status(400).send({ status: false, msg: "Oooh... bookId is not present in params" })

        if (!mongoose.isValidObjectId(bookId)) return res.status(401).send({ status: false, msg: "!Aree... bookId is not valid" })

        let bookData = await bookModel.findOne({ _id: bookId})
        if (!bookData) return res.status(404).send({ status: false, msg: "Ooh.. book is not present" })
        if (bookData.isDeleted) return res.status(400).send({ status: false, msg: "Ooh.. book Already is Deleted" })
        if (bookData.userId != userId) { return res.status(403).send({ status: false, msg: "Oooh... you are not Authrization" }) }

        next()

    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }

}
