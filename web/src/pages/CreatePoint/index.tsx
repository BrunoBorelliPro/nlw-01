import React, {useEffect, useState, ChangeEvent, FormEvent} from 'react'
import './CreatePoint.css'
import logo from '../../assets/logo.svg'
import {Link, useHistory} from 'react-router-dom'
import {FiArrowLeft} from 'react-icons/fi'
import {Map, TileLayer, Marker} from 'react-leaflet'
import api from '../../services/api'
import axios from 'axios'
import {LeafletMouseEvent} from 'leaflet'
import DropZone from '../../components/DropZone'
import { join } from 'path'


interface Item{
    id: number;
    title: string;
    image_url: string;
}

interface IBGEUFResponse{
    sigla: string
}
interface IBGECityResponse{
    nome: string
}

const CreatePoint = ()=>{
    const history = useHistory()

    const [items, setItems] = useState<Item[]>([])
    const [selectedItems, setSelectedItems] = useState<number[]>([])

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: ''
    })

    const [ufs, setUfs] = useState<string[]>([])
    const [selectedUF, setSelectedUf] = useState('0')
    const [selectedCity, setSelectedCity] = useState('0')
    const [cities, setCity] = useState<string[]>([])
    const [selectedFile, setSelectedFile] = useState<File>()

    const [selectLat, setSelectLat] = useState(-22.9517309)
    const [selectLng, setSelectLng] = useState(-46.5433603)
    const [initialPosition, setInitialPosition] = useState<[number, number]>([0,0])

    useEffect(()=>{
        navigator.geolocation.getCurrentPosition(position=>{
            const {latitude, longitude} = position.coords
            setInitialPosition([latitude, longitude])
        })
    },[])

    useEffect(()=>{
        api.get('itens').then(res=>{
            setItems(res.data)
        })
    },[])
    useEffect(()=>{
        axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(res =>{
            const ufInitials = res.data.map(uf => uf.sigla)
            setUfs(ufInitials)
        })
    },[])
    useEffect(()=>{
        if (selectedUF === '0') {
            return;
        }
        axios
            .get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUF}/municipios`)
            .then(res =>{
            const cityName = res.data.map(city => city.nome)
            setCity(cityName)
        })
    },[selectedUF])

    function handleSelectItem(id:number){
        const alreadySelectedItems = selectedItems.findIndex(item=> item === id)
        if (alreadySelectedItems >= 0) {
            const filteredItems = selectedItems.filter(item => item !== id)
            setSelectedItems(filteredItems)
        }else{
            setSelectedItems([...selectedItems, id])
        }
        
    }

    function handleSelectedUf(event: ChangeEvent<HTMLSelectElement>){
       const uf = event.target.value
       setSelectedUf(uf)
    }
    function handleSelectedCity(event: ChangeEvent<HTMLSelectElement>){
        const city = event.target.value
        setSelectedCity(city)
     }
     function handleInputChange(event:ChangeEvent<HTMLInputElement>){
        const {name, value} = event.target

        setFormData({...formData, [name]: value})
     }
     function handleMapClick(event: LeafletMouseEvent){
        const lat = event.latlng.lat
        const lng = event.latlng.lng
        setSelectLat(lat)
        setSelectLng(lng)
     }
    async function handleSubmit(event:FormEvent){
        event.preventDefault()
        const {name, email, whatsapp} = formData
        const latitude = selectLat
        const longitude = selectLng
        const uf = selectedUF
        const city = selectedCity
        const itens = selectedItems

        const data = new FormData()

            data.append('name',name)
            data.append('email',email)
            data.append('whatsapp',whatsapp)
            data.append('uf',uf)
            data.append('city',city)
            data.append('latitude',String(latitude))
            data.append('longitude',String(longitude))
            data.append('itens',itens.join(','))
            if(selectedFile){
                data.append('image', selectedFile)
            }

        await api.post('points', data)

        alert('Ponto de coleta criado!')

        history.push('/')
     }

    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta"/>
                <Link to="/">
                        <FiArrowLeft/>
                        Voltar para a home.
                </Link>
            </header>
            <form onSubmit={handleSubmit}>
                <h1>Cadastro do<br/>ponto de coleta</h1>

                <DropZone onFileUploaded={setSelectedFile} />


                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>
                    <div className="field">
                        <label htmlFor="name">
                            Nome da entidade
                        </label>
                            <input type="text"
                                name="name"
                                id="name"
                                onChange={handleInputChange}
                            />
                        
                    </div>
                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">
                                Email
                            </label>
                                <input type="text"
                                    name="email"
                                    id="email"
                                    onChange={handleInputChange}
                                />
                            
                        </div>
                        <div className="field">
                            <label htmlFor="whatsapp">
                                Whatsapp
                            </label>
                                <input type="text"
                                    name="whatsapp"
                                    id="whatsapp"
                                    onChange={handleInputChange}
                                />
                            
                        </div>
                    </div>
                    
                </fieldset>
                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>
                    
                    <Map center={initialPosition} zoom={13} onClick={handleMapClick}>
                        <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                         />
                         <Marker position={[selectLat, selectLng]} />
                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">
                                Estado(UF)
                            </label>
                            <select name="uf" id="uf" value={selectedUF} onChange={handleSelectedUf}>
                                <option value="0">Selecione uma UF</option>
                                {ufs.map(uf =><option key={uf} value={uf}>{uf}</option>)}
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="city">
                                Cidade
                            </label>
                            <select name="city" id="city" value={selectedCity} onChange={handleSelectedCity}>
                                <option value="0">Selecione uma cidade</option>
                                {cities.map(city=><option key={city} value={city}>{city}</option>)}
                            </select>
                        </div>
                    </div>
                    
                </fieldset>
                <fieldset>
                    <legend>
                        <h2>Itens de coleta</h2>
                        <span>Selecione um ou mais itens abaixo</span>
                    </legend>
                    <ul className="items-grid">
                        {items.map(item =>(
                            <li key={item.id}
                            onClick={()=>handleSelectItem(item.id)}
                            className={selectedItems.includes(item.id) ? 'selected' : ''}>
                                <img src={item.image_url} alt={item.title}/>
                                <span>{item.title}</span>
                            </li>
                        ))}
                        
                    </ul>
                </fieldset>
                <button type="submit">Cadastrar ponto de coleta</button>
            </form>
        </div>
    )
}
export default CreatePoint