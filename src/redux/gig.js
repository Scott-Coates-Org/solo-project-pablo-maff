import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import firebaseClient from 'firebase/client'
import { deleteSong } from './song'

const initialState = {
  data: {},
  isLoaded: false,
  hasErrors: false,
  errorMsg: '',
}

const gig = createSlice({
  name: 'gig',
  initialState,
  reducers: {
    getData: (state) => {
      state.isLoaded = false
      state.hasErrors = false
      state.errorMsg = ''
    },

    getDataSuccess: (state, action) => {
      state.isLoaded = true
      state.data = action.payload
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
      state.data = action.payload
    },
    createDataFailure: (state, action) => {
      state.isLoaded = true
      state.hasErrors = true
      state.errorMsg = action.payload.message
    },
    appendData: (state) => {
      state.isLoaded = false
      state.hasErrors = false
      state.errorMsg = ''
    },
    appendDataSuccess: (state, action) => {
      state.isLoaded = true
      state.data = { ...state.data, [action.payload.key]: action.payload.value }
    },
    appendDataFailure: (state, action) => {
      state.isLoaded = true
      state.hasErrors = true
      state.errorMsg = action.payload.message
    },
    deleteData: (state, action) => {
      state.isLoaded = false
      state.hasErrors = false
      state.errorMsg = ''
    },
    deleteDataSuccess: (state, action) => {
      state.isLoaded = true
      state.data = action.payload
    },
    deleteDataFailure: (state, action) => {
      state.isLoaded = true
      state.hasErrors = true
      state.errorMsg = action.payload.message
    },
    updateData: (state, action) => {
      state.isLoaded = false
      state.hasErrors = false
      state.errorMsg = ''
    },
    updateDataSuccess: (state, action) => {
      state.isLoaded = true
      state.data = action.payload
    },
    updateDataFailure: (state, action) => {
      state.isLoaded = true
      state.hasErrors = true
      state.errorMsg = action.payload.message
    },
  },
})

export const reducer = gig.reducer

export const {
  getData,
  getDataSuccess,
  getDataFailure,
  createData,
  createDataSuccess,
  createDataFailure,
  appendData,
  appendDataSuccess,
  appendDataFailure,
  deleteData,
  deleteDataSuccess,
  deleteDataFailure,
  updateData,
  updateDataSuccess,
  updateDataFailure,
} = gig.actions

export const nextSong = createAsyncThunk(
  'gig/nextSong',
  async (songObj, thunkAPI) => {
    thunkAPI.dispatch(createData())
    try {
      const updatedSongObj = { ...songObj, isPlaying: true }
      thunkAPI.dispatch(createDataSuccess({ nextSongUri: updatedSongObj.uri }))
      await _createCurrentSong(updatedSongObj)
      thunkAPI.dispatch(deleteSong(songObj))
    } catch (err) {
      thunkAPI.dispatch(createDataFailure(err))
    }
  }
)

export const fetchCurrentSong = createAsyncThunk(
  'gig/fetchCurrentSong',
  async (_, thunkAPI) => {
    thunkAPI.dispatch(getData())
    try {
      await firebaseClient
        .firestore()
        .collection('gig')
        .doc('1')
        .onSnapshot((doc) => {
          thunkAPI.dispatch(getDataSuccess(doc.data()))
        })
    } catch (error) {
      thunkAPI.dispatch(getDataFailure(error))
    }
  }
)

const _createCurrentSong = async (songObj) => {
  const doc = await firebaseClient
    .firestore()
    .collection('gig')
    .doc('1')
    .set(songObj)

  return doc
}
