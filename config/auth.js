const LocalStrategy = require("passport-local").Strategy
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

//model
require("../models/Usuario")
const Usuario = mongoose.model("usuarios")


//passport (login com estratégia local)
module.exports = function(passport){
    passport.use(new LocalStrategy({usernameField: "usuario", passwordField: "senha"}, 
        function(usuario, senha, done) {
          Usuario.findOne({usuario: usuario}).lean().then((usuario) => {
            if (!usuario) { return done(null, false)}
            bcrypt.compare(senha, usuario.senha, function(err, result) {
                if(result){
                    return done(null, usuario)
                }else{
                    return done(null, false)
                }
            })
        })
        }
    ))
    passport.serializeUser((usuario, done) => {
        done(null, usuario._id);  
    });
    passport.deserializeUser((id, done) => {
        Usuario.findOne({_id: id}).then((usuario) => {
            done(null, usuario);
        }).catch((erro) => {
            done(erro, null);
        });
        
    })
}

