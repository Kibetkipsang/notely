import {Routes, Route} from 'react-router-dom'
import { Header } from './components/Header'
import Auth from './components/Auth'
import Landing from './components/Home'

import './index.css'

function App() {
 

  return (
    <>
    <Header/>
    <Routes>
      <Route path='/' element={<Landing />}/>
      <Route path='/auth' element={<Auth />}/>
    </Routes>
    </>
  )
}

export default App
