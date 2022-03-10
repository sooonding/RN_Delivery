import React from 'react';
import {Provider} from 'react-redux';
import {store} from './src/store';
import AppInner from './AppInner';

//NOTE: LogggedIn과 RootStack을 나눈 이유는 각각의 성질이 다르기 떄문에(로그인과 비로그인)

export type LoggedInParamList = {
  Orders: undefined;
  Settings: undefined; //NOTE: 정산화면
  Delivery: undefined; //NOTE: 배달(지도화면)
  Complete: {orderId: string}; //NOTE: parameter칸(무엇을 완료하였는지에 대한 정보)
};

export type RootStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
};

const App = () => {
  return (
    <Provider store={store}>
      <AppInner />
    </Provider>
  );
};

export default App;
