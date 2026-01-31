# Node.js + Express + EJS Project Architecture - Complete Study Guide

## TABLE OF CONTENTS

1. Folder Structure Overview
2. Entry Point (server.js)
3. Middleware Setup
4. Routes Architecture
5. Controllers Architecture
6. Models Architecture
7. Views (EJS) Architecture
8. Error Handling
9. Import/Export Flow
10. Request/Response Cycle Visualization
11. Key Concepts for Revision
12. Security Practices

---

## 1. FOLDER STRUCTURE OVERVIEW

```
CSE340/
│
├── server.js                          # Entry point - initializes Express app
├── package.json                       # Project dependencies and metadata
├── pnpm-lock.yaml                     # Dependency lock file
│
├── config/                            # Configuration files (optional)
│   └── database.js                    # Database connection setup
│
├── database/                          # Database initialization & connection
│   ├── index.js                       # Pool export for SQL queries
│   ├── db.js                          # Database configuration
│   └── assignment2.sql                # Schema definitions
│
├── routes/                            # Route definitions
│   ├── static.js                      # Static routes (home, about)
│   ├── baseRoute.js                   # Base application routes
│   ├── accountRoute.js                # Account-related routes
│   └── inventoryRoute.js              # Inventory-related routes
│
├── controllers/                       # Business logic & request handlers
│   ├── baseController.js              # Home, about page handlers
│   ├── accountController.js           # Login, register, account handlers
│   └── invController.js               # Inventory handlers
│
├── models/                            # Database queries & data operations
│   ├── account-model.js               # Account table queries
│   └── inventory-model.js             # Inventory table queries
│
├── utilities/                         # Helper functions & middleware
│   ├── index.js                       # Exported utilities
│   └── account-validation.js          # Express-validator rules
│
├── views/                             # EJS template files
│   ├── index.ejs                      # Home page template
│   ├── account/
│   │   ├── login.ejs                  # Login form template
│   │   └── register.ejs               # Registration form template
│   ├── inventory/
│   │   ├── classification.ejs         # Classification display
│   │   └── detail.ejs                 # Vehicle details page
│   ├── errors/
│   │   └── error.ejs                  # Error page template
│   ├── layouts/
│   │   └── layout.ejs                 # Main layout wrapper
│   └── partials/
│       ├── header.ejs                 # Header component
│       ├── footer.ejs                 # Footer component
│       ├── navigation.ejs             # Navigation component
│       └── head.ejs                   # Head section component
│
├── public/                            # Static assets
│   ├── css/
│   │   └── styles.css                 # Stylesheet
│   ├── js/
│   │   └── script.js                  # Client-side JavaScript
│   └── images/
│       ├── site/                      # Site images
│       ├── vehicles/                  # Vehicle images
│       └── upgrades/                  # Upgrade images
│
└── .env                               # Environment variables (not in repo)
```

### Folder Purpose Breakdown:

| Folder         | Purpose                              | Contains                            |
| -------------- | ------------------------------------ | ----------------------------------- |
| `database/`    | Database connection & initialization | Connection pool, schema setup       |
| `routes/`      | URL mapping to controllers           | GET/POST route definitions          |
| `controllers/` | Business logic & request handling    | Functions that process requests     |
| `models/`      | Database queries & data access       | SQL queries, database operations    |
| `utilities/`   | Reusable helper functions            | Validation rules, custom middleware |
| `views/`       | Presentation layer (HTML+EJS)        | Templates rendered with data        |
| `public/`      | Static files served to client        | CSS, JavaScript, images             |

---

## 2. ENTRY POINT (server.js)

The `server.js` file is where your Express application starts. It sets up middleware, connects to the database, registers routes, and starts the server.

### Example server.js Structure:

```javascript
// =====================
// IMPORTS & SETUP
// =====================
const express = require("express");
const app = express();
const path = require("path");
require("dotenv").config();
const session = require("express-session");
const pool = require("./database");

// =====================
// MIDDLEWARE SETUP
// =====================

// 1. View engine setup (EJS)
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// 2. Static files
app.use(express.static(path.join(__dirname, "public")));

// 3. Body parser middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 4. Session middleware
app.use(
  session({
    store: new (require("connect-pg-simple")(session))({
      createTableIfMissing: true,
      pool: pool,
    }),
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
  }),
);

// 5. Flash messages middleware
app.use(require("connect-flash")());

// =====================
// ROUTE REGISTRATION
// =====================
app.use(require("./routes/static"));
app.use("/account", require("./routes/accountRoute"));
app.use("/inv", require("./routes/inventoryRoute"));

// =====================
// ERROR HANDLING
// =====================
app.use(require("./middleware/errorHandler"));

// =====================
// SERVER START
// =====================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
```

### Key Concepts in server.js:

1. **View Engine**: `app.set("view engine", "ejs")` tells Express to use EJS for rendering templates
2. **Static Files**: `app.use(express.static(...))` serves CSS, JS, images without routing
3. **Middleware Order Matters**: Process requests in this order:
   - Body parser (reads request body)
   - Session (manages user sessions)
   - Routes (handle requests)
   - Error handler (catches errors)
4. **Route Registration**: `app.use("/account", routeFile)` prefixes all routes in that file

---

## 3. MIDDLEWARE SETUP

Middleware functions run BETWEEN receiving a request and sending a response. They process requests in order.

### Middleware Types:

