const mongoose = require("mongoose")
const Schema = mongoose.Schema

const Usuario = new Schema ({
    usuario: { 
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    admin: {
        type: Number,
        default: 0
    },
    senha: {
        type: String,
        require: true
    }

})

mongoose.model("usuarios", Usuario)

