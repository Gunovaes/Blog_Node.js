const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("../models/Categoria");
const Categoria = mongoose.model("categorias");
require("../models/Post");
const Post = mongoose.model("posts");
const { ifAdmin } = require("../helpers/ifAdmin");

// Listar posts 
router.get("/", ifAdmin, (req, res) => {
    Post.find()
        .populate("categoria")
        .lean()
        .then((postagens) => {
            const postagensInvertidas = postagens.reverse();
            res.render("admin/posts", { postagem: postagensInvertidas });
        })
        .catch((err) => {
            req.flash("error_msg", "Houve um erro ao listar as publicações");
            res.redirect("/admin");
        });
});

// Listar categorias 
router.get("/categorias", ifAdmin, (req, res) => {
    Categoria.find()
        .lean()
        .then((categorias) => {
            res.render("admin/categorias", { categoria: categorias });
        })
        .catch((err) => {
            req.flash("error_msg", "Houve um erro ao listar as categorias");
            res.redirect("/admin");
        });
});

// Nova categoria
router.get("/categorias/novacategoria", ifAdmin, (req, res) => {
    res.render("admin/novacategoria");
});

// Adicionar nova categoria
router.post("/addcategoria", ifAdmin, (req, res) => {
    var erros = [];

    if (!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null) {
        erros.push({ texto: "Título inválido ou inexistente" });
    } else if (req.body.titulo.length < 3) {
        erros.push({ texto: "Título muito curto" });
    }

    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        erros.push({ texto: "Slug inválido ou inexistente" });
    }

    if (erros.length > 0) {
        res.render("admin/novacategoria", { erros: erros });
    } else {
        const novaCategoria = {
            titulo: req.body.titulo,
            slug: req.body.slug,
        };

        new Categoria(novaCategoria)
            .save()
            .then(() => {
                req.flash("success_msg", "Categoria criada com sucesso");
                res.redirect("/admin");
            })
            .catch((err) => {
                req.flash("error_msg", "Houve um erro ao criar a categoria");
                res.redirect("/admin");
            });
    }
});

// Editar categoria
router.get("/editcategoria/:id", ifAdmin, (req, res) => {
    Categoria.findOne({ _id: req.params.id })
        .lean()
        .then((categoria) => {
            res.render("admin/editcategoria", { categoria: categoria });
        })
        .catch((erro) => {
            req.flash("error_msg", "Categoria não encontrada");
            res.redirect("/admin");
        });
});

// Salvar edições 
router.post("/editcategoria", ifAdmin, (req, res) => {
    Categoria.findOne({ _id: req.body.id })
        .then((categoria) => {
            var erros = [];

            if (!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null) {
                erros.push({ texto: "Título inválido ou inexistente" });
            } else if (req.body.titulo.length < 3) {
                erros.push({ texto: "Título muito curto" });
            }

            if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
                erros.push({ texto: "Slug inválido ou inexistente" });
            }

            if (erros.length > 0) {
                res.render("admin/editcategoria", { erros: erros });
            } else {
                categoria.titulo = req.body.titulo;
                categoria.slug = req.body.slug;

                categoria
                    .save()
                    .then(() => {
                        req.flash("success_msg", "Categoria editada com sucesso");
                        res.redirect("/admin");
                    })
                    .catch((err) => {
                        req.flash("error_msg", "Erro ao salvar categoria");
                        res.redirect("/");
                    });
            }
        })
        .catch((err) => {
            req.flash("error_msg", "Houve um erro ao procurar a categoria");
            res.redirect("/admin");
        });
});

// Deletar categoria
router.post("/deletcategoria", ifAdmin, (req, res) => {
    Categoria.deleteOne({ _id: req.body.id })
        .then(() => {
            req.flash("success_msg", "Categoria deletada com sucesso");
            res.redirect("/admin");
        })
        .catch((err) => {
            req.flash("error_msg", "Houve um erro ao deletar a categoria");
            res.redirect("/admin");
        });
});

// Novo post
router.get("/novapostagem", ifAdmin, (req, res) => {
    Categoria.find()
        .lean()
        .then((categorias) => {
            res.render("admin/novapostagem", { categoria: categorias });
        })
        .catch((err) => {
            req.flash("error_msg", "Houve um erro ao carregar as categorias");
            res.redirect("/admin/novapostagem");
        });
});

