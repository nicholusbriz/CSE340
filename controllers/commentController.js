const commentModel = require("../models/comment-model")
const { body, validationResult } = require("express-validator")

/* ***************************
 *  Add a new comment
 * ************************** */
async function addComment(req, res, next) {
  try {
    const { inv_id, comment_text } = req.body
    const account_id = res.locals.accountData.account_id

    // Validation
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      req.flash("notice", "Please check your comment and try again")
      return res.redirect(`/inv/detail/${inv_id}`)
    }

    // Check if comment text is not empty
    if (!comment_text || comment_text.trim().length === 0) {
      req.flash("notice", "Comment cannot be empty")
      return res.redirect(`/inv/detail/${inv_id}`)
    }

    // Add comment
    const newComment = await commentModel.addComment(inv_id, account_id, comment_text.trim())

    if (newComment) {
      req.flash("notice", "Comment added successfully")
    } else {
      req.flash("notice", "Failed to add comment")
    }

    res.redirect(`/inv/detail/${inv_id}`)
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Delete a comment
 * ************************** */
async function deleteComment(req, res, next) {
  try {
    const { comment_id } = req.params
    const account_id = res.locals.accountData.account_id

    // Get comment details to verify ownership
    const comment = await commentModel.getCommentById(comment_id)

    if (!comment) {
      req.flash("notice", "Comment not found")
      return res.redirect(`/inv/detail/${comment.inv_id}`)
    }

    // Check if user owns the comment
    if (comment.account_id !== account_id) {
      req.flash("notice", "You can only delete your own comments")
      return res.redirect(`/inv/detail/${comment.inv_id}`)
    }

    // Delete comment
    const deleted = await commentModel.deleteComment(comment_id)

    if (deleted) {
      req.flash("notice", "Comment deleted successfully")
    } else {
      req.flash("notice", "Failed to delete comment")
    }

    res.redirect(`/inv/detail/${comment.inv_id}`)
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Validation rules for comments
 * ************************** */
const commentValidationRules = () => {
  return [
    body('comment_text')
      .trim()
      .isLength({ min: 1, max: 1000 })
      .withMessage('Comment must be between 1 and 1000 characters')
      .escape()
  ]
}

module.exports = {
  addComment,
  deleteComment,
  commentValidationRules
}