```javascript
// =====================
// 1. BUILT-IN MIDDLEWARE
// =====================

// Parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Parse JSON request bodies
app.use(express.json());

// Serve static files (CSS, JS, images)
app.use(express.static(path.join(__dirname, "public")));

// =====================
// 2. THIRD-PARTY MIDDLEWARE
// =====================

// Session management (stores user data between requests)
app.use(
  session({
    store: new sessionStore({ pool: pool }),
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
  }),
);

// Flash messages (one-time messages displayed to user)
app.use(require("connect-flash")());

// =====================
// 3. CUSTOM MIDDLEWARE
// =====================

// Error handling middleware (catches errors from routes)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).render("errors/error", {
    title: "Server Error",
    message: err.message,
  });
});

// =====================
// MIDDLEWARE FLOW EXAMPLE
// =====================
// REQUEST comes in
//   ↓
// Body parser reads request data
//   ↓
// Session middleware loads session data
//   ↓
// Route handler processes request
//   ↓
// Controller calls model for database data
//   ↓
// View is rendered with data
//   ↓
// RESPONSE sent to client
```

### Common Middleware in Your Project:

| Middleware             | Purpose                               | Example                           |
| ---------------------- | ------------------------------------- | --------------------------------- |
| `express.urlencoded()` | Parse form data from POST requests    | Parse `req.body` from forms       |
| `express.static()`     | Serve CSS, JS, images without routing | Serves `/public/css/styles.css`   |
| `session`              | Store user data across requests       | `req.session.userId` persists     |
| `connect-flash()`      | Show temporary messages               | `req.flash("notice", "Success!")` |
| Custom validators      | Validate form input                   | `account-validation.js` rules     |

---

## 4. ROUTES ARCHITECTURE

Routes are URL patterns that connect HTTP requests to controller functions.

### Example: accountRoute.js

```javascript
// =====================
// ROUTE FILE: routes/accountRoute.js
// =====================

const express = require("express");
const router = new express.Router();
const utilities = require("../utilities");
const accountController = require("../controllers/accountController");
const regValidate = require("../utilities/account-validation");

/* =====================
   1. GET ROUTES (Display Forms)
   ===================== */

// GET /account/login - Deliver login form view
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// GET /account/register - Deliver registration form view
router.get(
  "/register",
  utilities.handleErrors(accountController.buildRegister),
);

/* =====================
   2. POST ROUTES (Process Form Data)
   ===================== */

// POST /account/register - Process registration form
router.post(
  "/register",
  regValidate.registationRules(), // Validation rules
  regValidate.checkRegData, // Check for errors
  utilities.handleErrors(accountController.registerAccount), // Handle request
);

// POST /account/login - Process login attempt
router.post(
  "/login",
  regValidate.loginRules(), // Validation rules
  regValidate.checkLoginData, // Check for errors
  utilities.handleErrors(accountController.buildLogin), // Handle request
);

// =====================
// EXPORT ROUTER
// =====================
module.exports = router;
```

### Route Anatomy:

```javascript
router.METHOD(
  "/path", // URL path (GET /account/login)
  middleware1, // Validation rules
  middleware2, // Check validation results
  controllerFunction, // Handle request & return response
);
```

### Route Request Flow:

```
HTTP REQUEST: POST /account/register
         ↓
Route matches: router.post("/register", ...)
         ↓
Validation Rules: regValidate.registationRules()
  - Check required fields
  - Validate email format
  - Check password strength
         ↓
Validation Check: regValidate.checkRegData
  - If errors: return register view with error messages
  - If valid: continue to next middleware
         ↓
Controller Function: accountController.registerAccount()
  - Hash password
  - Call model to insert into database
  - Return success/error view
         ↓
HTTP RESPONSE: Login view or error message
```

---

## 5. CONTROLLERS ARCHITECTURE

Controllers contain business logic. They receive requests, call models for data, and return views.

### Example: controllers/accountController.js

```javascript
// =====================
// CONTROLLER FILE: controllers/accountController.js
// =====================

const utilities = require("../utilities/");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs");

/* =====================
   1. DELIVER VIEWS (GET requests)
   ===================== */

// Purpose: Display the login form
async function buildLogin(req, res, next) {
  // Get navigation menu from database
  let nav = await utilities.getNav();

  // Render login view with data
  res.render("account/login", {
    title: "Login",
    nav: nav,
    errors: null,
  });
}

// Purpose: Display the registration form
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/register", {
    title: "Register",
    nav: nav,
    errors: null,
  });
}

/* =====================
   2. PROCESS FORMS (POST requests)
   ===================== */

// Purpose: Create a new account
async function registerAccount(req, res) {
  // 1. Get navigation menu
  let nav = await utilities.getNav();

  // 2. Extract form data from request body
  const {
    account_firstname,
    account_lastname,
    account_email,
    account_password,
  } = req.body;

  // 3. Hash the password (security)
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hashSync(account_password, 10);
  } catch (error) {
    req.flash(
      "notice",
      "Sorry, there was an error processing the registration.",
    );
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    });
    return;
  }

  // 4. Call model to insert into database
  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword,
  );

  // 5. Check result and respond
  if (regResult) {
    // Success: Show login view with success message
    req.flash(
      "notice",
      `Congratulations, you're registered ${account_firstname}. Please log in.`,
    );
    res.status(201).render("account/login", {
      title: "Login",
      nav,
    });
  } else {
    // Failure: Show register view with error message
    req.flash("notice", "Sorry, the registration failed.");
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
    });
  }
}

// =====================
// EXPORTS
// =====================
module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
};
```

### Controller Pattern:

```
1. RECEIVE REQUEST (req.body contains form data)
   ↓
