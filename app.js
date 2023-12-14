const express = require("express");
const app = express();
const handlebars = require("express-handlebars");
const bodyParser = require("body-parser");
const path = require("path")
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
require("./config/auth")(passport);
const admin = require("./routes/admin");
const usuarios = require("./routes/usuario");

//models
require("./models/Categoria");
require("./models/Post")

const Post = mongoose.model("posts")
const Categoria = mongoose.model("categorias")

// Configuração da sessão
app.use(session({
    secret: 'club3910',
    resave: true,
    saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Middleware var globais
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    res.locals.user = req.user || null;
    next();
});


// Config
//Handlebars
    app.engine('handlebars', handlebars.engine({ defaultLayout: "main" }));
    app.set('view engine', 'handlebars');
    app.set('views', './views');
    
//BodyParser
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    
// Conexão com o MongoDB
    mongoose.connect("mongodb://127.0.0.1:27017/social").then(() => {
        console.log("Conectado ao banco");
    }).catch(err => console.error("Erro ao conectar ao banco:", err));

//path
app.use(express.static((path.join(__dirname,"public"))))

//rotas
app.use("/admin", admin);
app.use("/usuario", usuarios);

app.get("/", (req, res) => {
    Post.find().populate("categoria").lean().then(posts => {
        res.render("index", { post: posts });
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno ao listar as publicações");
        res.render("retornar", { error_msg: req.flash("error_msg") });
    });
});

app.get("/post/:slug", (req, res) => {
    Post.findOne({ slug: req.params.slug }).lean()
        .then(post => {
            if (post) {
                res.render("categorias/post", { post });
            } else {
                req.flash("error_msg", "Essa publicação não existe");
                res.render("retornar", { error_msg: req.flash("error_msg") });
            }
        })
        .catch(err => {
            req.flash("error_msg", "Houve um erro interno ao visualizar a publicação");
            res.render("index", { error_msg: req.flash("error_msg") });
        });
});

app.get("/categorias", (req, res) => {
    Categoria.find().lean()
        .then(categorias => {
            res.render("categorias/index", { categoria: categorias });
        })
        .catch(err => {
            req.flash("error_msg", "Houve um erro interno ao listar as categorias");
            res.render("retornar", { error_msg: req.flash("error_msg") });
        });
});

app.get("/categorias/:slug", (req, res) => {
    Categoria.findOne({ slug: req.params.slug }).lean()
        .then(categoria => {
            if (categoria) {
                Post.find({ categoria: categoria._id }).lean()
                    .then(post => {
                        res.render("categorias/posts", { post, categoria });
                    })
                    .catch(err => {
                        req.flash("error_msg", "Houve um erro ao interno ao vizualizar a categoria");
                        res.render("retornar", { error_msg: req.flash("error_msg") });
                    });
            } else {
                req.flash("error_msg", "Categoria não encontrada");
                res.render("retornar", { error_msg: req.flash("error_msg") });
            }
        })
        .catch(err => {
            req.flash("error_msg", "Houve um erro ao carregar a página desta categoria");
            res.render("retornar", { error_msg: req.flash("error_msg") });
        });
});

// Porta
const porta = 3333;
app.listen(porta, () => {
    console.log("O servidor foi iniciado corretamente na porta", porta);
});

