const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
  }
}

// Get vehicle by ID
async function getInventoryById(inv_id) {
  try {
    const sql = `
      SELECT inv_id, inv_make, inv_model, inv_year, 
      inv_price, inv_miles,inv_color, inv_description, inv_image, inv_thumbnail
      FROM public.inventory
      WHERE inv_id = $1
    `
    const data = await pool.query(sql, [inv_id])
    return data.rows[0] // return single vehicle
  } catch (error) {
    throw error
  }
}

// Export all of my  functions together 
module.exports = { 
    getClassifications, 
    getInventoryByClassificationId, 
    getInventoryById
}


