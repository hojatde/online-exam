module.exports = (req, res, next) => {
    if (req.session.isLogin) {
        next();
    } else {
        req.flash('error', 'دسترسی غیر مجاز لطفا ابتدا وارد شوید.');
        res.redirect('/error');
    }
}