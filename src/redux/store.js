// https://dev.to/thatgalnatalie/how-to-get-started-with-redux-toolkit-41e
import { configureStore } from '@reduxjs/toolkit'
import { reducer as user } from './user'
import { reducer as playlist } from './playlist'
import { reducer as song } from './song'
import { reducer as gig } from './gig'

const store = configureStore({
  reducer: {
    user,
    playlist,
    song,
    gig,
  },
})

export default store
