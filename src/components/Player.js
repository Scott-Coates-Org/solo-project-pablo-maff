import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import SpotifyPlayer from 'react-spotify-web-playback'

function Player() {
  const [play, setPlay] = useState(false)

  const { data: gigData, isLoaded: gigIsLoaded } = useSelector(({ gig }) => gig)

  const trackUri = gigData.nextSongUri

  useEffect(() => setPlay(true), [trackUri])

  const { data: userData, isLoaded: userIsLoaded } = useSelector(
    ({ user }) => user
  )

  if (!userIsLoaded) return <div>...loading</div>

  const token = userData.accessToken

  // NEXT
  // TODO: Add uri to queue instead of directly to player

  // TODO: Remove song being played from the songs playlist
  // TODO: Create Guest interface

  return (
    <SpotifyPlayer
      token={token}
      callback={(state) => {
        if (!state.isPlaying) setPlay(false)
      }}
      play={play}
      uris={trackUri}
    />
  )
}

export default Player
