import axios from 'axios'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Base64 from 'crypto-js/enc-base64'
import Utf8 from 'crypto-js/enc-utf8'

const Host = () => {
  const [hostAuthData, setHostAuthData] = useState('')
  const [songData, setSongData] = useState()
  const [me, setMe] = useState()
  const [hostPlaylists, setHostPlaylists] = useState()
  const [hostUserId, setHostUserId] = useState()
  const [searchedSongs, setSearchedSongs] = useState([])
  const [searchInput, setSearchInput] = useState('')
  const [addedSongs, setAddedSongs] = useState([])
  const [selectedPlaylist, setSelectedPlaylist] = useState()
  const [selectedPlaylistSongs, setSelectedPlaylistSongs] = useState([])

  console.log('hostPlaylists', hostPlaylists)
  console.log('selectedPlaylist', selectedPlaylist)

  const [searchParams, setSearchParams] = useSearchParams()

  const redirect_uri = 'http://localhost:3000/host'
  const clientId = '462b17ca327648a4ac1f6202fa7e3a79'
  const clientSecret = '253ddfa807194bcfad327dc49fbc9ec0'
  const state = 'a23SDFS5432"£$1kaj!23ka"'
  const scope =
    'user-read-recently-played user-read-playback-state playlist-read-collaborative user-read-email user-top-read playlist-modify-public user-read-currently-playing playlist-read-private playlist-modify-private' // streaming (only premium users)

  const authentication = () => {
    window.location.replace(
      `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&scope=${scope}&redirect_uri=${redirect_uri}&state${state}`
    )
  }

  const setAccessToken = () => {
    const code = searchParams.get('code')
    const formData = {
      code: code,
      redirect_uri: redirect_uri,
      grant_type: 'authorization_code',
    }

    const POSTWebhookData = Object.entries(formData)
      .map(([key, value]) => {
        return encodeURIComponent(key) + '=' + encodeURIComponent(value)
      })
      .join('&')

    const options = {
      method: 'POST',
      url: 'https://accounts.spotify.com/api/token',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        // https://github.com/brix/crypto-js/issues/189
        // https://stackoverflow.com/questions/48524452/base64-encoder-via-crypto-js
        Authorization:
          'Basic ' +
          Base64.stringify(Utf8.parse(clientId + ':' + clientSecret)),
      },
      data: POSTWebhookData,
    }

    axios(options).then((response) => setHostAuthData(response.data))
  }

  const refreshToken = () => {
    console.log('refreshToken', hostAuthData.refresh_token)
    const formData = {
      grant_type: 'refresh_token',
      refresh_token: hostAuthData.refresh_token,
    }

    const POSTWebhookData = Object.entries(formData)
      .map(([key, value]) => {
        return encodeURIComponent(key) + '=' + encodeURIComponent(value)
      })
      .join('&')

    const options = {
      method: 'POST',
      url: 'https://accounts.spotify.com/api/token',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        // https://github.com/brix/crypto-js/issues/189
        // https://stackoverflow.com/questions/48524452/base64-encoder-via-crypto-js
        Authorization:
          'Basic ' +
          Base64.stringify(Utf8.parse(clientId + ':' + clientSecret)),
      },
      data: POSTWebhookData,
    }

    axios(options).then((response) => setHostAuthData(response.data))
  }

  const getSong = () => {
    const options = {
      method: 'GET',
      url: 'https://api.spotify.com/v1/tracks/2TpxZ7JUBn3uw46aR7qd6V',
      headers: {
        // https://github.com/brix/crypto-js/issues/189
        // https://stackoverflow.com/questions/48524452/base64-encoder-via-crypto-js
        Authorization: `${hostAuthData.token_type} ${hostAuthData.access_token}`,
      },
    }

    axios(options).then((response) => setSongData(response.data))
  }

  const getMe = () => {
    const options = {
      method: 'GET',
      url: 'https://api.spotify.com/v1/me',
      headers: {
        // https://github.com/brix/crypto-js/issues/189
        // https://stackoverflow.com/questions/48524452/base64-encoder-via-crypto-js
        Authorization: `${hostAuthData.token_type} ${hostAuthData.access_token}`,
      },
    }

    axios(options).then((response) => {
      setMe(response.data)
      setHostUserId(response.data.id)
    })
  }

  const getPlaylists = () => {
    const options = {
      method: 'GET',
      url: 'https://api.spotify.com/v1/me/playlists',
      headers: {
        // https://github.com/brix/crypto-js/issues/189
        // https://stackoverflow.com/questions/48524452/base64-encoder-via-crypto-js
        Authorization: `${hostAuthData.token_type} ${hostAuthData.access_token}`,
      },
    }

    axios(options).then((response) => setHostPlaylists(response.data.items))
  }

  const createPlaylist = () => {
    const options = {
      method: 'POST',
      url: `https://api.spotify.com/v1/users/${hostUserId}/playlists`,
      headers: {
        // https://github.com/brix/crypto-js/issues/189
        // https://stackoverflow.com/questions/48524452/base64-encoder-via-crypto-js
        Authorization: `${hostAuthData.token_type} ${hostAuthData.access_token}`,
      },
      data: {
        name: 'new playlist',
        public: false, // to create a collaborative playlist public needs to be set to false
        collaborative: true,
        description: 'This is my new awesome playlist',
      },
    }

    axios(options).then((response) => setSelectedPlaylist(response.data))
  }

  const searchSongs = (e) => {
    e.preventDefault()
    const options = {
      method: 'GET',
      url: `https://api.spotify.com/v1/search?q=name:${searchInput}&type=track&limit=10`,
      headers: {
        // https://github.com/brix/crypto-js/issues/189
        // https://stackoverflow.com/questions/48524452/base64-encoder-via-crypto-js
        Authorization: `${hostAuthData.token_type} ${hostAuthData.access_token}`,
      },
    }

    axios(options).then((response) =>
      setSearchedSongs(searchedSongs.concat(response.data.tracks.items))
    ) // pagination links on response.data
  }

  const handleSearchInput = (e) => {
    setSearchInput(e.target.value)
  }

  // Add possibility of adding multiple songs at the same time. Add the songs to an array state and pass it to uris
  const addSong = (song) => {
    const options = {
      method: 'POST',
      url: `https://api.spotify.com/v1/playlists/${selectedPlaylist.id}/tracks`,
      headers: {
        Authorization: `${hostAuthData.token_type} ${hostAuthData.access_token}`,
      },
      data: {
        uris: [song.uri],
      },
    }

    axios(options).then((response) =>
      setAddedSongs(addedSongs.concat(response.data))
    )
  }

  const selectPlaylist = (playlist) => {
    setSelectedPlaylist(playlist)
  }

  const getPlaylistItems = () => {
    const options = {
      method: 'GET',
      url: `https://api.spotify.com/v1/playlists/${selectedPlaylist.id}/tracks`,
      headers: {
        Authorization: `${hostAuthData.token_type} ${hostAuthData.access_token}`,
      },
    }

    axios(options).then((response) =>
      setSelectedPlaylistSongs(response.data.items)
    ) // pagination links on response.data
  }

  // Make it possible to delete many songs at the same time by passing an array with the uris to data
  const deleteSong = (song) => {
    console.log('uri', song)
    const options = {
      method: 'DELETE',
      url: `https://api.spotify.com/v1/playlists/${selectedPlaylist.id}/tracks`,
      headers: {
        Authorization: `${hostAuthData.token_type} ${hostAuthData.access_token}`,
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

  console.log('playListItems', selectedPlaylistSongs)

  return (
    <>
      <button onClick={authentication}>Auth</button>
      <button onClick={setAccessToken}> SetToken</button>
      <button onClick={refreshToken}>Refresh Token</button>
      <button onClick={getSong}>Get Song Data</button>
      <button onClick={getMe}>Get Me</button>
      <button onClick={getPlaylists}>Get My Playlists</button>
      <button onClick={getPlaylistItems}>Get Playlist Songs</button>
      <button onClick={createPlaylist}>Create new playlist</button>
      <br />
      <br />
      <form onSubmit={searchSongs}>
        <input onChange={handleSearchInput} />
        <button type='submit'>Search</button>
      </form>
      <br />
      <br />
      {selectedPlaylist ? JSON.stringify(selectedPlaylist) : null}
      <br />
      <br />
      <ul>
        {selectedPlaylistSongs
          ? selectedPlaylistSongs.map((song) => {
              return (
                <li key={song.track.id}>
                  <p>{song.track.name}</p>
                  <button onClick={() => deleteSong(song.track.uri)}>
                    Remove
                  </button>
                </li>
              )
            })
          : null}
      </ul>
      <br />
      <br />
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
      <br />
      <br />
      {me ? JSON.stringify(me) : null}
      <br />
      <br />
      {songData ? JSON.stringify(songData) : null}
      <br />
      <br />
      <ul>
        {hostPlaylists
          ? hostPlaylists.map((playlist) => {
              return (
                <li key={playlist.id}>
                  <p>{playlist.description}</p>
                  <button onClick={() => selectPlaylist(playlist)}>
                    Select
                  </button>
                </li>
              )
            })
          : null}
      </ul>
    </>
  )
}

export default Host
