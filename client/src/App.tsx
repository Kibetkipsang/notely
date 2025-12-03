import {Routes, Route} from 'react-router-dom'
import { Header } from './components/Header'
import Auth from './components/Auth'
import Landing from './components/Home'
import Dashboard from './components/pages/Dashboard'
import Editor from './components/pages/Editor'

import './index.css'

function App() {
 

  return (
    <>
    <Header/>
    <Routes>
      <Route path='/' element={<Landing />}/>
      <Route path='/auth' element={<Auth />}/>
      <Route path='/dashboard' element={<Dashboard />}/>
      <Route path='/notes/create' element={<Editor />}/>
    </Routes>
    </>
  )
}

export default App
