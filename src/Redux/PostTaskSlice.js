import {createSlice} from '@reduxjs/toolkit';
export const PostTaskSlice = createSlice({
  name: 'PostTaskSlice',
  initialState: {
    step: 0,
    taskId: null,
  },
  reducers: {
    updateStep: (state, action) => {
      state.step = action.payload;
    },
    updatePostedTaskId: (state, action) => {
      state.taskId = action.payload;
    },
  },
});
export const {updateStep, updatePostedTaskId} = PostTaskSlice.actions;
export default PostTaskSlice.reducer;
