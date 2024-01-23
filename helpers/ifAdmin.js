// Verifica se é administrador
module.exports = {
    ifAdmin: function(req, res, next) {
        if (req.isAuthenticated() && req.user.admin == 1) {
            return next()
        } else {
            req.flash("error_msg", "Você deve estar logado como administrador para continuar");
            res.redirect("/")
        }
    },
}