2. VALIDATE DATA (already done by validation middleware)
   ↓
3. PROCESS DATA (hash passwords, calculate values)
   ↓
4. CALL MODEL (query database)
   ↓
5. CHECK RESULT (success or failure?)
   ↓
6. RENDER VIEW (return HTML with data or error)
```

### Key Controller Concepts:

| Concept        | Example                             | Purpose                              |
| -------------- | ----------------------------------- | ------------------------------------ |
| `req.body`     | `req.body.account_email`            | Form data submitted by user          |
| `req.flash()`  | `req.flash("notice", "Success!")`   | One-time message shown to user       |
| `res.render()` | `res.render("login", {data})`       | Send EJS template as response        |
| `res.status()` | `res.status(201)`                   | HTTP status code (200=OK, 500=Error) |
| Model call     | `accountModel.registerAccount(...)` | Get/insert database data             |

---

## 6. MODELS ARCHITECTURE

Models contain all database queries. They execute SQL and return results to controllers.

### Example: models/account-model.js

```javascript
// =====================
// MODEL FILE: models/account-model.js
// =====================

const pool = require("../database/");

/* =====================
   1. QUERY FUNCTIONS
   ===================== */

// Purpose: Insert new account into database
async function registerAccount(
  account_firstname,
  account_lastname,
  account_email,
  account_password,
) {
  try {
    // SQL INSERT query
    const sql = `
      INSERT INTO account 
      (account_firstname, account_lastname, account_email, account_password, account_type) 
      VALUES ($1, $2, $3, $4, 'Client') 
      RETURNING *
    `;

    // Execute query with parameters
    return await pool.query(sql, [
      account_firstname,
      account_lastname,
      account_email,
      account_password,
    ]);
  } catch (error) {
    // Return error message if query fails
    return error.message;
  }
}

// Purpose: Check if email already exists
async function checkExistingEmail(account_email) {
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1";
    const email = await pool.query(sql, [account_email]);

    // Return row count (0 = doesn't exist, 1+ = exists)
    return email.rowCount;
  } catch (error) {
    return error.message;
  }
}

// Purpose: Get account by email (for login)
async function getAccountByEmail(account_email) {
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1";
    const account = await pool.query(sql, [account_email]);
    return account.rows[0]; // Return first row (single account)
  } catch (error) {
    return error.message;
  }
}

/* =====================
   2. EXPORTS
   ===================== */

module.exports = {
  registerAccount,
  checkExistingEmail,
  getAccountByEmail,
};
```

### SQL Query Patterns:

```javascript
// =====================
// 1. INSERT (Create)
// =====================
const sql = `
  INSERT INTO account (column1, column2, column3) 
  VALUES ($1, $2, $3) 
  RETURNING *
`;
const result = await pool.query(sql, [value1, value2, value3]);

// =====================
// 2. SELECT (Read)
// =====================
const sql = "SELECT * FROM account WHERE account_email = $1";
const result = await pool.query(sql, [email]);
const firstRow = result.rows[0];

// =====================
// 3. UPDATE (Update)
// =====================
const sql = `
  UPDATE account 
  SET account_firstname = $1, account_lastname = $2 
  WHERE account_id = $3
`;
const result = await pool.query(sql, [firstName, lastName, id]);

// =====================
// 4. DELETE (Delete)
// =====================
const sql = "DELETE FROM account WHERE account_id = $1";
const result = await pool.query(sql, [id]);
```

### Model Result Structure:

```javascript
// Query result object
{
  command: "INSERT",           // SQL command used
  rowCount: 1,                 // Number of rows affected
  rows: [                      // Array of returned rows
    {
      account_id: 42,
      account_firstname: "John",
      account_lastname: "Doe",
      account_email: "john@example.com",
      account_password: "$2a$10$hash...",
      account_type: "Client"
    }
  ]
}
```

### Parameterized Queries (Security):

```javascript
// ✅ SAFE - Uses parameters ($1, $2, etc.)
const sql = "SELECT * FROM account WHERE account_email = $1";
const result = await pool.query(sql, [userEmail]);

// ❌ DANGEROUS - SQL Injection vulnerability!
const sql = "SELECT * FROM account WHERE account_email = '" + userEmail + "'";
const result = await pool.query(sql);
```

---

## 7. VIEWS (EJS) ARCHITECTURE

Views are HTML templates with EJS syntax that display data from controllers.

### Example: views/account/register.ejs

```ejs
<!-- ===================== -->
<!-- REGISTER FORM VIEW    -->
<!-- ===================== -->

<h1><%= title %></h1>

<!-- Display flash messages -->
<%- messages() %>

<!-- Display validation errors -->
<% if (errors) { %>
  <ul class="notice">
    <% errors.array().forEach(error => { %>
      <li><%= error.msg %></li>
    <% }) %>
  </ul>
<% } %>

<!-- Registration Form -->
<form action="/account/register" method="post" class="register-form">

  <!-- First Name Input -->
  <div class="form-group">
    <label for="firstname">First Name</label>
    <input
      type="text"
      id="firstname"
      name="account_firstname"
      required
      placeholder="Enter your first name"
      value="<%= locals.account_firstname %>">
  </div>

  <!-- Last Name Input -->
  <div class="form-group">
    <label for="lastname">Last Name</label>
    <input
      type="text"
      id="lastname"
      name="account_lastname"
      required
      placeholder="Enter your last name"
      value="<%= locals.account_lastname %>">
  </div>

  <!-- Email Input -->
  <div class="form-group">
    <label for="email">Email Address</label>
    <input
      type="email"
      id="email"
      name="account_email"
      required
      placeholder="Enter your email"
      value="<%= locals.account_email %>">
  </div>

  <!-- Password Input -->
  <div class="form-group">
    <label for="password">Password</label>
    <input
      type="password"
      id="password"
      name="account_password"
      required
      pattern="^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{12,}$"
      placeholder="Enter your password">
  </div>

  <!-- Submit Button -->
  <button type="submit" class="btn-submit">Register</button>
