import {configureStore} from '@reduxjs/toolkit';
import {useDispatch} from 'react-redux';
import rootReducer from './reducer';

export const store = configureStore({
  reducer: rootReducer,
  //NOTE: flipper와 연결하기 위해
  middleware: getDefaultMiddleware => {
    if (__DEV__) {
      const createDebugger = require('redux-flipper').default;
      return getDefaultMiddleware().concat(createDebugger());
    }
    return getDefaultMiddleware();
  },
});

export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
