import 'bootstrap/dist/css/bootstrap.min.css'
import Home from 'components/Home'
import { Route, Routes } from 'react-router-dom'
import Host from './Host'
import Gig from './Gig'
import GigList from './GigList'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { fetchAllActivePlaylists } from 'redux/playlist'

function App() {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchAllActivePlaylists())
  }, [])

  const appElement = (
    <Routes>
      <Route path='/host' element={<Host />} />
      <Route path='/' element={<Home />} />
      <Route path='/active-gigs' element={<GigList />} />
      <Route path='/gig/:id' element={<Gig />} />
    </Routes>
  )

  return appElement
}

export default App
