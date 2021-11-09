module.exports = (req, res, next) => {
    if (!req.session.isLogin) {
        next();
    } else {
        req.session.destroy(err => {
            if (err) {
                console.log(err);
            }else{res.redirect('/')}
        })
    }
}