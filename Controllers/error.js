exports.geterrorpage=(req,res,next)=>{
    res.render('404',{pagetitle:'page not found',isAuthenticated:req.session.isLoggedIn});
}
exports.get500=(req,res,next)=>{
    res.render('500',{
        pagetitle:'ERROR',
        isAuthenticated:req.session.isLoggedIn
    })
}