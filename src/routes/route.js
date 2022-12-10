const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const userController = require('../controllers/userController');
const reviewController = require('../controllers/reviewController');
const{authentication,Authorisation} = require('../middlewares/auth');
const { getImage } = require('../controllers/aws-s3');


//===============================================Routes======================================================//

router.post('/register', userController.createUser)
router.post('/login', userController.loginUser)

//book-api
router.post('/books',authentication,  bookController.createBooks)
router.get('/books',authentication, bookController.getbooks)
router.get('/books/:bookId',authentication, bookController.getBookById)
router.put('/books/:bookId', authentication,Authorisation,bookController.updateBooks)
router.delete('/books/:bookId',authentication, Authorisation,bookController.DeletedBook)
router.post("/write-file-aws", getImage)

//review-api
router.post('/books/:bookId/review',  reviewController.createReviews)
router.put('/books/:bookId/review/:reviewId', reviewController.updateReview)
router.delete('/books/:bookId/review/:reviewId', reviewController.deleteReviwsById)



router.all("/*",(req,res)=>{
    return res.status(404).send({status:false,msg:" Please provide a correct end point "})
})


module.exports = router;