import knex from '../database/connection'
import {Request, Response, json} from 'express'
class PointerController{
    async create(req:Request, res:Response){
        const {
             name,
             email,
             whatsapp,
             uf,
             city,
             latitude,
             longitude,
             itens
         } = req.body

     
         const trx = await knex.transaction()

         const point = {
            image: req.file.filename,
            name,
            email,
            whatsapp,
            uf,
            city,
            latitude,
            longitude
         }
     
         const InsertedIds = await trx('points').insert(point)
     
         const point_id = InsertedIds[0]

         
         const points_itens = itens
         .split(',')
         .map((item:string)=>Number(item.trim()))
         .map((item_id: Number) =>{
             console.log("item_id:",item_id,"point_id:",point_id)
             return {
                 item_id,
                 point_id
             }
            })

         await trx('points_itens').insert(points_itens)
         trx.commit()
         return res.json({
             id: point_id,
             ...point
         })
     }
    async show(req:Request, res:Response){
        const id = req.params.id
        const point = await knex('points').select('*').where('id',id).first()
        if(!point){
            return res.status(400).json({message: 'ponto não encontrado'})
        }

        const items = await knex('itens')
        .join('points_itens', 'itens.id', '=', 'points_itens.item_id')
        .where('points_itens.point_id',id)
        .select('itens.title')

        const serializedPoint = {
                ...point,
                image_url: `http://192.168.0.2:3333/uploads/${point.image}`
        }

        return res.json({serializedPoint, items})
    } 
    async index(req:Request, res:Response){
        const {city, uf, itens} = req.query
        const pasedItems = String(itens)
        .split(',')
        .map(itens=>Number(itens.trim()))


        const points = await knex('points')
        .join('points_itens', 'points.id', '=', 'points_itens.point_id')
        .whereIn('points_itens.item_id', pasedItems)
        .where('city',String(city))
        .where('uf',String(uf))
        .distinct()
        .select('points.*')

        const serializedPoints = points.map(point =>{
            return {
                ...point,
                image_url: `http://192.168.0.2:3333/uploads/${point.image}`
            }
        })


        return res.json(serializedPoints)
    }
}
export default PointerController