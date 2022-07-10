// https://dev.to/thatgalnatalie/how-to-get-started-with-redux-toolkit-41e
import { createSlice, createAsyncThunk, current } from '@reduxjs/toolkit'
import firebaseClient from 'firebase/client'

const initialState = {
  data: {},
  isLoaded: false,
  hasErrors: false,
  existsInDb: false,
  errorMsg: '',
}

const user = createSlice({
  name: 'user',
  initialState,
  reducers: {
    getData: (state) => {},

    getDataSuccess: (state, action) => {
      state.isLoaded = true
      state.data = action.payload
      state.errorMsg = ''
    },

    getDataFailure: (state, action) => {
      state.isLoaded = true
      state.hasErrors = true
      state.errorMsg = action.payload.message
    },
    createData: (state) => {
      state.isLoaded = false
      state.hasErrors = false
      state.errorMsg = ''
    },
    createDataSuccess: (state, action) => {
      state.isLoaded = true
      state.existsInDb = true
      state.errorMsg = ''
      state.data = { ...state.data, ...action.payload }
    },
    createDataFailure: (state, action) => {
      state.isLoaded = true
      state.hasErrors = true
      state.errorMsg = action.payload.message
    },
  },
})

export const reducer = user.reducer

export const {
  getData,
  getDataSuccess,
  getDataFailure,
  createData,
  createDataSuccess,
  createDataFailure,
} = user.actions

// TODO: Data gets overwritten every time user logs in. Arrange this at some point so only the token values are changed
export const createUser = createAsyncThunk(
  'user/createUser',
  async (payload, thunkAPI) => {
    try {
      thunkAPI.dispatch(createData())
      await _createUser(payload)
      thunkAPI.dispatch(createDataSuccess(payload))
    } catch (error) {
      thunkAPI.dispatch(createDataFailure(error))
    }
  }
)

async function _createUser(newUserObj) {
  const doc = await firebaseClient
    .firestore()
    .collection('user')
    .doc(newUserObj.id)
    .set(newUserObj)

  return doc
}

async function _fetchUserFromDb(uid) {
  const snapshot = await firebaseClient
    .firestore()
    .collection('users')
    .where('uid', '==', uid)
    .get()

  const data = snapshot.docs[0] ? { ...snapshot.docs[0].data() } : null

  return data
}
