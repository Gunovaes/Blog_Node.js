const express = require("express")
const router = express.Router()
const bcrypt = require("bcryptjs")
const mongoose = require("mongoose")
require("../models/Usuario")
const Categoria = mongoose.model("categorias")
const Post = mongoose.model("posts")
const Usuario = mongoose.model("usuarios")
const passport = require("passport")

// Registro de Usuário
router.get("/registro", (req, res) => {
    res.render("usuario/registro")
})

router.post("/registro", (req, res) => {
    const erros = []

    if (!req.body.usuario || typeof req.body.usuario === undefined || req.body.usuario === null) {
        erros.push({ texto: "Usuário Inválido" })
    }
    if (!req.body.email || typeof req.body.email === undefined || req.body.email === null) {
        erros.push({ texto: "E-mail Inválido" })
    }
    if (!req.body.senha || typeof req.body.senha === undefined || req.body.senha === null) {
        erros.push({ texto: "Senha Inválida" })
    } else if (req.body.senha.length < 5) {
        erros.push({ texto: "Senha muito curta" })
    } else if (req.body.senha !== req.body.senhaconfirm) {
        erros.push({ texto: "As senhas devem ser iguais" })
    }

    if (erros.length > 0) {
        res.render("usuario/registro", { erros: erros })
    } else {
        Usuario.findOne({ email: req.body.email }).lean().then((email) => {
                if (email) {
                    req.flash("error_msg", "Este e-mail já está associado a uma conta")
                    res.render("usuario/registro", { error_msg: req.flash("error_msg") })
                } else {
                    Usuario.findOne({ usuario: req.body.usuario }).lean().then((usuario) => {
                            if (usuario) {
                                req.flash("error_msg", "Este nome de usuário já está associado a outra conta")
                                res.render("usuario/registro", { error_msg: req.flash("error_msg") })
                            } else {
                                const novoUsuario = {
                                    usuario: req.body.usuario,
                                    email: req.body.email,
                                    senha: req.body.senha,
                                }

                                bcrypt.genSalt(10, (err, salt) => {
                                    bcrypt.hash(novoUsuario.senha, salt, (err, hash) => {
                                        if (err) throw err

                                        novoUsuario.senha = hash
                                        new Usuario(novoUsuario)
                                            .save()
                                            .then(() => {
                                                req.flash("success_msg", "Usuário cadastrado com sucesso")
                                                res.redirect("/")
                                            })
                                            .catch((err) => {
                                                req.flash("error_msg", "Houve um erro interno ao cadastrar a conta")
                                                res.redirect("/")
                                            })
                                    })
                                })
                            }
                        })
                }
            })
            .catch((err) => {
                req.flash("error_msg", "Houve um erro interno")
                res.redirect("/")
            })
    }
})

// Login de Usuário
router.get("/login", (req, res) => {
    res.render("usuario/login")
})

router.post("/login", (req, res, next) => {
    passport.authenticate("local", (err, user) => {
        if (err) {
            return next(err)
        }
        if (!user) {
            req.flash("error_msg", "Usuário ou senha incorretos")
            return res.redirect("/usuario/login") 
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err)
            }
            console.log("Usuário entrou:", req.user)
            req.flash("success_msg", "Login realizado com sucesso")
            return res.redirect("/")
        })
    })(req, res, next)
})


// Logout de Usuário
router.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err)
        }
        req.flash("success_msg", "Logout realizado com sucesso")
        res.redirect("/")
    })
})

module.exports = router