</form>

<!-- Link to Login -->
<p>Already have an account? <a href="/account/login">Sign in</a></p>
```

### EJS Syntax Reference:

```ejs
<!-- ===================== -->
<!-- 1. OUTPUT VARIABLES    -->
<!-- ===================== -->

<!-- Escape HTML (safe) -->
<%= variableName %>

<!-- Output as-is (dangerous if user input) -->
<%- variableName %>

<!-- ===================== -->
<!-- 2. CONTROL FLOW        -->
<!-- ===================== -->

<!-- IF statement -->
<% if (condition) { %>
  <p>This shows if condition is true</p>
<% } %>

<!-- LOOP -->
<% items.forEach(item => { %>
  <p><%= item.name %></p>
<% }) %>

<!-- ===================== -->
<!-- 3. DATA FROM CONTROLLER -->
<!-- ===================== -->

<!-- Variable from res.render() -->
<h1><%= title %></h1>

<!-- Array of errors -->
<% errors.array().forEach(error => { %>
  <p><%= error.msg %></p>
<% }) %>

<!-- Using locals for sticky forms -->
<input value="<%= locals.account_firstname %>">

<!-- ===================== -->
<!-- 4. INCLUDES/PARTIALS   -->
<!-- ===================== -->

<!-- Include another EJS file -->
<%- include('partials/header') %>

<!-- Include with local variables -->
<%- include('product-detail', { product: productData }) %>
```

### View Data Flow:

```
Controller calls res.render()
         ↓
{ title: "Login", nav: navData, errors: [] }
         ↓
Express renders login.ejs with this data
         ↓
EJS processes <%= and <% tags
         ↓
HTML sent to browser
         ↓
Browser displays page to user
```

### Sticky Forms Example:

```ejs
<!-- ❌ NOT STICKY - User loses input on error -->
<input type="text" name="email" value="">

<!-- ✅ STICKY - User's input reappears on error -->
<input type="text" name="email" value="<%= locals.account_email %>">

<!-- Flow -->
1. User enters: john@example.com
2. Validation fails
3. Controller renders view with: { account_email: "john@example.com" }
4. EJS template shows: value="john@example.com"
5. User sees their email still in field
```

---

## 8. ERROR HANDLING

Error handling catches problems and shows appropriate messages to users.

### Global Error Handler:

```javascript
// =====================
// MIDDLEWARE: Error Handler
// =====================

// This middleware catches errors from all routes
// Must be LAST middleware defined
app.use((err, req, res, next) => {
  // Log error to console for debugging
  console.error(err.stack);

  // Get HTTP status code (default to 500 if not set)
  const status = err.status || 500;

  // Render error page
  res.status(status).render("errors/error", {
    title: "Server Error",
    message: err.message || "Sorry, an unexpected error occurred.",
  });
});
```

### Error Page View: views/errors/error.ejs

```ejs
<div class="error-container">
  <h1><%= title %></h1>
  <p><%= message %></p>
  <a href="/">Return to Home</a>
</div>
```

### Error Handling in Controller:

```javascript
async function registerAccount(req, res) {
  try {
    // Try to hash password
    const hashedPassword = await bcrypt.hashSync(account_password, 10);

    // Try to insert into database
    const regResult = await accountModel.registerAccount(...);

    // Check if successful
    if (!regResult) {
      throw new Error("Registration failed");
    }

    // Success
    res.render("success");

  } catch (error) {
    // Error caught here
    req.flash("notice", `Error: ${error.message}`);
    res.status(500).render("account/register", {
      errors: [{ msg: error.message }]
    });
  }
}
```

### Try-Catch Pattern:

```javascript
try {
  // Code that might fail
  const result = await database.query(sql);
  const parsed = JSON.parse(result);

  // Continue if successful
  res.render("view", { data: result });
} catch (error) {
  // Handle error
  console.error("Error:", error.message);
  res.status(500).render("error", {
    message: error.message,
  });
}
```

### Database Error Handling:

```javascript
// Model function with error handling
async function getUser(userId) {
  try {
    const sql = "SELECT * FROM account WHERE account_id = $1";
    const result = await pool.query(sql, [userId]);

    if (result.rowCount === 0) {
      throw new Error("User not found");
    }

    return result.rows[0];
  } catch (error) {
    console.error("Database error:", error);
    return null; // Or throw error to be caught by controller
  }
}
```

### Error Types:

| Error Type       | Cause                  | Solution                        |
| ---------------- | ---------------------- | ------------------------------- |
| Validation Error | User input invalid     | Show error message, reload form |
| Database Error   | SQL query failed       | Show generic error, log details |
| Not Found        | Resource doesn't exist | Show 404 error page             |
| Unauthorized     | User not logged in     | Redirect to login               |
| Server Error     | Unexpected problem     | Show error page, log details    |

---

## 9. IMPORT/EXPORT FLOW

Understanding how files connect through require() and module.exports.

### Complete Flow Example:

```
FILE HIERARCHY:
routes/accountRoute.js
    ↓ requires
controllers/accountController.js
    ↓ requires
models/account-model.js
    ↓ requires
