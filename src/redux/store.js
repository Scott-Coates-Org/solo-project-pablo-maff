// https://dev.to/thatgalnatalie/how-to-get-started-with-redux-toolkit-41e
import { configureStore } from '@reduxjs/toolkit'
import { combineReducers } from 'redux'
import { reducer as user } from './user'
import { reducer as playlist } from './playlist'
// const reducer = combineReducers({
//   user,
// })

const store = configureStore({
  reducer: {
    user,
    playlist,
  },
})

export default store
