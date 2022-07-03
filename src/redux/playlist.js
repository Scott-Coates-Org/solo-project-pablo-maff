import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import firebaseClient from 'firebase/client'
import firebase from 'firebase/app'

const initialState = {
  data: {},
  isLoaded: false,
  hasErrors: false,
  existsInDb: false,
  errorMsg: {},
}

const playlist = createSlice({
  name: 'playlist',
  initialState,
  reducers: {
    getData: (state) => {},

    getDataSuccess: (state, action) => {
      state.isLoaded = true
      state.data = action.payload
    },

    getDataFailure: (state, action) => {
      state.isLoaded = true
      state.hasErrors = true
      state.errorMsg = action.payload
    },
    createDataFailure: (state, action) => {
      state.hasErrors = true
      state.errorMsg = action.payload
    },
    appendData: (state) => {
      state.isLoaded = false
      state.hasErrors = false
      state.errorMsg = {}
    },
    appendDataSuccess: (state, action) => {
      state.isLoaded = true
      state.existsInDb = true
      state.data = { ...state.data, ...action.payload }
    },
    appendDataFailure: (state, action) => {
      state.isLoaded = true
      state.hasErrors = true
      state.errorMsg = action.payload
    },
    appendSongSuccess: (state, action) => {
      state.isLoaded = true
      state.existsInDb = true
      state.data = {
        ...state.data,
        songs: state.data.songs.concat(action.payload),
      }
    },
  },
})

export const reducer = playlist.reducer

export const {
  getData,
  getDataSuccess,
  getDataFailure,
  createDataFailure,
  appendData,
  appendDataSuccess,
  appendDataFailure,
  appendSongSuccess,
} = playlist.actions

export const fetchPlaylist = createAsyncThunk(
  'playlist/fetchPlaylist',
  async (payload, thunkAPI) => {
    thunkAPI.dispatch(appendData())

    try {
      const data = await _fetchPlaylistFromDb(payload.id)

      if (!data) {
        thunkAPI.dispatch(createPlaylist(payload))
      } else {
        thunkAPI.dispatch(appendDataSuccess({ ...payload, ...data }))
      }
    } catch (error) {
      thunkAPI.dispatch(appendDataFailure(error))
    }
  }
)

export const createPlaylist = createAsyncThunk(
  'playlist/createPlaylist',
  async (payload, thunkAPI) => {
    try {
      await _createPlaylistData(payload)
      thunkAPI.dispatch(appendDataSuccess(payload))
    } catch (error) {
      thunkAPI.dispatch(createDataFailure(error))
    }
  }
)

export const addSongToPlaylist = createAsyncThunk(
  'playlist/appendSong',
  async (payload, thunkAPI) => {
    try {
      await _addSongToPlaylist(payload.playlistId, payload.songObj)
      thunkAPI.dispatch(appendSongSuccess(payload.songObj))
    } catch (error) {
      thunkAPI.dispatch(createDataFailure(error))
    }
  }
)

const _addSongToPlaylist = async (playlistId, songObj) => {
  const doc = await firebaseClient
    .firestore()
    .collection('playlists')
    .doc(playlistId)
    .update({
      songs: firebase.firestore.FieldValue.arrayUnion(songObj),
    })

  return doc
}

async function _createPlaylistData(playlistObj) {
  const doc = await firebaseClient
    .firestore()
    .collection('playlists')
    .doc(playlistObj.id)
    .set(playlistObj)

  return doc
}
