const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const userController = require('../controllers/userController');
const reviewController = require('../controllers/reviewController');
const {authentication} = require('../middlewares/auth');

//===============================================Routes======================================================//

router.post('/register', userController.createUser)
router.post('/login', userController.loginUser)
router.post('/books', authentication, bookController.createBooks)
router.get('/books', bookController.getbooks)
router.get('/books/:bookId', bookController.getBookById)
router.put('/books/:bookId', authentication,bookController.updateBooks)
router.delete('/books/:bookId', authentication,bookController.DeletedBook)
//review
router.post('/books/:bookId/review',  reviewController.createReviews)
router.put('/books/:bookId/review/:reviewId', reviewController.updateReview)
router.delete('/books/:bookId/review/:reviewId', reviewController.deleteReviwsById)


module.exports = router;