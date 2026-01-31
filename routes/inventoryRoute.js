const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities");
const { body, validationResult } = require("express-validator");

// Route to build inventory by classification view
router.get(
  "/type/:classificationId",
  utilities.handleErrors(invController.buildByClassificationId),
);

// Vehicle detail route
router.get(
  "/detail/:inv_id",
  utilities.handleErrors(invController.buildByInvId),
);

// Management view route
router.get(
  "/",
  utilities.handleErrors(invController.buildManagement),
);

// Add Classification view route
router.get(
  "/add-classification",
  utilities.handleErrors(invController.buildAddClassification),
);

// Process Add Classification
router.post(
  "/add-classification",
  [
    body("classification_name")
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage("Classification name is required and must be less than 50 characters.")
      .matches(/^[a-zA-Z0-9]+$/)
      .withMessage("Classification name cannot contain spaces or special characters."),
  ],
  utilities.handleErrors(invController.addClassification),
);

// Add Inventory view route
router.get(
  "/add-inventory",
  utilities.handleErrors(invController.buildAddInventory),
);

// Process Add Inventory
router.post(
  "/add-inventory",
  [
    body("classification_id")
      .notEmpty()
      .withMessage("Please select a classification."),
    
    body("inv_make")
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage("Make is required and must be less than 50 characters."),
    
    body("inv_model")
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage("Model is required and must be less than 50 characters."),
    
    body("inv_year")
      .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
      .withMessage("Please provide a valid year."),
    
    body("inv_price")
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number."),
    
    body("inv_miles")
      .isInt({ min: 0 })
      .withMessage("Mileage must be a positive number."),
    
    body("inv_color")
      .trim()
      .isLength({ min: 1, max: 30 })
      .withMessage("Color is required and must be less than 30 characters."),
    
    body("inv_description")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Description is required."),
    
    body("inv_image")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Image path is required."),
    
    body("inv_thumbnail")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Thumbnail path is required."),
  ],
  utilities.handleErrors(invController.addInventory),
);

module.exports = router;
