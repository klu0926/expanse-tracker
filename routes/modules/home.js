const router = require('express').Router()

router.get('/', (req, res)=> {
  res.redirect('/records')
})

module.exports = router