database/index.js
    ↓ connects to
PostgreSQL Database
```

### Step-by-Step Connection:

#### Step 1: Database Setup (database/index.js)

```javascript
// database/index.js
const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 5432,
});

module.exports = pool; // Export pool connection
```

#### Step 2: Model (models/account-model.js)

```javascript
// models/account-model.js
const pool = require("../database/"); // Import pool

async function registerAccount(fname, lname, email, password) {
  const sql = "INSERT INTO account ... VALUES ($1, $2, $3, $4)";
  return await pool.query(sql, [fname, lname, email, password]);
}

module.exports = { registerAccount }; // Export functions
```

#### Step 3: Controller (controllers/accountController.js)

```javascript
// controllers/accountController.js
const accountModel = require("../models/account-model"); // Import model

async function registerAccount(req, res) {
  const {
    account_firstname,
    account_lastname,
    account_email,
    account_password,
  } = req.body;

  // Call model function
  const result = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    account_password,
  );

  if (result) {
    res.render("login");
  }
}

module.exports = { registerAccount }; // Export functions
```

#### Step 4: Route (routes/accountRoute.js)

```javascript
// routes/accountRoute.js
const accountController = require("../controllers/accountController"); // Import controller

router.post("/register", (req, res) => {
  // Call controller function
  accountController.registerAccount(req, res);
});

module.exports = router; // Export router
```

#### Step 5: Server (server.js)

```javascript
// server.js
const accountRoute = require("./routes/accountRoute"); // Import route

app.use("/account", accountRoute); // Use route

app.listen(3000);
```

### Request Flow Through All Layers:

```
USER: Click "Register" button on /account/register form
         ↓
BROWSER: POST /account/register (form data in body)
         ↓
SERVER (server.js): Route matches "/account/register"
         ↓
ROUTE (accountRoute.js): Call accountController.registerAccount()
         ↓
CONTROLLER (accountController.js):
  - Extract form data from req.body
  - Call accountModel.registerAccount()
         ↓
MODEL (account-model.js):
  - Create SQL INSERT query
  - Call pool.query() with SQL + parameters
         ↓
DATABASE (PostgreSQL):
  - Insert row into account table
  - Return result
         ↓
MODEL: Return result to controller
         ↓
CONTROLLER:
  - Check if successful
  - Call res.render("login")
         ↓
SERVER: Render login.ejs view
         ↓
BROWSER: Display login page with success message
         ↓
USER: Sees "Congratulations! Please log in."
```

### Export Patterns:

```javascript
// =====================
// 1. EXPORT SINGLE FUNCTION
// =====================

// Function definition
async function getData() {
  // ...
}

// Export
module.exports = getData;

// Use it
const getData = require("./file");
getData();

// =====================
// 2. EXPORT MULTIPLE FUNCTIONS (Object)
// =====================

// Function definitions
async function registerAccount() {}
async function getAccount() {}

// Export as object
module.exports = {
  registerAccount,
  getAccount,
};

// Use them
const model = require("./file");
model.registerAccount();
model.getAccount();

// =====================
// 3. REQUIRE WITH DESTRUCTURING
// =====================

// Instead of: const model = require(); model.registerAccount();
// Use: const { registerAccount } = require();
const { registerAccount, getAccount } = require("../models/account-model");

// Now call directly
await registerAccount(fname, lname, email, pwd);
```

---

## 10. REQUEST/RESPONSE CYCLE VISUALIZATION

Understanding how a request travels through the entire system.

### Complete Request/Response Cycle:

```
============================================
   1. USER ACTION IN BROWSER
============================================

User fills out registration form:
- First Name: "John"
- Last Name: "Doe"
- Email: "john@example.com"
- Password: "SecurePass123!"

User clicks "Register" button


============================================
   2. HTTP REQUEST SENT
============================================

POST /account/register
Content-Type: application/x-www-form-urlencoded

account_firstname=John&account_lastname=Doe&account_email=john@example.com&account_password=SecurePass123!


============================================
   3. SERVER RECEIVES REQUEST
============================================

server.js:
- Middleware stack processes request
- body-parser extracts form data
- req.body now contains:
  {
    account_firstname: "John",
    account_lastname: "Doe",
    account_email: "john@example.com",
    account_password: "SecurePass123!"
  }


============================================
   4. ROUTE MATCHING
============================================

accountRoute.js:
- URL matches: router.post("/register", ...)
- Validation middleware runs


============================================
   5. VALIDATION MIDDLEWARE
============================================

account-validation.js:
- Check firstname not empty ✓
- Check lastname not empty ✓
- Check email is valid format ✓
- Check password is strong ✓
- Check email doesn't already exist ✓

No errors, continue to next middleware


============================================
   6. CONTROLLER PROCESSES REQUEST
============================================

accountController.js registerAccount():
- Extract data from req.body
- Hash password using bcrypt
- Call model function


============================================
   7. MODEL QUERIES DATABASE
============================================

account-model.js registerAccount():
- Create SQL INSERT query
- Execute: INSERT INTO account (firstname, lastname, email, password, type)
           VALUES ('John', 'Doe', 'john@example.com', '$2a$10$...', 'Client')
- Database returns new account ID: 42


============================================
   8. CONTROLLER RECEIVES RESPONSE
============================================

accountController.js:
- Check if insertion successful ✓
- Set flash message: "Congratulations, you're registered John. Please log in."
- Call res.render("account/login", { title: "Login", nav: navData })


============================================
   9. SERVER RENDERS VIEW
============================================

