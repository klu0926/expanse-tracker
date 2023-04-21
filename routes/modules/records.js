const router = require('express').Router()


// Create

// Read all
router.get('/', (req, res) => {
  res.send('records: read all')
})

// Read One
// Update 
// Delete

module.exports = router