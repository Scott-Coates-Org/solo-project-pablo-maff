import { useForm } from 'react-hook-form'
import { Button, Form, FormGroup, Input, Label } from 'reactstrap'
import { useDispatch } from 'react-redux'

const PlaylistForm = ({ createPlaylistSpotify, createPlaylistInDb }) => {
  const dispatch = useDispatch()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }, // subscribe to errors
  } = useForm()

  // register is a cb func which returns some props and inject into inputs which allow us to validate and control the inputs
  // ref assigns a ref name for the input field, the rest of the register functionality is passed to for e.g. roomRest
  // { required: true, minLength: 4} validation object
  // {required: 'This is required'} pass a custom error message
  // useForm({defaultValues: { firstName: "bill"}}) define default values
  // useForm({watch}) subscribe to the form input and see what's going on. watch("firstName") subscribe to firstName only
  const { ref: nameRef, ...nameRest } = register('name', { required: true })
  const { ref: descriptionRef, ...descriptionRest } = register('description', {
    required: true,
  })

  const onSubmit = async (data) => {
    console.log('data', data)
    if (Object.keys(errors).length) {
      alert('Error creating playlist: ' + JSON.stringify(errors))
    } else {
      const response = await createPlaylistSpotify({
        name: data.name,
        description: data.description,
      })

      createPlaylistInDb(response.data)
      reset()
    }
  }

  return (
    <Form
      onSubmit={handleSubmit(onSubmit)}
      className='p-3 my-3 border border-primary'
    >
      <FormGroup>
        <Label for='name'>Playlist Name</Label>
        <Input
          id='name'
          type='text'
          {...nameRest}
          innerRef={nameRef}
          invalid={errors.name}
        />
      </FormGroup>
      <FormGroup>
        <Label for='description'>Playlist Description</Label>
        <Input
          id='description'
          type='text'
          {...descriptionRest}
          innerRef={descriptionRef}
          invalid={errors.description}
        />
      </FormGroup>
      <Button type='submit' color='primary'>
        Create Playlist
      </Button>
    </Form>
  )
}

export default PlaylistForm
