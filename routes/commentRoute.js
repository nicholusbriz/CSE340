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

/* ***************************
 *  Update a comment
 *  URL: PUT /comments/update/:comment_id
 * ************************** */
router.put("/update/:comment_id",
  utilities.checkLogin,               // Check if user is logged in
  commentController.commentValidationRules(),
  utilities.handleErrors(commentController.updateComment)
)

/* ***************************
 *  Get comment statistics
 *  URL: GET /comments/stats/:inv_id
 * ************************** */
router.get("/stats/:inv_id",
  utilities.handleErrors(commentController.getCommentStats)
)

module.exports = router
