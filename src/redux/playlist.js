import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import firebaseClient from 'firebase/client'
import firebase from 'firebase/app'

const initialState = {
  data: [],
  isLoaded: false,
  hasErrors: false,
  errorMsg: '',
}

const playlist = createSlice({
  name: 'playlist',
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
      state.data = [...state.data, action.payload]
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

export const reducer = playlist.reducer

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
} = playlist.actions

export const fetchAllActivePlaylists = createAsyncThunk(
  'playlist/fetchAllActivePlaylists',
  async (_, thunkAPI) => {
    thunkAPI.dispatch(getData())
    try {
      const data = await _fetchAllActivePlaylistsFromDb()
      thunkAPI.dispatch(getDataSuccess(data))
    } catch (error) {
      thunkAPI.dispatch(getDataFailure(error))
    }
  }
)

export const createPlaylist = createAsyncThunk(
  'playlist/createPlaylist',
  async (payload, thunkAPI) => {
    thunkAPI.dispatch(createData())
    try {
      await _createPlaylistData(payload)
      thunkAPI.dispatch(createDataSuccess(payload))
    } catch (error) {
      thunkAPI.dispatch(createDataFailure(error))
    }
  }
)

export const addGuestToPlaylist = createAsyncThunk(
  'playlist/appendGuest',
  async (payload, thunkAPI) => {
    try {
      thunkAPI.dispatch(updateData())

      const updatedPlaylist = {
        ...payload.playlistObj,
        guests: [...payload.playlistObj.guests, payload.guest],
      }
      const playlistState = thunkAPI.getState().playlist.data

      const updatedPlaylists = playlistState.map((playlist) =>
        playlist.id !== updatedPlaylist.id ? playlist : updatedPlaylist
      )

      await _addGuestToPlaylist({
        playlistId: payload.playlistObj.id,
        name: payload.guest,
      })

      thunkAPI.dispatch(updateDataSuccess(updatedPlaylists))
    } catch (error) {
      thunkAPI.dispatch(updateDataSuccess(error))
    }
  }
)

export const removeGuestFromPlaylist = createAsyncThunk(
  'playlist/removeGuest',
  async (payload, thunkAPI) => {
    try {
      thunkAPI.dispatch(deleteData())
      await _deleteGuestData(payload)
      thunkAPI.dispatch(deleteDataSuccess(payload.id))
    } catch (error) {
      thunkAPI.dispatch(deleteDataFailure(error))
    }
  }
)

export const updatePlaylistActiveState = createAsyncThunk(
  'playlist/activeState',
  async (payload, thunkAPI) => {
    try {
      thunkAPI.dispatch(updateData())
      await _updatePlaylistActiveState(payload)
      thunkAPI.dispatch(updateDataSuccess(payload))
    } catch (error) {
      thunkAPI.dispatch(updateDataFailure(error))
    }
  }
)

const _fetchAllActivePlaylistsFromDb = async () => {
  const snapshot = await firebaseClient
    .firestore()
    .collection('playlists')
    .where('activeGig', '==', true)
    .get()

  const data = snapshot.docs.map((doc) => doc.data())

  return data
}

const _updatePlaylistActiveState = async (playlist) => {
  await firebaseClient
    .firestore()
    .collection('playlists')
    .doc(playlist.id)
    .update({
      activeGig: playlist.activeGig,
    })
}

const _addGuestToPlaylist = async (guestObj) => {
  const doc = await firebaseClient
    .firestore()
    .collection('playlists')
    .doc(guestObj.playlistId)
    .update({
      guests: firebase.firestore.FieldValue.arrayUnion(guestObj.name),
    })
}

const _createPlaylistData = async (playlistObj) => {
  const doc = await firebaseClient
    .firestore()
    .collection('playlists')
    .doc(playlistObj.id)
    .set(playlistObj)

  return doc
}

const _deleteGuestData = async (guestObj) => {
  const doc = await firebaseClient
    .firestore()
    .collection('playlists')
    .doc(guestObj.playlistId)
    .update({
      guests: firebase.firestore.FieldValue.arrayRemove(guestObj),
    })
}
