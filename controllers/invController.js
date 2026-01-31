const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")
const { body, validationResult } = require("express-validator")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  
  // Handle case where no vehicles exist for this classification
  const className = data.length > 0 ? data[0].classification_name : "Unknown"
  
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 *  Build vehicle detail view
 * ************************** */
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

/* ***************************
 *  Build management view
 * ************************** */
invCont.buildManagement = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("./inventory/management", {
    title: "Inventory Management",
    nav,
    errors: null,
  })
}

/* ***************************
 *  Build add classification view
 * ************************** */
invCont.buildAddClassification = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("./inventory/add-classification", {
    title: "Add New Classification",
    nav,
    errors: null,
  })
}

/* ***************************
 *  Process add classification
 * ************************** */
invCont.addClassification = async function (req, res, next) {
  const { classification_name } = req.body
  
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("./inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors: errors.array(),
    })
    return
  }

  try {
    await invModel.addClassification(classification_name)
    req.flash("notice", `Classification "${classification_name}" was successfully added.`)
    let nav = await utilities.getNav()
    res.render("./inventory/management", {
      title: "Inventory Management",
      nav,
      errors: null,
    })
  } catch (error) {
    req.flash("notice", "Sorry, adding the classification failed.")
    let nav = await utilities.getNav()
    res.render("./inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors: [{ msg: "Sorry, adding the classification failed." }],
    })
  }
}

/* ***************************
 *  Build add inventory view
 * ************************** */
invCont.buildAddInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  let classificationList = await utilities.buildClassificationList()
  res.render("./inventory/add-inventory", {
    title: "Add New Inventory",
    nav,
    classificationList,
    errors: null,
  })
}

/* ***************************
 *  Process add inventory
 * ************************** */
invCont.addInventory = async function (req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    let classificationList = await utilities.buildClassificationList(req.body.classification_id)
    res.render("./inventory/add-inventory", {
      title: "Add New Inventory",
      nav,
      classificationList,
      errors: errors.array(),
      ...req.body
    })
    return
  }

  try {
    await invModel.addInventory(req.body)
    req.flash("notice", "Vehicle was successfully added to the inventory.")
    let nav = await utilities.getNav()
    res.render("./inventory/management", {
      title: "Inventory Management",
      nav,
      errors: null,
    })
  } catch (error) {
    req.flash("notice", "Sorry, adding the vehicle failed.")
    let nav = await utilities.getNav()
    let classificationList = await utilities.buildClassificationList(req.body.classification_id)
    res.render("./inventory/add-inventory", {
      title: "Add New Inventory",
      nav,
      classificationList,
      errors: [{ msg: "Sorry, adding the vehicle failed." }],
      ...req.body
    })
  }
}

module.exports = {
  buildByClassificationId: invCont.buildByClassificationId,
  buildByInvId,
  buildManagement: invCont.buildManagement,
  buildAddClassification: invCont.buildAddClassification,
  addClassification: invCont.addClassification,
  buildAddInventory: invCont.buildAddInventory,
  addInventory: invCont.addInventory,
}