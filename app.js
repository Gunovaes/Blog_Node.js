const express = require("express")
const app = express()
const handlebars = require("express-handlebars")
const bodyParser = require("body-parser")
const path = require("path")
const mongoose = require("mongoose")
const session = require("express-session")
const flash = require("connect-flash")
const passport = require("passport")
require("./config/auth")(passport)
const admin = require("./routes/admin")
const usuarios = require("./routes/usuario")
const dotenv = require("dotenv")
dotenv.config()

const MONGO_CNSTRING = process.env.MONGO_CNSTRING

const { MongoClient } = require('mongodb')

const client = new MongoClient(MONGO_CNSTRING)

// Nome do banco
const dbName = 'Blog_Novaes'

// Conexão com o atlas
async function main() {
  await client.connect()
  console.log('Connected successfully to server')
  const db = client.db(dbName)
  const Blog_NovaesCollection = db.collection('Blog_NovaesCollection')
  await Blog_NovaesCollection.insertOne({
    teste: true
  })

  return 'done.'
}

main()
  .then(console.log)
  .catch(console.error)
  .finally(() => client.close())

// Models
require("./models/Categoria")
require("./models/Post")

const Post = mongoose.model("posts")
const Categoria = mongoose.model("categorias")

// Configuração da sessão
app.use(session({
  secret: 'club3910',
  resave: true,
  saveUninitialized: false,
}))

app.use(passport.initialize())
app.use(passport.session())
app.use(flash())

// Middleware var globais
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg")
  res.locals.error_msg = req.flash("error_msg")
  res.locals.user = req.user || null
  next()
})

// Path
app.use(express.static(path.join(__dirname, "public")))

// Config
// Handlebars
app.set('views', path.join(__dirname, 'views'))
app.engine('handlebars', handlebars.engine({ defaultLayout: "main" }))
app.set('view engine', 'handlebars')
app.set('views', './views')

// BodyParser
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Conexão com o MongoDB
mongoose.connect(MONGO_CNSTRING).then(() => {
  console.log("Conectado ao banco")
}).catch(err => console.error("Erro ao conectar ao banco:", err))

// Rotas
app.use("/admin", admin)

app.get("/admin/exemplo", (req, res) => {
  res.send("Rota de exemplo para /admin/exemplo");
});

app.use("/usuario", usuarios)

// Rota de exemplo no início do arquivo (antes de outras rotas)
app.get("/admin/exemplo", (req, res) => {
  res.send("Rota de exemplo para /admin/exemplo");
});


app.get("/", (req, res) => {
  Post.find().populate("categoria").lean().then(posts => {
    const reversedPosts = posts.reverse()
    res.render("index", { post: reversedPosts })
  }).catch((err) => {
    req.flash("error_msg", "Houve um erro interno ao listar as publicações")
    res.redirect("/")
  })
})

app.get("/post/:slug", (req, res) => {
  Post.findOne({ slug: req.params.slug }).lean()
    .then(post => {
      if (post) {
        res.render("categorias/post", { post })
      } else {
        req.flash("error_msg", "Essa publicação não existe")
        res.redirect("/")
      }
    })
    .catch(err => {
      req.flash("error_msg", "Houve um erro interno ao visualizar a publicação")
      res.redirect("/")
    })
})

app.get("/categorias", (req, res) => {
  Categoria.find().lean()
    .then(categorias => {
      res.render("categorias/index", { categoria: categorias })
    })
    .catch(err => {
      req.flash("error_msg", "Houve um erro interno ao listar as categorias")
      res.redirect("/")
    })
})

app.get("/categorias/:slug", (req, res) => {
  Categoria.findOne({ slug: req.params.slug }).lean()
    .then(categoria => {
      if (categoria) {
        Post.find({ categoria: categoria._id }).lean()
          .then(post => {
            res.render("categorias/posts", { post, categoria })
          })
          .catch(err => {
            req.flash("error_msg", "Houve um erro ao interno ao vizualizar a categoria")
            res.redirect("/")
          })
      } else {
        req.flash("error_msg", "Categoria não encontrada")
        res.redirect("/")
      }
    })
    .catch(err => {
      req.flash("error_msg", "Houve um erro ao carregar a página desta categoria")
      res.redirect("/")
    })
})

// Porta
const porta = 8081
app.listen(porta, () => {
  console.log("O servidor foi iniciado corretamente na porta", porta)
})