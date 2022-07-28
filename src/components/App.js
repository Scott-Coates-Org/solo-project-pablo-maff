import 'bootstrap/dist/css/bootstrap.min.css'
import Home from 'components/Home'
import { Route, Routes } from 'react-router-dom'
import Host from './Host/Host'
import Gig from './Host/Gig'
import GigList from './Guest/GigList'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { fetchAllActivePlaylists } from 'redux/playlist'
import GuestGig from './Guest/GuestGig'

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
      <Route path='/gig/guest/:id' element={<GuestGig />} />
    </Routes>
  )

  return appElement
}

export default App