server.js (with EJS middleware):
- Find views/account/login.ejs
- Process EJS tags with provided data
- Convert to HTML
- Replace <%= title %> with "Login"
- Replace <%= messages() %> with flash message


============================================
   10. HTML RESPONSE SENT TO BROWSER
============================================

HTTP/1.1 201 Created
Content-Type: text/html

<!DOCTYPE html>
<html>
<head><title>Login</title></head>
<body>
  <h1>Login</h1>
  <div class="notice">Congratulations, you're registered John. Please log in.</div>
  <form action="/account/login" method="post">
    ...
  </form>
</body>
</html>


============================================
   11. BROWSER RENDERS PAGE
============================================

Browser displays login page with:
- Success message: "Congratulations, you're registered John. Please log in."
- Empty email field
- Empty password field
- "Sign In" button


============================================
   12. USER SEES RESPONSE
============================================

User sees login page and can log in
```

### GET vs POST Request Types:

```
============================================
GET REQUEST (Fetch Data)
============================================

Purpose: Request data from server
Use: Loading pages, searching, filtering

Example:
GET /account/login HTTP/1.1

URL shows data: /search?query=cars
Data in: URL (query string)
Visible: Yes (in URL bar)
Secure: No (data in URL)
Amount: Limited (URL length limit)

Code:
<a href="/account/login">Click here</a>
<form action="/search" method="GET">


============================================
POST REQUEST (Send Data)
============================================

Purpose: Send data to server
Use: Form submission, creating records

Example:
POST /account/register HTTP/1.1

URL hides data: /account/register
Data in: Request body
Visible: No (not in URL)
Secure: Better (encrypted with HTTPS)
Amount: Unlimited

Code:
<form action="/account/register" method="POST">
  <input name="account_firstname" />
  <button type="submit">Submit</button>
</form>


============================================
KEY DIFFERENCES
============================================

| Aspect | GET | POST |
|--------|-----|------|
| Purpose | Retrieve data | Send data |
| Data Location | URL query string | Request body |
| Visible | Yes, in URL | No, hidden |
| Secure | No | Yes (with HTTPS) |
| Size Limit | ~2000 characters | Much larger |
| Caching | Browser caches | Not cached |
| Bookmarkable | Yes | No |
| When to Use | Fetch, search, filter | Register, login, delete |
```

---

## 11. KEY CONCEPTS FOR REVISION

### 11.1 Async/Await

```javascript
// =====================
// WHAT IS ASYNC/AWAIT?
// =====================
// Async = Asynchronous (doesn't wait)
// Await = Wait for async operation to complete

// =====================
// PROBLEM: Database query takes time
// =====================

// Without async: Code runs immediately, database result not ready
const result = database.query(sql); // Returns undefined!

// =====================
// SOLUTION: Use async/await
// =====================

async function getData() {
  // await pauses execution until database responds
  const result = await database.query(sql);

  // Now result has actual data
  console.log(result);

  return result;
}

// =====================
// CALLING ASYNC FUNCTION
// =====================

// Must use await when calling async function
const data = await getData();

// Or use .then()
getData().then((data) => {
  console.log(data);
});
```

### 11.2 Session Management

```javascript
// =====================
// WHAT IS SESSION?
// =====================
// Session = Data that persists across multiple requests
// Without session: Each request is independent
// With session: User data remembered between requests

// =====================
// EXAMPLE: Session in action
// =====================

// Request 1: User logs in
req.session.userId = 42;
req.session.username = "john";

// Request 2: User visits dashboard
console.log(req.session.userId); // Still 42!

// Request 3: User logs out
delete req.session.userId;

// =====================
// COMMON SESSION USES
// =====================

// Check if user logged in
if (req.session.userId) {
  // User is logged in
}

// Store user data
req.session.userId = user.id;
req.session.username = user.name;
req.session.userType = user.type;

// Flash message (one-time message)
req.flash("notice", "Login successful!");
// Next page shows message, then it's deleted
```

### 11.3 Password Hashing with Bcrypt

```javascript
// =====================
// WHY HASH PASSWORDS?
// =====================
// Plain text password in database = Security disaster
// If hacked: All passwords exposed
// Solution: Hash password before storing

// =====================
// HOW BCRYPT WORKS
// =====================

const bcrypt = require("bcryptjs");

// 1. HASH password when registering
const password = "SecurePass123!";
const hashedPassword = bcrypt.hashSync(password, 10);
// Result: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86xNtx7AlFm
// Always different even for same password!

// 2. STORE hashed password in database
await database.query(
  "INSERT INTO account (password) VALUES ($1)",
  [hashedPassword], // Store hash, NOT plain password
);

// 3. COMPARE on login
const userPassword = "SecurePass123!"; // User submits
const storedHash = "$2a$10$..."; // From database

const matches = bcrypt.compareSync(userPassword, storedHash);
// Returns: true or false
```

### 11.4 Environment Variables

```javascript
// =====================
// WHAT ARE ENV VARIABLES?
// =====================
// Configuration that changes per environment
// Development vs Production (different databases, etc.)
// Sensitive data (passwords, API keys)
// NOT committed to git for security

// =====================
// .env FILE
// =====================

DB_HOST = localhost;
DB_USER = postgres;
DB_PASSWORD = mypassword;
DB_NAME = cse340;
SESSION_SECRET = secret123;
NODE_ENV = development;
PORT = 3000;

// =====================
// LOADING ENV VARIABLES
// =====================

require("dotenv").config();

// Access variables
const dbHost = process.env.DB_HOST; // "localhost"
const dbPassword = process.env.DB_PASSWORD; // "mypassword"

