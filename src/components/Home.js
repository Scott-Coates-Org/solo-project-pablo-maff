import axios from 'axios'
import Base64 from 'crypto-js/enc-base64'
import Utf8 from 'crypto-js/enc-utf8'
import { useDispatch } from 'react-redux'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { createUser } from 'redux/user'

function Home() {
  const dispatch = useDispatch()

  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const redirectURI = 'http://localhost:3000'
  const clientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID
  const clientSecret = process.env.REACT_APP_SPOTIFY_CLIENT_SECRET
  const state = process.env.REACT_APP_SPOTIFY_STATE
  const code = searchParams.get('code')

  const getAuthCode = () => {
    const scope =
      'user-read-recently-played user-read-playback-state playlist-read-collaborative user-read-email user-top-read playlist-modify-public user-read-currently-playing playlist-read-private playlist-modify-private' // streaming (only premium users)

    localStorage.setItem('spotifyAuth', 'true')
    window.location.replace(
      `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&scope=${scope}&redirect_uri=${redirectURI}&state=${state}`
    )
  }

  const getMe = (tokenType, token) => {
    const options = {
      method: 'GET',
      url: 'https://api.spotify.com/v1/me',
      headers: {
        Authorization: `${tokenType} ${token}`,
      },
    }

    return axios(options)
  }

  const getToken = () => {
    const returnedState = searchParams.get('state')

    if (state !== returnedState) {
      console.error("States don't match!")
      return
    }

    const formBody = new URLSearchParams()
    formBody.set('grant_type', 'authorization_code')
    formBody.set('code', code)
    formBody.set('redirect_uri', redirectURI)

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
      data: formBody,
    }

    return axios(options)
  }

  // TODO Worry about this later
  // const refreshToken = () => {
  //   const formBody = new URLSearchParams()
  //   formBody.set('grant_type', 'refresh_token')
  //   formBody.set('refresh_token', hostTokenData.refresh_token)

  //   const options = {
  //     method: 'POST',
  //     url: 'https://accounts.spotify.com/api/token',
  //     headers: {
  //       'Content-Type': 'application/x-www-form-urlencoded',
  //       // https://github.com/brix/crypto-js/issues/189
  //       // https://stackoverflow.com/questions/48524452/base64-encoder-via-crypto-js
  //       Authorization:
  //         'Basic ' +
  //         Base64.stringify(Utf8.parse(clientId + ':' + clientSecret)),
  //     },
  //     data: formBody,
  //   }

  //   return axios(options)
  // }

  const authenticate = async () => {
    const tokenData = await getToken()
    localStorage.removeItem('spotifyAuth')

    // TODO: Need to add logic to refresh token later
    const { token_type, access_token, refresh_token } = tokenData.data

    const userData = await getMe(token_type, access_token)
    const {
      id,
      display_name,
      email,
      external_urls,
      uri,
      followers,
      ...images
    } = userData.data

    const newUserObj = {
      id,
      name: display_name,
      email,
      spotifyPage: external_urls.spotify,
      spotifyUri: uri,
      followers: followers.total,
      profilePic: images.images[0].url,
      tokenType: token_type,
      accessToken: access_token,
      refreshToken: refresh_token,
    }

    dispatch(createUser(newUserObj))
    navigate('/host')
  }

  if (localStorage.getItem('spotifyAuth') && code) {
    authenticate()
  }

  const joinGig = () => {
    navigate('/active-gigs')
  }

  return (
    <>
      <button onClick={getAuthCode}>Host Gig</button>
      <button onClick={joinGig}>Join a Gig</button>
    </>
  )
}

export default Home
