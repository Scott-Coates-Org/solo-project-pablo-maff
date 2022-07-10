import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useMatch } from 'react-router-dom'
import { fetchSelectedPlaylistSongs, voteSong } from 'redux/song'

function Gig() {
  const playlistId = useMatch('/gig/:id').params.id
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchSelectedPlaylistSongs(playlistId))
  }, [])

  const user = useSelector(({ user }) => user.data)

  const playlist = useSelector(({ playlist }) => playlist.data)

  const { data: songData, isLoaded: songIsLoaded } = useSelector(
    ({ song }) => song
  )

  if (!songIsLoaded) return <div>...loading</div>

  function vote(songObj) {
    dispatch(voteSong(songObj))
  }

  return (
    <>
      <h1>Gig on!</h1>
      <h3>{playlist.name}</h3>
      {songData.map((song) => (
        <div key={song.id}>
          <p>
            {song.name} {song.votes}
            <button onClick={() => vote(song)}>Vote</button>
          </p>
        </div>
      ))}
    </>
  )
}

export default Gig
