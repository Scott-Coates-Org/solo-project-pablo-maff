// https://dev.to/thatgalnatalie/how-to-get-started-with-redux-toolkit-41e
import { configureStore } from '@reduxjs/toolkit'
import { combineReducers } from 'redux'
import { reducer as user } from './user'
import { reducer as playlist } from './playlist'
import { reducer as song } from './song'

// const reducer = combineReducers({
//   user,
// })

const store = configureStore({
  reducer: {
    user,
    playlist,
    song,
  },
})

export default store
