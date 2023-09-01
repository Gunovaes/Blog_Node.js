const mongoose = require("mongoose")
const Schema = mongoose.Schema

const Post = new Schema({
    titulo: {
        type: String,
        require: true
    },
    slug: {
        type: String,
        require: true
    },
    descricao: {
        type: String,
        require:true
    },
    conteudo: {
        type: String,
        require: true
    },
    categoria: {
        type: Schema.Types.ObjectId,
        ref: "categorias",
        require: true
    },
    data: {
        type: Date,
        default: Date.now()
    }
})

mongoose.model("posts", Post)