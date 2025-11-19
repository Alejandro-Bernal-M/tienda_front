import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  user: {
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    _id: string;
    role: string;
  };
  token: string;
}

const initialState: UserState = {
  user: {
    firstName: '',
    lastName: '',
    fullName: '',
    email: '',
    _id: '',
    role: '',
  },
  token: '',
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    signIn(state, action: PayloadAction<UserState>) {
      console.log('action.payload', action.payload)
      state.user.firstName = action.payload.user.firstName;
      state.user.lastName = action.payload.user.lastName;
      state.user.fullName = action.payload.user.fullName;
      state.user.email = action.payload.user.email;
      state.user._id = action.payload.user._id;
      state.user.role = action.payload.user.role;
      state.token = action.payload.token;
    },
    signOut(state) {
      state.user = {
        firstName: '',
        lastName: '',
        fullName: '',
        email: '',
        _id: '',
        role: '',
      };
      state.token = '';
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },
});

export const { signIn, signOut } = userSlice.actions;
export default userSlice.reducer;