// Adicionar nova postagem
router.post("/", ifAdmin, (req, res) => {
    var erros = [];
    if (!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null) {
        erros.push({ texto: "Título inválido ou inexistente" });
    } else if (req.body.titulo.length < 3) {
        erros.push({ texto: "Título muito curto" });
    }
    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        erros.push({ texto: "Slug inválido ou inexistente" });
    }
    if (!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null) {
        erros.push({ texto: "Descrição inválida ou inexistente" });
    }
    if (!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null) {
        erros.push({ texto: "Conteúdo inválido ou inexistente" });
    }
    if (req.body.categoria == 0) {
        erros.push({ texto: "Preencha a categoria para continuar" });
    }
    if (erros.length > 0) {
        Categoria.find().lean().then((categorias) => {
            res.render("admin/novapostagem", { categoria: categorias, erros: erros });
        });
    } else {
        const novaPostagem = {
            titulo: req.body.titulo,
            slug: req.body.slug,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria,
        };

        new Post(novaPostagem)
            .save()
            .then(() => {
                req.flash("success_msg", "Publição criada com sucesso");
                res.redirect("/admin");
                console.log("Publicação criada com sucesso!");
            })
            .catch((err) => {
                req.flash("error_msg", "Houve um erro durante o salvamento da publicação ");
                res.redirect("/admin");
            });
    }
});

// Editar post
router.get("/editpost/:_id", ifAdmin, (req, res) => {
    Post.findOne({ _id: req.params._id })
        .lean()
        .then((postagens) => {
            Categoria.find()
                .lean()
                .then((categorias) => {
                    res.render("admin/editpost", { categoria: categorias, postagem: postagens });
                })
                .catch((err) => {
                    req.flash("error_msg", "Houve um erro ao listar as categorias");
                    res.redirect("/admin");
                });
        })
        .catch((err) => {
            req.flash("error_msg", "Esta publicação não existe");
            res.redirect("/admin");
        });
});

// Salvar edições
router.post("/editpost", ifAdmin, (req, res) => {
    Post.findOne({ _id: req.body.id })
        .then((postagem) => {
            var erros = [];

            if (!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null) {
                erros.push({ texto: "Título inválido ou inexistente" });
            } else if (req.body.titulo.length < 3) {
                erros.push({ texto: "Título muito curto" });
            }
            if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
                erros.push({ texto: "Slug inválido ou inexistente" });
            }
            if (!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null) {
                erros.push({ texto: "Descrição inválida ou inexistente" });
            }
            if (!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null) {
                erros.push({ texto: "Conteúdo inválido ou inexistente" });
            }
            if (req.body.categoria == 0) {
                erros.push({ texto: "Preencha a categoria para continuar" });
            }
            if (erros.length > 0) {
                Categoria.find()
                    .lean()
                    .then((categorias) => {
                        res.render("admin/novapostagem", { categoria: categorias, erros: erros });
                    });
            } else {
                postagem.titulo = req.body.titulo;
                postagem.slug = req.body.slug;
                postagem.descricao = req.body.descricao;
                postagem.conteudo = req.body.conteudo;
                postagem.categoria = req.body.categoria;

                postagem
                    .save()
                    .then(() => {
                        req.flash("success_msg", "Publicação editada com sucesso");
                        res.redirect("/admin");
                    })
                    .catch((err) => {
                        req.flash("error_msg", "Erro ao salvar categoria");
                        res.redirect("/");
                    });
            }
        })
        .catch((err) => {
            req.flash("error_msg", "Houve um erro ao procurar a categoria");
            res.redirect("/admin");
        });
});

// Deletar postagem
router.post("/deletpost/:id", ifAdmin, (req, res) => {
    Post.deleteOne({ _id: req.body.id })
        .then(() => {
            req.flash("success_msg", "Publicação deletada com sucesso");
            res.redirect("/admin");
        })
        .catch((err) => {
            req.flash("error_msg", "Houve um erro ao deletar a publicação");
            res.redirect("/admin");
        });
});

module.exports = router;