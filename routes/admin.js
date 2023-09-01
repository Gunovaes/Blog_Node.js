const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
require("../models/Categoria")
const Categoria = mongoose.model("categorias")
require("../models/Post")
const Post = mongoose.model("posts")
const {ifAdmin} = require("../helpers/ifAdmin")

router.get("/", ifAdmin, (req, res) => {
    Post.find().populate("categoria").lean().then((postagens) => {
        res.render("admin/posts", {postagem: postagens})
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as publicações")
        res.render("admin/retornar", ({error_msg: req.flash("error_msg")}))
    })
})

router.get("/categorias", ifAdmin, (req, res) => {
    Categoria.find().lean().then((categorias) => {                                                          
        res.render("admin/categorias", {categoria: categorias})
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as categorias")
        res.render("admin/retornar", ({error_msg: req.flash("error_msg")}))
    })
})

router.get("/categorias/retornar", ifAdmin, (req, res) => {
    res.render("admin/retornar")
})

router.post("/categorias/retornar", ifAdmin, (req, res) => {
    res.render("admin/retornar")
})

router.get("/categorias/novacategoria", ifAdmin, (req, res) => {
    res.render("admin/novacategoria")
})

router.post("/addcategoria", ifAdmin, (req, res) => {
    var erros = []

    if(!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null){
        erros.push({texto: "Tíulo inválido ou inexistente"})
    }
    else if(req.body.titulo.length < 3){
        erros.push({texto: "Título muito curto"})
    }
    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "Slug inválido ou inexistente"})
    }
    if(erros.length > 0){
        res.render("admin/novacategoria", {erros: erros})
    }else{

        const novaCategoria = {
            titulo: req.body.titulo,
            slug: req.body.slug
        }
        new Categoria(novaCategoria).save().then(() => {
            req.flash("success_msg", "Categoria criada com suceso")
            console.log("Categoria criada com sucesso!")
            res.render("admin/retornar", ({success_msg: req.flash("success_msg")}
        ))
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao realizar a publicação da categoria")
            console.log("Houve um erro pro usuário " + err)
            res.render("admin/retornar", ({error_msg: req.flash("error_msg")}
        ))
        })
    }                                                                     
})

router.get("/editcategoria/:id", ifAdmin, (req, res) => {
    Categoria.findOne({_id: req.params.id}).lean().then((categorias) => {
        res.render("admin/editcategoria", {categoria: categorias})
    }).catch((erro) => {
        req.flash("error_msg", "Categoria não encontrada")
        res.render("admin/retornar", ({error_msg: req.flash("error_msg")}))
        console.log("Houve um erro para o usuário " + erro)
    })
})

router.post("/editcategoria", ifAdmin, (req, res) => {
    Categoria.findOne({ _id: req.body.id }).then((categoria) => {
        erros = []

        if(!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null){
            erros.push({texto: "Título inválido ou inexistente"})
        }
        else if(req.body.titulo.length < 3){
            erros.push({texto: "Título muito curto"})
        }
        if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
            erros.push({texto: "Slug inválido ou inexistente"})
        }
        if(erros.length > 0){
            res.render("admin/editcategoria", { erros: erros });
        }
        else{
            categoria.titulo = req.body.titulo
            categoria.slug = req.body.slug
            categoria.save().then(() => {
                req.flash("success_msg", "Categoria editada com sucesso")
                res.render("admin/retornar", ({success_msg: req.flash("success_msg")}))
            }).catch((err) => {
                console.error("Erro ao salvar categoria:", err);
                req.flash("error_msg", "Erro ao editar categoria");
                res.redirect("/");
            })
        }    
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao procurar a categoria");
        res.render("retornar", ({error_msg: req.flash("error_msg")}))
    })
})

router.post("/deletcategoria", ifAdmin, (req, res) => {
        Categoria.deleteOne({_id: req.body.id}).then(() => {
            req.flash("success_msg", "Categoria deletada com sucesso")
            res.render("admin/retornar", ({success_msg: req.flash("success_msg")}))
        })    
})


