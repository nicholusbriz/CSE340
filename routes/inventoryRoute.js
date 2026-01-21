const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require('../utilities')

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Vehicle detail route 
router.get('/detail/:inv_id', utilities.handleErrors(invController.buildByInvId))

module.exports = router;