module.exports = {

  // req.isAuthenticated() 是由 passport 提供
  isAuthenticated: (req, res, next) => {
    if (req.isAuthenticated()) {
      return next()
    }
    req.flash('warning_msg', '請先登入才能使用！')
    res.redirect('/user/login')
  },

  isNotAuthenticated: (req, res, next) => {
    if (!req.isAuthenticated()) {
      return next()
    }
    req.flash('warning_msg', '你已經登入了！')
    res.redirect('/records')
  }
}
