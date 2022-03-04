import React, {useCallback} from 'react';
import {Text, TouchableHighlight, View, Pressable} from 'react-native';

import {NavigationContainer, ParamListBase} from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

// NOTE Stack을 부르는것은 그냥 외우자
const Stack = createNativeStackNavigator();

type RootStackParamList = {
  Home: undefined;
  Details: undefined;
};

// NOTE: 해당 type은 react-navigation에서 참조하면 된다.
type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
type DetailsScreenProps = NativeStackScreenProps<ParamListBase, 'Details'>;

function HomeScreen({navigation}: HomeScreenProps) {
  const onClick = useCallback(() => {
    //NOTE: 페이지를 이동시키는 역할로 navigate메서드 인자는 screen의 네임과 동일시 이동합니다.
    navigation.navigate('Details');
  }, [navigation]);

  const goDetail = useCallback(() => {
    navigation.navigate('Details');
  }, [navigation]);

  return (
    <>
      <View
        style={{
          flex: 1,
          backgroundColor: 'yellow',
          alignItems: 'flex-end',
          justifyContent: 'center',
        }}>
        <Pressable
          onPress={onClick}
          style={{
            paddingVertical: 20,
            paddingHorizontal: 20,
            backgroundColor: 'red',
          }}>
          <Text style={{color: 'white'}}>Home Screen</Text>
        </Pressable>
      </View>
      <View
        style={{
          flex: 5,
          backgroundColor: 'blue',
          alignItems: 'flex-start',
          justifyContent: 'center',
        }}>
        <Pressable onPress={goDetail}>
          <Text>Two Screen</Text>
        </Pressable>
      </View>
    </>
  );
}

function DetailsScreen({navigation}: DetailsScreenProps) {
  const onClick = useCallback(() => {
    navigation.navigate('Home');
  }, [navigation]);

  return (
    <>
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        <TouchableHighlight onPress={onClick}>
          <Text>Details Screen</Text>
        </TouchableHighlight>
      </View>
    </>
  );
}

const App = () => {
  return (
    <NavigationContainer>
      {/* NOTE Navigator가 screen을 그룹으로 묶어준다. (page의 묶음) */}
      <Stack.Navigator initialRouteName="Home">
        {/* NOTE screen은 화면(page)이라고 보면 된다. */}
        {/* NOTE: 해당 Screen이 해당 컴포넌트에 props로 navigation과route를 자동으로 전달합니다. */}
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{title: '홈화면'}}
        />
        <Stack.Screen name="Details" component={DetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
