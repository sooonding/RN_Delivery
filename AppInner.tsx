import {View, Text, Alert, Platform} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import React, {useEffect} from 'react';

import Delivery from './src/pages/Delivery';
import Settings from './src/pages/Settings';
import SignIn from './src/pages/SignIn';
import SignUp from './src/pages/SignUp';
import Orders from './src/pages/Orders';
import {RootState} from './src/store/reducer';
import {useSelector} from 'react-redux';
import useSocket from './src/hooks/useSocket';
import {useAppDispatch} from './src/store';

import EncryptedStorage from 'react-native-encrypted-storage';
import axios, {AxiosError} from 'axios';
import Config from 'react-native-config';
import userSlice from './src/slices/user';
import orderSlice from './src/slices/order';
import usePermissions from './src/hooks/usePermissions';

export default function AppInner() {
  const isLoggedIn = useSelector((state: RootState) => {
    return !!state.user.email;
  });

  //NOTE: 커스텀훅 사용
  const [socket, disconnect] = useSocket();
  const Tab = createBottomTabNavigator();
  const Stack = createNativeStackNavigator();

  const dispatch = useAppDispatch();

  //NOTE: socket.io는 ex: 'userinfo', {name:'hello'}(userinfo라는 키로 name이 hello라는 값을 보낸다.)
  useEffect(() => {
    //NOTE flow: 서버로부터 데이터를 받으면(socket.on) 그 데이터를 dispatch
    const callbackHello = (data: any) => {
      dispatch(orderSlice.actions.addOrder(data));
    };
    if (socket && isLoggedIn) {
      /*
      NOTE: 서버에게 데이터를 보내는게 emit / 서버에서 데이터를 받는게 on / 서버에서 받는걸 끊는게 off
      emit login을 해야만 on을 할 수 있는 flow
      */
      socket.emit('acceptOrder', 'hello');
      socket.on('order', callbackHello);
    }
    //NOTE: useEffect return은 cleanup
    return () => {
      if (socket) {
        socket.off('order', callbackHello);
      }
    };
  }, [isLoggedIn, socket, dispatch]);

  useEffect(() => {
    if (!isLoggedIn) {
      disconnect();
    }
  }, [isLoggedIn, disconnect]);

  //NOTE: 앱 권한 설정을 위한 커스텀 함수 로직
  usePermissions();

  //NOTE: 앱 실행 시 토큰 있으면 로그인하는 코드
  useEffect(() => {
    // useEffect는 async가 되지 않기 때문에 async 함수를 만든다.
    const getTokenAndRefresh = async () => {
      try {
        const token = await EncryptedStorage.getItem('refreshToken');
        if (!token) {
          return;
        }
        const response = await axios.post(
          `${
            Platform.OS === 'android' ? Config.API_URL : Config.IOS_URL
          }/refreshToken`,
          {},
          {
            headers: {
              authorization: `Bearer ${token}`,
            },
          },
        );
        dispatch(
          userSlice.actions.setUser({
            name: response.data.data.name,
            email: response.data.data.email,
            accessToken: response.data.data.accessToken,
          }),
        );
      } catch (e) {
        console.log(e);
        if ((e as AxiosError).response?.data.code === 'expired') {
          Alert.alert('경고!', '다시 로그인 해주세요');
        }
      } finally {
        //TODO 스플래시 스크린을 없애는 자리
      }
    };
    getTokenAndRefresh();
  }, [dispatch]);

  useEffect(() => {
    /* NOTE
    request use 는 요청을 보낼 떄
    - 보통 로컬 스토리지나 리플레쉬토큰을 가져올 때
    */

    /* 첫번째 인자는:성공 두번째는:에러 */
    axios.interceptors.response.use(
      response => {
        return response;
      },
      async error => {
        //NOTE 419에러 이후 다시 accept에 대한 요청을 보내야 하는데 원래의 요청에 대한 정보는 error.config에 있다.

        const {
          config,
          response: {status},
        } = error;

        if (status === 419) {
          if (error.response.data.code === 'expired') {
            const originRequest = config;
            const refreshToken = await EncryptedStorage.getItem('refreshToken');
            // 토큰 refresh 요청
            const {data} = await axios.post(
              `${
                Platform.OS === 'android' ? Config.API_URL : Config.IOS_URL
              }/refreshToken`,
              {},
              {headers: {authorization: `Bearer ${refreshToken}`}},
            );
            //NOTE: 새로운 토큰을 저장하기 위한 로직
            dispatch(userSlice.actions.setToken(data.data.accessToken));
            //NOTE: 원래의 요청에 헤더의 값을 현재 받아온 데이터의 토큰으로 변경
            originRequest.headers.authorization = `Bearer ${data.data.accessToken}`;
            return axios(originRequest);
          }
        }
        //NOTE: 419에러 이외의 에러처리
        return Promise.reject(error);
      },
    );
  }, [dispatch]);

  return (
    <NavigationContainer>
      {isLoggedIn && isLoggedIn ? (
        <Tab.Navigator>
          <Tab.Screen
            name="Orders"
            component={Orders}
            options={{title: '주문 목록'}}
          />
          <Tab.Screen
            name="Delivery"
            component={Delivery}
            options={{headerShown: false}}
          />
          <Tab.Screen
            name="Settings"
            component={Settings}
            options={{title: '설정'}}
          />
        </Tab.Navigator>
      ) : (
        <Stack.Navigator>
          <Stack.Screen
            name="SignIn"
            component={SignIn}
            options={{title: '로그인'}}
          />
          <Stack.Screen
            name="SignUp"
            component={SignUp}
            options={{title: '회원가입'}}
          />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