// =====================
// WHY IMPORTANT?
// =====================

// Different values in different environments:
// Development: localhost database
// Production: AWS database
// Keep sensitive data secret (don't share .env file)
// Change config without changing code
```

### 11.5 Form Validation (Client vs Server)

```javascript
// =====================
// CLIENT-SIDE VALIDATION (Browser)
// =====================
// HTML attributes validate before sending to server

<form>
  <input type="email" required />         <!-- Must be valid email -->
  <input type="text" pattern="[a-z]+" /> <!-- Only lowercase letters -->
  <input type="text" minlength="5" />    <!-- At least 5 characters -->
  <button type="submit">Submit</button>
</form>

// Problems:
// - User can disable browser validation
// - Attacker can send direct requests to server
// - Not secure!

// =====================
// SERVER-SIDE VALIDATION (Backend)
// =====================
// Validate again on server (ALWAYS DO THIS!)

const { body, validationResult } = require("express-validator");

router.post(
  "/register",
  body("email").isEmail(),           // Must be valid email
  body("password").isLength({ min: 12 }),  // At least 12 chars
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("form", { errors: errors.array() });
    }
    // Continue if valid
  }
);

// Why server-side validation:
// - Prevents invalid data in database
// - Works even if browser validation disabled
// - Attacker can't bypass it
// - Essential for security!

// =====================
// BEST PRACTICE: Both!
// =====================
// Use BOTH for best user experience:
// - Client-side: Fast feedback to user
// - Server-side: Real security validation
```

### 11.6 Sticky Forms (Repopulate Fields)

```javascript
// =====================
// PROBLEM: Form loses data on validation error
// =====================

// User enters: john@example.com and clicks submit
// Validation fails (password too weak)
// Form reloads: Email field is EMPTY!
// User frustrated: Has to retype everything

// =====================
// SOLUTION: Sticky forms
// =====================

// 1. Controller passes form data to view
controller:
  res.render("register", {
    account_firstname: req.body.account_firstname,
    account_lastname: req.body.account_lastname,
    account_email: req.body.account_email,
  });

// 2. View uses data in value attribute
register.ejs:
  <input
    type="text"
    name="account_firstname"
    value="<%= locals.account_firstname %>"
  />

// 3. Result: User's input still in field after error!

// =====================
// WHY locals?
// =====================

// If no data passed: locals.account_firstname = undefined
// <%= undefined %> = nothing (no error!)
// So safe to use even on first page load

// Alternative syntax:
value="<%= typeof account_firstname != 'undefined' ? account_firstname : '' %>"
// But locals is cleaner!
```

### 11.7 Flash Messages

```javascript
// =====================
// WHAT ARE FLASH MESSAGES?
// =====================
// Temporary message shown to user one time only
// Used for success/error/warning messages

// =====================
// HOW TO USE
// =====================

// 1. Set flash message in controller
res.flash("notice", "Registration successful!");
res.render("login");

// 2. Display flash message in view
views/login.ejs:
  <%- messages() %>
  <!-- Renders: Registration successful! -->

// 3. Flash message automatically deleted after display
// Next request won't show it

// =====================
// COMMON USES
// =====================

// Success
req.flash("notice", "You've successfully registered!");

// Error
req.flash("warning", "That email already exists");

// Info
req.flash("info", "Check your email to verify");

// =====================
// VIEW CODE
// =====================

<%- messages() %>
<!-- Displays all flash messages -->
<!-- Auto-formatted as alerts/notices -->
```

### 11.8 EJS Includes/Partials

```javascript
// =====================
// WHY USE INCLUDES?
// =====================
// Avoid repeating code (DRY = Don't Repeat Yourself)
// Header used on every page
// Navigation used on every page
// Footer used on every page

// =====================
// CREATING PARTIALS
// =====================

views/partials/header.ejs:
  <header>
    <h1>My Site</h1>
  </header>

views/partials/navigation.ejs:
  <nav>
    <a href="/">Home</a>
    <a href="/about">About</a>
  </nav>

// =====================
// USING PARTIALS
// =====================

views/index.ejs:
  <%- include('partials/header') %>
  <%- include('partials/navigation') %>

  <main>
    <h2>Welcome</h2>
  </main>

  <%- include('partials/footer') %>

// =====================
// RESULT
// =====================
// Header code
// Navigation code
// Main content
// Footer code
// (All combined into one HTML page)

// =====================
// PASSING DATA TO PARTIALS
// =====================

<%- include('partials/product', { product: productData }) %>

views/partials/product.ejs:
  <div class="product">
    <h3><%= product.name %></h3>
    <p>$<%= product.price %></p>
  </div>
```

---

## 12. SECURITY PRACTICES

### 12.1 Parameterized Queries (SQL Injection Prevention)

```javascript
// =====================
// SQL INJECTION ATTACK
// =====================

// ❌ VULNERABLE CODE
const email = req.body.email;
const sql = "SELECT * FROM account WHERE account_email = '" + email + "'";
// If attacker enters: ' OR '1'='1
// SQL becomes: WHERE account_email = '' OR '1'='1
// Returns ALL accounts!

// =====================
// PROTECTION: Use Parameters
// =====================

// ✅ SAFE CODE
const email = req.body.email;
const sql = "SELECT * FROM account WHERE account_email = $1";
await pool.query(sql, [email]);
// Treats email as DATA, not SQL code
// ' OR '1'='1' treated as literal string
```

### 12.2 Password Hashing

```javascript
// ✅ CORRECT: Hash before storing
const hashedPassword = bcrypt.hashSync(plainPassword, 10);
await db.query("INSERT INTO account (password) VALUES ($1)", [hashedPassword]);

