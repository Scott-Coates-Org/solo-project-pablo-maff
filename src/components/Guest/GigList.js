import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Button, Form, FormGroup, Input, Label } from 'reactstrap'
import { addGuestToPlaylist, fetchAllActivePlaylists } from 'redux/playlist'

const GigList = () => {
  const [guestName, setGuestName] = useState('')

  const navigate = useNavigate()

  const dispatch = useDispatch()

  const playlist = useSelector(({ playlist }) => playlist.data)

  console.log('p', playlist)

  // const { data: songData, isLoaded: songIsLoaded } = useSelector(
  //   ({ song }) => song
  // )

  const handleGuestName = (e) => {
    e.preventDefault()
    setGuestName(e.target.name.value)
  }

  const joinGig = (playlistObj) => {
    dispatch(addGuestToPlaylist({ playlistObj, guest: guestName }))
    navigate(`/gig/guest/${playlistObj.id}`)
  }

  return (
    <>
      {!!guestName ? (
        <ul>
          {playlist.map((p) => (
            <li key={p.id}>
              <h4>{p.name}</h4>
              <p>People in the gig: {p.guests.length + 1}</p>
              <button onClick={() => joinGig(p)}>Join!</button>
            </li>
          ))}
        </ul>
      ) : (
        <Form
          onSubmit={handleGuestName}
          className='p-3 my-3 border border-primary'
        >
          <FormGroup>
            <Label for='name'>What's your name?</Label>
            <Input id='name' type='text' />
          </FormGroup>
          <Button type='submit' color='primary'>
            Submit
          </Button>
        </Form>
      )}
    </>
  )
}

export default GigList
