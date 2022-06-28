import axios from 'axios'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Base64 from 'crypto-js/enc-base64'
import Utf8 from 'crypto-js/enc-utf8'

const Host = () => {
  const [hostAuthData, setHostAuthData] = useState('')
  const [token, setToken] = useState('')
  const [songData, setSongData] = useState()
  const [me, setMe] = useState()
  const [hostPlaylists, setHostPlaylists] = useState()

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

    axios(options).then((response) => setMe(response.data))
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

    axios(options).then((response) => setHostPlaylists(response.data))
  }

  return (
    <>
      <button onClick={authentication}>Auth</button>
      <button onClick={setAccessToken}> SetToken</button>
      <button onClick={refreshToken}>Refresh Token</button>
      <button onClick={getSong}>Get Song Data</button>
      <button onClick={getMe}>Get Me</button>
      <button onClick={getPlaylists}>Get My Playlists</button>
      <br />
      <br />
      <br />
      <br />
      {me ? JSON.stringify(me) : null}
      <br />
      <br />
      {songData ? JSON.stringify(songData) : null}
      <br />
      <br />
      {hostPlaylists ? JSON.stringify(hostPlaylists) : null}
    </>
  )
}

export default Host