router.get("/novapostagem", ifAdmin, (req,res) => {
    Categoria.find().lean().then((categorias) => {
        res.render("admin/novapostagem", {categoria: categorias})
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao atualizar o formulário")
        res.render("admin/novapostagem", ({error_msg: req.flash("error_msg")}))
    })
})

router.post("/", ifAdmin, (req, res) => {
    var erros = []
    if(!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null){
        erros.push({texto: "Título inválido ou inexistente"})
    }
    else if(req.body.titulo.length < 3 ){
        erros.push({texto: "Título muito curto"})
    }
    if(!req.body.slug || typeof req.body.slug== undefined || req.body.slug == null){
        erros.push({texto: "Slug inválido ou inexistente"})
    }
    if(!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null){
        erros.push({texto: "Descrição inválida ou inexistente"})
    }
    if(!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null){
        erros.push({texto: "Conteúdo inválido ou inexistente"})
    }
    if(req.body.categoria == 0){
        erros.push({texto: "Preencha a categoria para continuar"})
    }
    if(erros.length > 0){
        Categoria.find().lean().then((categorias) => {
            res.render("admin/novapostagem", {categoria: categorias, erros: erros})
        })
    }
    else{
        const novaPostagem = {
            titulo: req.body.titulo,
            slug: req.body.slug,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria
        }

        new Post(novaPostagem).save().then(() => {
            req.flash("success_msg", "Publição criada com sucesso")
            res.render("admin/retornarpost", ({success_msg: req.flash("success_msg")}))
             console.log("Publicação criada com sucesso!")
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro durante o sallvamento da publicação ")
            res.render("admin/retornarpost", ({error_msg: req.flash("error_msg")}))
        })
    }
})

router.get("/editpost/:_id", ifAdmin, (req, res) => {
    Post.findOne({_id: req.params._id}).lean().then((postagens) => {
        Categoria.find().lean().then((categorias) => {
            res.render("admin/editpost", {categoria: categorias, postagem: postagens})
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao listar as categorias" )
            res.render("admin/retornarpost", ({error_msg: req.flash("error_msg")}))
        })
    }).catch((err) => {
        req.flash("error_msg", "Esta publicação não existe")
        res.render("admin/retornarpost", ({error_msg: req.flash("error_msg")}))
    })
})

router.post("/editpost", ifAdmin, (req, res) => {
    Post.findOne({_id: req.body.id}).then((postagem) => {
        var erros = []

        if(!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null){
            erros.push({texto: "Título inválido ou inexistente"})
        }
        else if(req.body.titulo.length < 3 ){
            erros.push({texto: "Título muito curto"})
        }
        if(!req.body.slug || typeof req.body.slug== undefined || req.body.slug == null){
            erros.push({texto: "Slug inválido ou inexistente"})
        }
        if(!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null){
            erros.push({texto: "Descrição inválida ou inexistente"})
        }
        if(!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null){
            erros.push({texto: "Conteúdo inválido ou inexistente"})
        }
        if(req.body.categoria == 0){
            erros.push({texto: "Preencha a categoria para continuar"})
        }
        if(erros.length > 0){
            Categoria.find().lean().then((categorias) => {
                res.render("admin/novapostagem", {categoria: categorias, erros: erros})
            })
        }
        else{
            postagem.titulo = req.body.titulo
            postagem.slug = req.body.slug
            postagem.descricao = req.body.descricao
            postagem.conteudo = req.body.conteudo
            postagem.categoria = req.body.categoria
    
            postagem.save().then(() => {
                req.flash("success_msg", "Publicação editada com sucesso")
                res.render("admin/retornarpost", ({success_msg: req.flash("success_msg")}))
            })
        }
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao editar a publicação")
        console.log("erro" + err)
        res.render("admin/retornarpost", ({error_msg: req.flash("error_msg")}))
    })
    
})

router.post("/deletpost/:id", ifAdmin, (req, res) => {
    Post.deleteOne({_id: req.body.id}).then(() => {
        req.flash("success_msg", "Publicação deletada com sucesso" )
        res.render("admin/retornarpost" , ({success_msg: req.flash("success_msg")}))
       
    })
})

module.exports = router