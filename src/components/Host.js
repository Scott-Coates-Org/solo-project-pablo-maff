import axios from 'axios'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import EditPlaylist from './EditPlaylist'
import { createPlaylist, updatePlaylistActiveState } from 'redux/playlist'
import PlaylistForm from './PlaylistForm'
import { useNavigate } from 'react-router-dom'
import { createBatchSongs } from 'redux/song'

function Host() {
  const [hostPlaylists, setHostPlaylists] = useState()

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { data: userData, isLoaded: userIsLoaded } = useSelector(
    ({ user }) => user
  )
  const playlist = useSelector(({ playlist }) => playlist.data)

  if (!userIsLoaded) return <div>loading...</div>

  const getPlaylists = async () => {
    const options = {
      method: 'GET',
      url: 'https://api.spotify.com/v1/me/playlists',
      headers: {
        // https://github.com/brix/crypto-js/issues/189
        // https://stackoverflow.com/questions/48524452/base64-encoder-via-crypto-js
        Authorization: `${userData.tokenType} ${userData.accessToken}`,
      },
    }

    const response = await axios(options)
    setHostPlaylists(
      // The user must own the playlist or the playlist must be collaborative
      response.data.items.filter(
        (playlist) =>
          playlist.owner.display_name === userData.name &&
          playlist.collaborative === true
      )
    )
  }

  const getPlaylistItems = async (playlistId) => {
    const options = {
      method: 'GET',
      url: `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      headers: {
        Authorization: `${userData.tokenType} ${userData.accessToken}`,
      },
    }

    // pagination links on response.data
    const response = await axios(options)

    return response.data
  }

  // TODO: DRY
  const createPlaylistInDb = (data, fromAPI = false) => {
    if (fromAPI) {
      const { id, owner, songs, uri, description } = data

      const playlistObj = {
        id,
        name: description,
        uid: owner.id,
        spotifyURI: uri,
        guests: [],
        activeGig: false,
        host: userData.name,
      }
      dispatch(createPlaylist(playlistObj))
      dispatch(createBatchSongs(songs))
    } else {
      const { id, owner, uri, description } = data
      const playlistObj = {
        id,
        name: description,
        uid: owner.id,
        songs: [],
        spotifyURI: uri,
        guests: [],
        activeGig: false,
        host: userData.name,
      }
      dispatch(createPlaylist(playlistObj))
    }
  }

  const createPlaylistSpotify = ({ name, description }) => {
    const options = {
      method: 'POST',
      url: `https://api.spotify.com/v1/users/${userData.id}/playlists`,
      headers: {
        // https://github.com/brix/crypto-js/issues/189
        // https://stackoverflow.com/questions/48524452/base64-encoder-via-crypto-js
        Authorization: `${userData.tokenType} ${userData.accessToken}`,
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

  const selectPlaylist = async (playlist) => {
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
        votes: 0,
        playlistId: playlist.id,
      }
    })
    const playlistWithSongs = { ...playlist, songs: parsedSongs }
    createPlaylistInDb(playlistWithSongs, true)
  }

  const startGig = () => {
    dispatch(updatePlaylistActiveState({ ...playlist, activeGig: true }))
    navigate(`/gig/${playlist.id}`)
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
      {playlist?.id ? (
        <>
          <button onClick={startGig}>Start Gig</button>
          <EditPlaylist />
        </>
      ) : null}
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
