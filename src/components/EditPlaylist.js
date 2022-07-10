import axios from 'axios'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addSongToPlaylist, createSong, deleteSong } from 'redux/song'

function EditPlaylist() {
  const [searchInput, setSearchInput] = useState('')
  const [searchedSongs, setSearchedSongs] = useState([])

  const dispatch = useDispatch()

  const { data: userData, isLoaded: userIsLoaded } = useSelector(
    ({ user }) => user
  )

  const playlist = useSelector(({ playlist }) => playlist.data)

  // console.log('playlist', playlist)

  const { data: songData, isLoaded: songIsLoaded } = useSelector(
    ({ song }) => song
  )

  // console.log('songdata', songData)

  if (!userIsLoaded) return <div>loading...</div>

  const handleSearchInput = (e) => {
    setSearchInput(e.target.value)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    searchSongs(searchInput)
  }

  // Make it possible to delete many songs at the same time by passing an array with the uris to data
  const deleteSongSpotify = (song) => {
    const options = {
      method: 'DELETE',
      url: `https://api.spotify.com/v1/playlists/${playlist.id}/tracks`,
      headers: {
        Authorization: `${userData.tokenType} ${userData.accessToken}`,
      },
      data: {
        tracks: [{ uri: song }],
      },
    }

    axios(options).then(
      (
        response // Also remove from frontend once you have that sorted out
      ) => console.log('response', response)
    )
  }

  // Add possibility of adding multiple songs at the same time. Add the songs to an array state and pass it to uris
  const addSongSpotify = async (songURI) => {
    const options = {
      method: 'POST',
      url: `https://api.spotify.com/v1/playlists/${playlist.id}/tracks`,
      headers: {
        Authorization: `${userData.tokenType} ${userData.accessToken}`,
      },
      data: {
        uris: [songURI],
      },
    }

    const response = await axios(options)

    return response.data
  }

  // TODO: If a song is already in the list it can't be added again
  const addSong = async (song) => {
    console.log('song', song)
    const { id, name, uri, external_urls } = song

    const songObj = {
      id,
      name,
      uri,
      url: external_urls.spotify,
      votes: 0,
      playlistId: playlist.id,
    }

    await addSongSpotify(songObj.uri)
    dispatch(addSongToPlaylist(songObj))
  }

  const deleteSongHandler = (song) => {
    dispatch(deleteSong(song))
    deleteSongSpotify(song.uri)
  }

  const searchSongs = async (searchInput) => {
    const options = {
      method: 'GET',
      url: `https://api.spotify.com/v1/search?q=${searchInput}&type=track&limit=10`,
      headers: {
        // https://github.com/brix/crypto-js/issues/189
        // https://stackoverflow.com/questions/48524452/base64-encoder-via-crypto-js
        Authorization: `${userData.tokenType} ${userData.accessToken}`,
      },
    }

    // pagination links on response.data
    const response = await axios(options)
    setSearchedSongs(response.data.tracks.items)
  }

  return (
    <>
      <h5>Add Songs</h5>
      <form onSubmit={handleSubmit}>
        <input onChange={handleSearchInput} />
        <button type='submit'>Search</button>
      </form>
      {searchedSongs
        ? searchedSongs.map((song) => {
            return (
              <div key={song.id}>
                <p>{song.name}</p>
                <button onClick={() => addSong(song)}>Add to playlist</button>
              </div>
            )
          })
        : null}
      <h5>{playlist.description}</h5>
      <p>Songs</p>
      {songData.length &&
        songData.map((song) => {
          return (
            <li key={song.id}>
              <p>{song.name}</p>
              <button onClick={() => deleteSongHandler(song)}>Remove</button>
            </li>
          )
        })}
    </>
  )
}

export default EditPlaylist
