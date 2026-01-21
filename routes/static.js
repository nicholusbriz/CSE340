const express = require("express")
const path = require("path")
const router = express.Router()

// Serve everything inside /public at the root
router.use(express.static(path.join(__dirname, "../public")))

module.exports = router
