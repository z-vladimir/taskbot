import {createSlice} from '@reduxjs/toolkit';
export const SavedSlice = createSlice({
  name: 'SavedSlice',
  initialState: {
    savedSellers: [],
    savedTasks: [],
    savedProjects: [],
  },
  reducers: {
    updateSavedSellers: (state, action) => {
      state.savedSellers = action.payload;
    },
    updateSavedTasks: (state, action) => {
      state.savedTasks = action.payload;
    },
    updateSavedProjects: (state, action) => {
      state.savedProjects = action.payload;
    },
  },
});
export const {updateSavedSellers, updateSavedTasks, updateSavedProjects} =
  SavedSlice.actions;
export default SavedSlice.reducer;
