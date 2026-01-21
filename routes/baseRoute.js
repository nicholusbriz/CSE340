const express = require('express')
const router = express.Router()
const utilities = require('../utilities')

function triggerCrash(req, res, next) {
  const err = new Error('Intentional server crash for testing.')
  err.status = 500
  throw err
}

router.get('/crash', utilities.handleErrors(triggerCrash))

module.exports = router
