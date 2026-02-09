const pool = require("../database")

/* ***************************
 *  Get all comments for a vehicle
 * ************************** */
async function getCommentsByVehicleId(inv_id) {
  try {
    const sql = `
      SELECT c.comment_id, c.comment_text, c.comment_date, c.account_id,
             a.account_firstname, a.account_lastname
      FROM comments c
      JOIN account a ON c.account_id = a.account_id
      WHERE c.inv_id = $1
      ORDER BY c.comment_date DESC
    `
    const data = await pool.query(sql, [inv_id])
    return data.rows
  } catch (error) {
    console.error("getCommentsByVehicleId error " + error)
    return null
  }
}

/* ***************************
 *  Add a new comment
 * ************************** */
async function addComment(inv_id, account_id, comment_text) {
  try {
    const sql = `
      INSERT INTO comments (inv_id, account_id, comment_text)
      VALUES ($1, $2, $3)
      RETURNING *
    `
    const data = await pool.query(sql, [inv_id, account_id, comment_text])
    return data.rows[0]
  } catch (error) {
    console.error("addComment error " + error)
    return null
  }
}

/* ***************************
 *  Get comment by ID
 * ************************** */
async function getCommentById(comment_id) {
  try {
    const sql = `
      SELECT c.*, a.account_firstname, a.account_lastname
      FROM comments c
      JOIN account a ON c.account_id = a.account_id
      WHERE c.comment_id = $1
    `
    const data = await pool.query(sql, [comment_id])
    return data.rows[0]
  } catch (error) {
    console.error("getCommentById error " + error)
    return null
  }
}

/* ***************************
 *  Delete a comment
 * ************************** */
async function deleteComment(comment_id) {
  try {
    const sql = `DELETE FROM comments WHERE comment_id = $1`
    const data = await pool.query(sql, [comment_id])
    return data.rowCount > 0
  } catch (error) {
    console.error("deleteComment error " + error)
    return false
  }
}

module.exports = {
  getCommentsByVehicleId,
  addComment,
  getCommentById,
  deleteComment
}
