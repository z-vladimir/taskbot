import {createSlice} from '@reduxjs/toolkit';
export const PostProjectSlice = createSlice({
  name: 'PostProjectSlice',
  initialState: {
    step: 0,
    postedItemOne: {},
    postedItemTwo:{},
  },
  reducers: {
    updateStep: (state, action) => {
      state.step = action.payload;
    },
    updatePostedItemOne: (state, action) => {
      state.postedItemOne = action.payload;
    },
    updatePostedItemTwo: (state, action) => {
      state.postedItemTwo = action.payload;
    },
  },
});
export const {updateStep, updatePostedItemOne,updatePostedItemTwo} = PostProjectSlice.actions;
export default PostProjectSlice.reducer;
