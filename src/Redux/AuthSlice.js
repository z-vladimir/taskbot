import {createSlice} from '@reduxjs/toolkit';
export const AuthSlice = createSlice({
  name: 'AuthSlice',
  initialState: {
    token: null,
    visibleProfile: '',
    userInfo: {},
    profileImage: '',
    verified: '',
    wallet: '',
  },
  reducers: {
    updateToken: (state, action) => {
      state.token = action.payload;
    },
    updateVisibleProfile: (state, action) => {
      state.visibleProfile = action.payload;
    },
    updateUserInfo: (state, action) => {
      state.userInfo = action.payload;
    },
    updateProfileImage: (state, action) => {
      state.profileImage = action.payload;
    },
    updateVerified: (state, action) => {
      state.verified = action.payload;
    },
    updateWallet: (state, action) => {
      state.wallet = action.payload;
    },
  },
});
export const {
  updateToken,
  updateUserInfo,
  updateVisibleProfile,
  updateProfileImage,
  updateVerified,
  updateWallet,
} = AuthSlice.actions;
export default AuthSlice.reducer;
