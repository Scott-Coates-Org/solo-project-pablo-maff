import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import firebaseClient from 'firebase/client'
import firebase from 'firebase/app'

const initialState = {
  data: [],
  isLoaded: false,
  hasErrors: false,
  errorMsg: '',
}

const song = createSlice({
  name: 'song',
  initialState,
  reducers: {
    getData: (state) => {
      state.isLoaded = false
      state.hasErrors = false
      state.errorMsg = ''
    },

    getDataSuccess: (state, action) => {
      state.isLoaded = true
      state.data = action.payload.sort((a, b) => b.votes - a.votes)
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

export const reducer = song.reducer

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
} = song.actions

export const fetchSelectedPlaylistSongs = createAsyncThunk(
  'playlist/fetchSelectedPlaylistSongs',
  async (playlistId, thunkAPI) => {
    thunkAPI.dispatch(getData())
    try {
      await firebaseClient
        .firestore()
        .collection(`playlists/${playlistId}/songs`)
        .onSnapshot((querySnapshot) => {
          let songs = []
          querySnapshot.forEach((doc) => {
            songs.push(doc.data())
          })
          thunkAPI.dispatch(getDataSuccess(songs))
        })
    } catch (error) {
      thunkAPI.dispatch(getDataFailure(error))
    }
  }
)

export const createSong = createAsyncThunk(
  'song/createSong',
  async (payload, thunkAPI) => {
    try {
      thunkAPI.dispatch(createData())
      await _createSongData(payload)
      thunkAPI.dispatch(createDataSuccess(payload.songObj))
    } catch (error) {
      thunkAPI.dispatch(createDataFailure(error))
    }
  }
)

export const createBatchSongs = createAsyncThunk(
  'song/createBatchSongs',
  async (payload, thunkAPI) => {
    try {
      thunkAPI.dispatch(createData())
      await _createBatchSongs(payload)
      thunkAPI.dispatch(createDataSuccess(payload))
    } catch (error) {
      thunkAPI.dispatch(createDataFailure(error))
    }
  }
)

export const addSongToPlaylist = createAsyncThunk(
  'song/appendSong',
  async (payload, thunkAPI) => {
    try {
      thunkAPI.dispatch(appendData())
      await _createSongData(payload)
      thunkAPI.dispatch(appendDataSuccess(payload))
    } catch (error) {
      thunkAPI.dispatch(appendDataFailure(error))
    }
  }
)

export const deleteSong = createAsyncThunk(
  'song/deleteSong',
  async (payload, thunkAPI) => {
    try {
      thunkAPI.dispatch(deleteData())
      await _deleteSongData(payload)
      const songsState = thunkAPI.getState().song.data
      const remainingSongs = songsState.filter((song) => song.id !== payload.id)
      thunkAPI.dispatch(deleteDataSuccess(remainingSongs))
    } catch (error) {
      thunkAPI.dispatch(deleteDataFailure(error))
    }
  }
)

export const voteSong = createAsyncThunk(
  'song/voteSong',
  async (payload, thunkAPI) => {
    try {
      thunkAPI.dispatch(updateData())
      await _voteSong(payload)
      const votedSong = { ...payload, votes: payload.votes + 1 }
      const songsState = thunkAPI.getState().song.data
      const updatedSongs = songsState.map((song) =>
        song.id !== votedSong.id ? song : votedSong
      )
      thunkAPI.dispatch(updateDataSuccess(updatedSongs))
    } catch (error) {
      thunkAPI.dispatch(updateDataFailure(error))
    }
  }
)

const _voteSong = async (songObj) => {
  const doc = await firebaseClient
    .firestore()
    .collection('playlists')
    .doc(songObj.playlistId)
    .collection('songs')
    .doc(songObj.id)
    .update({
      votes: firebase.firestore.FieldValue.increment(1),
    })

  return doc
}

async function _createSongData(songObj) {
  const doc = await firebaseClient
    .firestore()
    .collection('playlists')
    .doc(songObj.playlistId)
    .collection('songs')
    .doc(songObj.id)
    .set(songObj)

  return doc
}

const _createBatchSongs = async (songsArray) => {
  for (const song of songsArray) {
    await firebaseClient
      .firestore()
      .collection('playlists')
      .doc(song.playlistId)
      .collection('songs')
      .doc(song.id)
      .set(song)
  }
}

const _deleteSongData = async (song) => {
  const doc = await firebaseClient
    .firestore()
    .collection('playlists')
    .doc(song.playlistId)
    .collection('songs')
    .doc(song.id)
    .update({
      songs: firebase.firestore.FieldValue.arrayRemove(song),
    })

  return doc
}
