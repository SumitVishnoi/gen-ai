import React from 'react'
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import {Navigate} from "react-router"

const Protected = ({children}) => {
    const {user, loading} = useContext(AuthContext)

    if(loading) {
        return <h1>loading...</h1>
    }
    if(!user) {
        return <Navigate to="/login" />
    }
  return children
}

export default Protected