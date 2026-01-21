const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

async function buildByInvId(req, res, next) {
  const inv_id = Number(req.params.inv_id)
  const vehicle = await invModel.getInventoryById(inv_id)
  const nav = await utilities.getNav()
  const detailHTML = utilities.buildVehicleDetail(vehicle)

  const title = vehicle
    ? `${vehicle.inv_make} ${vehicle.inv_model}`
    : 'Vehicle not found'

  res.render('inventory/detail', {
    title,
    nav,
    detailHTML
  })
}

module.exports = {
  buildByClassificationId: invCont.buildByClassificationId,
  buildByInvId
}