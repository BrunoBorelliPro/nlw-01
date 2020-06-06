import React from 'react'
import { BrowserRouter, Route } from 'react-router-dom'

import Home from './pages/home'
import CreatePoint from './pages/CreatePoint'

const Routes = ()=>{
    return(
        <BrowserRouter>
            <Route component={Home} path="/" exact/>
            <Route component={CreatePoint} path="/create-points"/>
        </BrowserRouter>
    )
}
export default Routes