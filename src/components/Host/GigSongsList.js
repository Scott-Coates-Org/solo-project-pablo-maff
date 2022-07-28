import axios from 'axios'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useMatch } from 'react-router-dom'
import { nextSong } from 'redux/gig'
import { fetchSelectedPlaylistSongs, voteSong } from 'redux/song'

function GigSongsList() {
  const [miliseconds, setMiliseconds] = useState(10000)
  const [votesLeft, setVotesLeft] = useState(5)

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
    dispatch(nextSong(songData[0]))
  }, [])

  // TODO: For premium users gig use this method to set the playing in the remote player at the same time than host
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

  console.log('outside', miliseconds)

  useEffect(() => {
    // TODO: This solution is full of bugs, change it to use the player callback on V2
    const interval = setInterval(() => {
      getCurrentlyPlaying()
        .then((res) => {
          if (res.data.item.duration_ms - res.data.progress_ms <= 2000) {
            console.log(
              'nextTimeLeft',
              res.data.item.duration_ms - res.data.progress_ms
            )
            console.log('next', miliseconds)
            dispatch(nextSong(songData[0]))
            setVotesLeft(5)
            setMiliseconds(5000)
          } else {
            console.log(
              'waitTimeLeft',
              res.data.item.duration_ms - res.data.progress_ms
            )
            console.log('wait', miliseconds)
            setMiliseconds(
              res.data.item.duration_ms - res.data.progress_ms - 2000
            )
          }
        })
        .catch((err) => console.error(err))
    }, miliseconds)

    return () => clearInterval(interval)
  }, [miliseconds, songData])

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
    </>
  )
}

export default GigSongsList
