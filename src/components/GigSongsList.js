import axios from 'axios'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useMatch } from 'react-router-dom'
import { nextSong } from 'redux/gig'
import { fetchSelectedPlaylistSongs, voteSong } from 'redux/song'

function GigSongsList() {
  const [miliseconds, setMiliseconds] = useState(10000)

  const playlistId = useMatch('/gig/:id').params.id
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchSelectedPlaylistSongs(playlistId))
  }, [])

  const playlist = useSelector(({ playlist }) => playlist.data)

  const { data: songData } = useSelector(({ song }) => song)

  const { data: userData } = useSelector(({ user }) => user)

  const token = userData.accessToken

  useEffect(() => {
    dispatch(nextSong(songData[0].uri))
  }, [])

  const getCurrentlyPlaying = async () => {
    const options = {
      method: 'GET',
      url: 'https://api.spotify.com/v1/me/player/currently-playing',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }

    const response = await axios(options)

    return response
  }

  useEffect(() => {
    const interval = setInterval(() => {
      getCurrentlyPlaying()
        .then((res) => {
          if (res.data.item.duration_ms - res.data.progress_ms <= 10000) {
            dispatch(nextSong(songData[0].uri))
            setMiliseconds(20000)
          } else {
            setMiliseconds(
              res.data.item.duration_ms - res.data.progress_ms - 10000
            )
          }
        })
        .catch((err) => console.error(err))
    }, miliseconds)

    return () => clearInterval(interval)
  }, [miliseconds, songData])

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

export default GigSongsList
