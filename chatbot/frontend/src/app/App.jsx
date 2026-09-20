import { useEffect } from 'react'
import './App.css'
import { initializedSocketConnection } from '../features/chat/service/socket.service'
import { router } from './app.routes'
import { RouterProvider } from 'react-router'

function App() {
  useEffect(()=> {
    initializedSocketConnection()
  }, [])
  return (
     <RouterProvider router={router}/>
  )
}

export default App
