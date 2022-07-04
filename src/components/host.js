import axios from 'axios'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import EditPlaylist from './EditPlaylist'
import { createPlaylist } from 'redux/playlist'
import PlaylistForm from './PlaylistForm'

const Host = () => {
  const [hostPlaylists, setHostPlaylists] = useState()

  const dispatch = useDispatch()

  const user = useSelector((state) => state.user.data)
  const playlist = useSelector(({ playlist }) => playlist.data)

  const getPlaylists = async () => {
    const options = {
      method: 'GET',
      url: 'https://api.spotify.com/v1/me/playlists',
      headers: {
        // https://github.com/brix/crypto-js/issues/189
        // https://stackoverflow.com/questions/48524452/base64-encoder-via-crypto-js
        Authorization: `${user.tokenType} ${user.accessToken}`,
      },
    }

    const response = await axios(options)
    setHostPlaylists(
      // The user must own the playlist or the playlist must be collaborative
      response.data.items.filter(
        (playlist) =>
          playlist.owner.display_name === user.name &&
          playlist.collaborative === true
      )
    )
  }

  const getPlaylistItems = async (playlistId) => {
    const options = {
      method: 'GET',
      url: `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      headers: {
        Authorization: `${user.tokenType} ${user.accessToken}`,
      },
    }

    // pagination links on response.data
    const response = await axios(options)

    return response.data
  }

  const createPlaylistInDb = (data, fromAPI = false) => {
    if (fromAPI) {
      const { id, owner, songs, uri, description } = data

      const playlistObj = {
        id,
        name: description,
        uid: owner.id,
        songs,
        spotifyURI: uri,
      }
      dispatch(createPlaylist(playlistObj))
    }
    const { id, owner, uri, description } = data

    const playlistObj = {
      id,
      name: description,
      uid: owner.id,
      songs: [],
      spotifyURI: uri,
    }
    dispatch(createPlaylist(playlistObj))
  }

  const createPlaylistSpotify = ({ name, description }) => {
    const options = {
      method: 'POST',
      url: `https://api.spotify.com/v1/users/${user.id}/playlists`,
      headers: {
        // https://github.com/brix/crypto-js/issues/189
        // https://stackoverflow.com/questions/48524452/base64-encoder-via-crypto-js
        Authorization: `${user.tokenType} ${user.accessToken}`,
      },
      data: {
        name,
        public: false, // to create a collaborative playlist public needs to be set to false
        collaborative: true,
        description,
      },
    }
    return axios(options)
  }

  const selectPlaylist = async (playlist, fromAPI = false) => {
    if (fromAPI) {
      const songs = await getPlaylistItems(playlist.id)
      const parsedSongs = songs.items.map((song) => {
        return {
          id: song.track.id,
          // artists: [
          //   {
          //     // Need to map this as well?
          //     id: song.track.artists.id,
          //     name: song.track.artists.name,
          //     uri: song.track.artists.uri,
          //     // url: song.track.artists.external_urls.spotify,
          //   },
          // ],
          name: song.track.name,
          uri: song.track.uri,
          url: song.track.external_urls.spotify,
        }
      })
      const playlistWithSongs = { ...playlist, songs: parsedSongs }
      createPlaylistInDb(playlistWithSongs, true)
    }
  }

  return (
    <>
      <h3>Play your stuff or create a new playlist</h3>
      <button onClick={getPlaylists}>Get My Playlists</button>
      <PlaylistForm
        createPlaylistInDb={createPlaylistInDb}
        createPlaylistSpotify={createPlaylistSpotify}
      />
      <br />
      {playlist?.id ? <EditPlaylist playlist={playlist} /> : null}
      <br />
      <br />
      <ul>
        {hostPlaylists
          ? hostPlaylists.map((playlist) => {
              return (
                <li key={playlist.id}>
                  <p>{playlist.description}</p>
                  <button onClick={() => selectPlaylist(playlist, true)}>
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
