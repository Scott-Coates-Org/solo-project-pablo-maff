import axios from 'axios'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addSongToPlaylist, deleteSongFromPlaylist } from 'redux/playlist'

const EditPlaylist = () => {
  const [searchInput, setSearchInput] = useState('')
  const [searchedSongs, setSearchedSongs] = useState([])

  const playlist = useSelector(({ playlist }) => playlist.data)
  const dispatch = useDispatch()

  const user = useSelector((state) => state.user.data)

  const handleSearchInput = (e) => {
    setSearchInput(e.target.value)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    searchSongs(searchInput)
  }

  // Make it possible to delete many songs at the same time by passing an array with the uris to data
  // TODO: delete song from db method
  const deleteSongSpotify = (song) => {
    const options = {
      method: 'DELETE',
      url: `https://api.spotify.com/v1/playlists/${playlist.id}/tracks`,
      headers: {
        Authorization: `${user.tokenType} ${user.accessToken}`,
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
  const addSongSpotify = (song) => {
    const options = {
      method: 'POST',
      url: `https://api.spotify.com/v1/playlists/${playlist.id}/tracks`,
      headers: {
        Authorization: `${user.tokenType} ${user.accessToken}`,
      },
      data: {
        uris: [song.uri],
      },
    }

    axios(options)
  }

  const addSong = (song) => {
    const { id, name, uri, external_urls } = song

    const songObj = {
      id,
      name,
      uri,
      url: external_urls.spotify,
    }

    dispatch(addSongToPlaylist({ playlistId: playlist.id, songObj }))
    addSongSpotify(songObj)
  }

  const deleteSong = (song) => {
    console.log('song', song)
    dispatch(
      deleteSongFromPlaylist({ playlistId: playlist.id, songToDelete: song })
    )
    deleteSongSpotify(song.uri)
  }

  const searchSongs = async (searchInput) => {
    const options = {
      method: 'GET',
      url: `https://api.spotify.com/v1/search?q=${searchInput}&type=track&limit=10`,
      headers: {
        // https://github.com/brix/crypto-js/issues/189
        // https://stackoverflow.com/questions/48524452/base64-encoder-via-crypto-js
        Authorization: `${user.tokenType} ${user.accessToken}`,
      },
    }

    // pagination links on response.data
    const response = await axios(options)
    setSearchedSongs(searchedSongs.concat(response.data.tracks.items))
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
              <>
                <p key={song.id}>{song.name}</p>
                <button onClick={() => addSong(song)}>Add to playlist</button>
              </>
            )
          })
        : null}
      <h5>{playlist.description}</h5>
      <p>Songs</p>
      {playlist.songs.map((song) => {
        return (
          <li key={song.id}>
            <p>{song.name}</p>
            <button onClick={() => deleteSong(song)}>Remove</button>
          </li>
        )
      })}
    </>
  )
}

export default EditPlaylist
