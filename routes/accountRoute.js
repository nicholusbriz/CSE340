const express = require("express");
const router = new express.Router();
const utilities = require("../utilities");
const accountController = require("../controllers/accountController");
const regValidate = require("../utilities/account-validation");
const jwt = require("jsonwebtoken")
const { body, validationResult } = require("express-validator");
require("dotenv").config()

//Define Get route for "my Account" Link
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// Process logout request
router.get("/logout", (req, res) => {
  res.clearCookie("jwt")
  req.flash("notice", "You have been successfully logged out.")
  res.redirect("/") // Redirect to home view
});

//Default route for account management
router.get("/", utilities.handleErrors(accountController.buildManagement));

// Build update account view
router.get("/update/:account_id", utilities.handleErrors(accountController.buildUpdateAccount));

// Process account update
router.post("/update/:account_id", 
  [
    body("account_firstname")
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage("First name is required and must be less than 50 characters."),
    
    body("account_lastname")
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage("Last name is required and must be less than 50 characters."),
    
    body("account_email")
      .trim()
      .isEmail()
      .withMessage("Please provide a valid email address.")
      .normalizeEmail(),
  ],
  utilities.handleErrors(accountController.updateAccount)
);

// Process password update
router.post("/update-password/:account_id", 
  [
    body("account_password")
      .trim()
      .isLength({ min: 12 })
      .withMessage("Password must be at least 12 characters long.")
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{12,}$/)
      .withMessage("Password must contain at least 1 number, 1 uppercase letter, 1 lowercase letter, and 1 special character."),
  ],
  utilities.handleErrors(accountController.updatePassword)
);

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
