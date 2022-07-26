import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useMatch } from 'react-router-dom'
import { fetchSelectedPlaylistSongs, voteSong } from 'redux/song'
import GigSongsList from './GigSongsList'
import Player from './Player'

function Gig() {
  return (
    <>
      <GigSongsList />
      <Player />
    </>
  )
}

export default Gig
