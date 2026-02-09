const express = require("express")
const router = express.Router()
const commentController = require("../controllers/commentController")
const utilities = require("../utilities")
const commentValidate = commentController.commentValidationRules()

/* ***************************
 *  Add a new comment
 *  URL: POST /comments/add
 * ************************** */
router.post("/add",
  utilities.checkLogin,               // Check if user is logged in
  commentValidate,                    // Validate input
  utilities.handleErrors(commentController.addComment)
)

/* ***************************
 *  Delete a comment
 *  URL: POST /comments/delete/:comment_id
 * ************************** */
router.post("/delete/:comment_id",
  utilities.checkLogin,               // Check if user is logged in
  utilities.handleErrors(commentController.deleteComment)
)

module.exports = router
