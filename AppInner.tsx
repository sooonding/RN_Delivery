import {View, Text, Alert} from 'react-native';
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
      console.log(data, 'DATAAAA'); // 주문데이터
      dispatch(orderSlice.actions.addOrder(data));
    };
    if (socket && isLoggedIn) {
      console.log(socket);
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
  }, [isLoggedIn, socket]);

  useEffect(() => {
    if (!isLoggedIn) {
      console.log('!isLogged', !isLoggedIn);
      disconnect();
    }
  }, [isLoggedIn, disconnect]);

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
          `${Config.API_URL}/refreshToken`,
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


  // useEffect(() => {
  //   const callback = (data: any) => {
  //     console.log(data);
  //     dispatch(orderSlice.actions.addOrder(data));
  //   };
  //   if (socket && isLoggedIn) {
  //     socket.emit('acceptOrder', 'hello');
  //     socket.on('order', callback);
  //   }
  //   return () => {
  //     if (socket) {
  //       socket.off('order', callback);
  //     }
  //   };
  // }, [dispatch, isLoggedIn, socket]);

  // useEffect(() => {
  //   if (!isLoggedIn) {
  //     console.log('!isLoggedIn', !isLoggedIn);
  //     disconnect();
  //   }
  // }, [isLoggedIn, disconnect]);

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
