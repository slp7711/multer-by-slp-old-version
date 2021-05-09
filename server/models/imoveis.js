const mongoose = require('mongoose');

const ImoveisSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['casa', 'apartamento', 'sala comercial', 'imovel rural']
    },
    description: {type: String},
    price: {type: String},
    imagesNames: [String]
})

const Imovel = mongoose.model('imoveis', ImoveisSchema)


module.exports = Imovel;