import PointerController from './controller/PointersController'
import ItemsController from './controller/ItemsController'
import express from 'express'
import knex from './database/connection'
import multer from 'multer'
import multerConfig from './config/multer'
import {Joi, celebrate} from 'celebrate'

const routes = express.Router()
const upload = multer(multerConfig)

const pointerController = new PointerController()
const itemsController = new ItemsController()

routes.get('/itens', itemsController.index)
routes.get('/points/:id', pointerController.show)
routes.get('/points', pointerController.index)



routes.post('/points',
upload.single('image'),
celebrate({
    body: Joi.object().keys({
        name: Joi.string().required(),
        email: Joi.string().required().email(),
        whatsapp: Joi.string().required(),
        latitude: Joi.number().required(),
        longitude: Joi.number().required(),
        city: Joi.string().required(),
        uf: Joi.string().required().max(2),
        itens: Joi.string().required()
    })
},{
    abortEarly: false
}),
pointerController.create
)


export default routes