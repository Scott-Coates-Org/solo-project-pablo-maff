// https://dev.to/thatgalnatalie/how-to-get-started-with-redux-toolkit-41e
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import firebaseClient from 'firebase/client'

const initialState = {
  data: {},
  isLoaded: false,
  hasErrors: false,
}

const user = createSlice({
  name: 'user',
  initialState,
  reducers: {
    getData: (state) => {
      console.log(state)
    },

    getDataSuccess: (state, action) => {
      state.isLoaded = true
      state.data = action.payload
    },

    getDataFailure: (state, action) => {
      state.isLoaded = true
      state.hasErrors = true
    },

    createDataFailure: (state) => {
      state.hasErrors = true
    },
  },
})

export const reducer = user.reducer

export const { getData, getDataSuccess, getDataFailure, createDataFailure } =
  user.actions

export const fetchAllUsers = createAsyncThunk(
  'user/fetchAllUsers',
  async (_, thunkAPI) => {
    // Set the loading state to true
    thunkAPI.dispatch(getData())

    try {
      const data = await _fetchAllUsersFromDb()
      thunkAPI.dispatch(getDataSuccess(data))
    } catch (error) {
      console.error('error', error)
      // Set any erros while trying to fetch
      thunkAPI.dispatch(getDataFailure(error))
    }
  }
)

// TODO: Data gets overwritten every time user logs in. Arrange this at some point so only the token values are changed
export const createUser = createAsyncThunk(
  'user/createUser',
  async (payload, thunkAPI) => {
    try {
      const response = await _createUser(payload)
      thunkAPI.dispatch(getDataSuccess(payload))
    } catch (error) {
      console.error('error', error)
      // Set any erros while trying to fetch
      thunkAPI.dispatch(createDataFailure())
    }
  }
)

async function _fetchAllUsersFromDb() {
  const snapshot = await firebaseClient.firestore().collection('users').get()

  const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

  return data
}

async function _createUser(newUserObj) {
  const doc = await firebaseClient
    .firestore()
    .collection('user')
    .doc(newUserObj.id)
    .set(newUserObj)

  return doc
}

// https://stackoverflow.com/a/31205878/173957
function _appendToFilename(filename, string) {
  var dotIndex = filename.lastIndexOf('.')
  if (dotIndex == -1) return filename + string
  else
    return (
      filename.substring(0, dotIndex) + string + filename.substring(dotIndex)
    )
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
