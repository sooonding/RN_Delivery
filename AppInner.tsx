import {View, Text} from 'react-native';
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

export default function AppInner() {
  const isLoggedIn = useSelector((state: RootState) => {
    return !!state.user.email;
  });

  //NOTE: 커스텀훅 사용
  const [socket, disconnect] = useSocket();
  const Tab = createBottomTabNavigator();
  const Stack = createNativeStackNavigator();

  //NOTE: socket.io는 ex: 'userinfo', {name:'hello'}(userinfo라는 키로 name이 hello라는 값을 보낸다.)
  useEffect(() => {
    const callbackHello = (data: any) => {
      console.log(data, 'DATAAAA');
    };
    if (socket && isLoggedIn) {
      console.log(socket);
      /*
      NOTE: 서버에게 데이터를 보내는게 emit / 서버에서 데이터를 받는게 on / 서버에서 받는걸 끊는게 off
      emit login을 해야만 on을 할 수 있는 flow
      */
      socket.emit('login', 'hello');
      socket.on('hello', callbackHello);
    }
    //NOTE: useEffect return은 cleanup
    return () => {
      if (socket) {
        socket.off('hello', callbackHello);
      }
    };
  }, [isLoggedIn, socket]);

  useEffect(() => {
    if (!isLoggedIn) {
      console.log('!isLogged', !isLoggedIn);
      disconnect();
    }
  }, [isLoggedIn, disconnect]);

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
