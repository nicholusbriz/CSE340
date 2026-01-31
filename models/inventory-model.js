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

/* ***************************
 *  Add new classification
 * ************************** */
async function addClassification(classification_name) {
  try {
    const sql = "INSERT INTO public.classification (classification_name) VALUES ($1) RETURNING *"
    return await pool.query(sql, [classification_name])
  } catch (error) {
    console.error("addClassification error " + error)
    throw error
  }
}

/* ***************************
 *  Add new inventory item
 * ************************** */
async function addInventory(invData) {
  try {
    const sql = `
      INSERT INTO public.inventory (
        inv_make, inv_model, inv_year, inv_price, inv_miles, 
        inv_color, inv_description, inv_image, inv_thumbnail, classification_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *
    `
    const values = [
      invData.inv_make,
      invData.inv_model,
      invData.inv_year,
      invData.inv_price,
      invData.inv_miles,
      invData.inv_color,
      invData.inv_description,
      invData.inv_image,
      invData.inv_thumbnail,
      invData.classification_id
    ]
    return await pool.query(sql, values)
  } catch (error) {
    console.error("addInventory error " + error)
    throw error
  }
}

// Export all of my functions together 
module.exports = { 
    getClassifications, 
    getInventoryByClassificationId, 
    getInventoryById,
    addClassification,
    addInventory
}


