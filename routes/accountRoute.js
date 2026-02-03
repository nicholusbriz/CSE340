const express = require("express");
const router = new express.Router();
const utilities = require("../utilities");
const accountController = require("../controllers/accountController");
const regValidate = require("../utilities/account-validation");
const jwt = require("jsonwebtoken")
require("dotenv").config()

//Define Get route for "my Account" Link
router.get("/login", utilities.handleErrors(accountController.buildLogin));

//Default route for account management
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildManagement));

//Define Get route for "Register account" Link
router.get(
  "/register",
  utilities.handleErrors(accountController.buildRegister),
);

// Process the registration data
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount),
);


//process the login request
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

//Export router
module.exports = router;
