import {createSlice} from '@reduxjs/toolkit';

//NOTE: globalState,전역 상태라고 보면 된다.
const initialState = {
  name: '',
  email: '',
  accessToken: '',
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action) {
      state.email = action.payload.email;
      state.name = action.payload.name;
      state.accessToken = action.payload.accessToken;
    },
  },
  extraReducers: builder => {},
});

export default userSlice;

//NOTE: flow는 userSlice이 모여서 reducer.ts가 되고 그게 또 index.ts store에 연결을 해준다.
