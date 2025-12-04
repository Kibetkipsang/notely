import {Routes, Route} from 'react-router-dom'
import { Header } from './components/Header'
import { SettingsInitializer } from './components/SettingsInitializer';
import Auth from './components/Auth'
import Landing from './components/Home'
import Dashboard from './components/pages/Dashboard'
import Editor from './components/pages/Editor'
import NoteView from './components/pages/NoteView'
import Trash from './components/pages/Trash'
import Favorites from './components/pages/Favourites'
import Pinned from './components/pages/Pinned'
import AllNotes from './components/pages/AllNotes'

import './index.css'

function App() {
 

  return (
    <>
    <SettingsInitializer />
    <Header/>
    <Routes>
      <Route path='/' element={<Landing />}/>
      <Route path='/auth' element={<Auth />}/>
      <Route path='/dashboard' element={<Dashboard />}/>
      <Route path='/notes' element={<AllNotes />}/>
      <Route path='/notes/create' element={<Editor />}/>
      <Route path='/notes/:id' element={<NoteView />}/>
      <Route path='/edit/:id' element={<Editor />}/>
      <Route path='/trash' element={<Trash />}/>
      <Route path='/favorites' element={<Favorites />}/>
      <Route path='/pinned' element={<Pinned />}/>
     
    </Routes>
    </>
  )
}

export default App