// ❌ WRONG: Storing plain text
await db.query(
  "INSERT INTO account (password) VALUES ($1)",
  [plainPassword], // Never do this!
);
```

### 12.3 Environment Variables

```javascript
// ✅ CORRECT: Use environment variables
const dbPassword = process.env.DB_PASSWORD;

// ❌ WRONG: Hardcoded password
const dbPassword = "mySecurePassword123"; // Never do this!
```

### 12.4 Input Validation

```javascript
// ✅ CORRECT: Always validate user input
const { body, validationResult } = require("express-validator");

router.post(
  "/register",
  body("email").isEmail(),
  body("password").isLength({ min: 12 }),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("form", { errors });
    }
  },
);

// ❌ WRONG: Trust user input
router.post("/register", (req, res) => {
  // No validation - anything goes!
  db.insert(req.body);
});
```

### 12.5 HTTPS (In Production)

```javascript
// ✅ CORRECT: Use HTTPS in production
// Encrypts all data sent between browser and server
// Passwords, emails, personal data all encrypted
// Should be enabled on production server

// ❌ WRONG: Use HTTP in production
// All data sent in plain text
// Anyone on network can see passwords, emails, etc.
```

### 12.6 Session Security

```javascript
// ✅ CORRECT: Secure session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET, // Random secret key
    cookie: {
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      httpOnly: true, // Not accessible to JavaScript
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
    },
  }),
);

// Why these settings:
// - secret: Session data is encrypted with this key
// - secure: Only send cookie over HTTPS (production)
// - httpOnly: Prevents JavaScript from accessing cookie
// - maxAge: Session expires after 24 hours
```

---

## QUICK REFERENCE: REQUEST/RESPONSE CYCLE

```
1. USER fills form and clicks submit
   ↓
2. BROWSER sends HTTP request (POST /account/register)
   ↓
3. SERVER receives request, parses form data into req.body
   ↓
4. MIDDLEWARE processes: body-parser, session, validation
   ↓
5. ROUTE matches /account/register, calls controller
   ↓
6. CONTROLLER extracts req.body, processes data
   ↓
7. MODEL executes SQL query against database
   ↓
8. DATABASE returns result
   ↓
9. CONTROLLER receives result, determines success/failure
   ↓
10. CONTROLLER calls res.render() with data
   ↓
11. SERVER renders EJS template with data into HTML
   ↓
12. SERVER sends HTML response back to browser
   ↓
13. BROWSER displays HTML to user
   ↓
14. USER sees result (success message or error)
```

---

## FOLDER STRUCTURE QUICK REFERENCE

```
WHY EACH FOLDER EXISTS:

database/     → Manages connection to PostgreSQL
routes/       → Maps URLs to controllers
controllers/  → Business logic (what to do with request)
models/       → Database queries (how to get/store data)
utilities/    → Helper functions (validation, navigation, etc.)
views/        → HTML templates (what user sees)
public/       → CSS, JS, images (static files)

DATA FLOW:

routes → controllers → models → database
↓
controllers ← return results
↓
res.render() with data
↓
EJS processes template
↓
HTML sent to browser
```

---

## IMPORTANT EXPORTS/REQUIRES CHECKLIST

```javascript
// server.js requires:
const express = require("express");
const session = require("express-session");
const accountRoute = require("./routes/accountRoute");

// accountRoute.js requires:
const accountController = require("../controllers/accountController");
const regValidate = require("../utilities/account-validation");

// accountController.js requires:
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs");

// account-model.js requires:
const pool = require("../database/");

// account-validation.js requires:
const accountModel = require("../models/account-model");
const { body, validationResult } = require("express-validator");

// Each file exports its functions/objects:
module.exports = { functionName, functionName };
module.exports = router;
module.exports = pool;
```

---

## COMMON ERRORS & SOLUTIONS

```
ERROR: "errors is not defined"
CAUSE: View received no errors variable from controller
FIX: Pass errors: null in res.render()

ERROR: "Cannot find module"
CAUSE: Wrong require path or file doesn't exist
FIX: Check file path, use ../ to go up directories

ERROR: "req.body is undefined"
CAUSE: express.urlencoded() middleware not set up
FIX: Add app.use(express.urlencoded({ extended: true }));

ERROR: "SQL query failed"
CAUSE: Syntax error in SQL or database connection issue
FIX: Check SQL syntax, verify database is running

ERROR: "Sticky form not working"
CAUSE: View not using locals.fieldname or controller not passing data
FIX: Pass form data in res.render(), use <%= locals.fieldname %>

ERROR: "Password not hashing"
CAUSE: Using bcrypt.hashSync() without await, or module not imported
FIX: Import bcryptjs: const bcrypt = require("bcryptjs");

ERROR: "Flash message not showing"
CAUSE: <%- messages() %> not in view
FIX: Add <%- messages() %> in view template
```

---

## STUDY TIPS

1. **Trace a Request**: Pick one route and trace how data flows from user to database and back
2. **Read Error Messages**: They usually tell you exactly what's wrong
3. **Use Console.log()**: Debug by printing variables at each step
4. **Compare Files**: Look at similar files (routes, models) to understand patterns
5. **Test in Browser**: Use DevTools to see network requests and responses
6. **Experiment**: Modify code and see what breaks/changes
7. **Reference This Guide**: Keep this document handy while coding

---

END OF STUDY GUIDE
