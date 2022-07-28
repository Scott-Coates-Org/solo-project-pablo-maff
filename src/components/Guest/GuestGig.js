import axios from 'axios'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useMatch } from 'react-router-dom'
import { fetchCurrentSong } from 'redux/gig'
import { fetchSelectedPlaylistSongs, voteSong } from 'redux/song'

function GuestGig() {
  const [votesLeft, setVotesLeft] = useState(5)

  const playlistId = useMatch('/gig/guest/:id').params.id
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchSelectedPlaylistSongs(playlistId))
    dispatch(fetchCurrentSong())
  }, [])

  const playlist = useSelector(({ playlist }) => playlist.data)

  const { data: songData } = useSelector(({ song }) => song)

  const { data: gigData } = useSelector(({ gig }) => gig)

  useEffect(() => {
    setVotesLeft(5)
  }, [gigData])

  function vote(songObj) {
    setVotesLeft((prevVotes) => prevVotes - 1)
    dispatch(voteSong(songObj))
  }

  return (
    <>
      <h1>Gig on!</h1>
      <h3>{playlist.name}</h3>
      <div>Votes Left: {votesLeft}</div>
      {songData.map((song) => (
        <div key={song.id}>
          <p>
            {song.name} {song.votes}
            {votesLeft > 0 && <button onClick={() => vote(song)}>Vote</button>}
          </p>
        </div>
      ))}
      <h4>Currently Playing: {gigData.name}</h4>
    </>
  )
}

export default GuestGig
