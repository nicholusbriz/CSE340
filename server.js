/* ******************************************
 * This server.js file is the primary file of the
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const session = require("express-session");
const pool = require("./database/");
const express = require("express");
const bodyParser = require("body-parser");
const expressLayouts = require("express-ejs-layouts");
const env = require("dotenv").config();
const app = express();
const static = require("./routes/static");
const baseController = require("./controllers/baseController");
const baseRoute = require("./routes/baseRoute");
const inventoryRoute = require("./routes/inventoryRoute");
const utilities = require("./utilities/");
const accountRoute = require("./routes/accountRoute");
const commentRoute = require("./routes/commentRoute");
const cookieParser = require("cookie-parser");

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout"); // not at views root

/* ***********************
 * Middleware
 * ************************/
app.use(
  session({
    store: new (require("connect-pg-simple")(session))({
      createTableIfMissing: true,
      pool,
    }),
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    name: "sessionId",
  }),
);

//Cookie Handler
app.use(cookieParser());
// Express Messages Middleware
app.use(require("connect-flash")());
app.use(function (req, res, next) {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

// Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// JWT Token Middleware
app.use(utilities.checkJWTToken);

/* ***********************
 * Routes
 *************************/
app.use(express.static("public"));

// Index route
app.get("/", utilities.handleErrors(baseController.buildHome));

// Base routes
app.use("/", baseRoute);

// Inventory routes
app.use("/inv", inventoryRoute);

//Account routes
app.use("/account", accountRoute);

// Comment routes
app.use("/comments", commentRoute);

//app.get("/", function(req, res) {
//res.render("index", {title: "Home"})
//})
// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({ status: 404, message: "Sorry, we appear to have lost that page." });
});

/* ***********************
 * Express Error Handler
 * Place after all other middleware
 *************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav();
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);

  let message;
  if (err.status == 404) {
    message = err.message;
  } else {
    message = "Oh no! There was a crash. Maybe try a different route?";
  }

  res.status(err.status || 500).render("errors/error", {
    title: err.status || "Server Error",
    message,
    nav,
  });
});

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT || 3000;
const host = process.env.HOST || "0.0.0.0";

app.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}`);
});
