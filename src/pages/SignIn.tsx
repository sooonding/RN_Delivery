import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import React, {useCallback, useRef, useState} from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../App';
import axios, {AxiosError} from 'axios';
import Config from 'react-native-config';

import userSlice from '../slices/user';
import {useAppDispatch} from '../store';
import EncryptedStorage from 'react-native-encrypted-storage';

//ANCHOR: page이동과 type 지정을 위한 로직
type SignInProps = NativeStackScreenProps<RootStackParamList, 'SignUp'>;
export default function SignIn({navigation}: SignInProps) {
  const [inputText, setInputText] = useState({
    email: '',
    password: '',
  });

  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const {email, password} = inputText;
  const canGoNext = email && password;

  //NOTE: Ref(): 해당 dom을 직접적으로 알려줌
  const emailRef = useRef<TextInput | null>(null);
  const passwordRef = useRef<TextInput | null>(null);

  //ANCHOR: 로그인 로직
  const onSubmit = useCallback(async () => {
    if (loading) {
      return;
    }
    console.log('login Logic start!');
    const pattern = /\s/g; //NOTE: 공백 체크 정규표현식 - 탭, 스페이스

    //NOTE: 확인을 할 때는 항상 검증 로직을 추가하자
    if (!email || email.match(pattern) || !email.trim()) {
      return Alert.alert('경고!', '이메일을 입력하세요!');
    }
    if (!password || !password.trim()) {
      return Alert.alert('경고!', '비밀번호를 입력하세요!');
    }
    try {
      console.log(email, password, 'login try!');
      setLoading(true);
      const response = await axios.post(
        `${Platform.OS === 'android' ? Config.API_URL : Config.IOS_URL}/login`,
        {
          email,
          password,
        },
      );
      console.log(response, 'RESPONSE');
      Alert.alert('로그인', '로그인 되었습니다.');
      dispatch(
        userSlice.actions.setUser({
          name: response.data.data.name,
          email: response.data.data.email,
          accessToken: response.data.data.accessToken, //NOTE 유효기간 5분,10분,1시간
        }),
      );
      await EncryptedStorage.setItem(
        'refreshToken',
        response.data.data.refreshToken,
      );
    } catch (error) {
      const errorResponse = (error as AxiosError).response;
      if (errorResponse) {
        Alert.alert('로그인 실패', errorResponse.data.message);
      }
    } finally {
      setLoading(false);
    }
  }, [dispatch, loading, email, password]);

  const onTextInput = (naming, e) => {
    setInputText({...inputText, [naming]: e.nativeEvent.text});
  };

  //ANCHOR: 회원가입 이동 로직
  const goSignUp = useCallback(() => {
    //NOTE: 기존에 type을 분리해서 추론이 가능하다.(타입지정에 따라 다른 타입은 에러가 난다.)
    navigation.navigate('SignUp');
  }, [navigation]);

  return (
    <View>
      <View style={styles.inputWrapper}>
        <Text style={styles.labelStyle}>이메일</Text>
        <TextInput
          style={styles.inputStyle}
          onChange={e => onTextInput('email', e)}
          placeholder="이메일을 입력해주세요"
          value={email}
          autoComplete="email"
          textContentType="password"
          //NOTE: importantForAutofill은 android에서 사용하며, 자동완성의 기능
          importantForAutofill="yes"
          returnKeyType="next" //NOTE: 기존 return키를 "다음"으로 변경
          keyboardType="email-address" //NOTE: 값에 따른 키보드의 타입을 변경
          ref={emailRef}
          onSubmitEditing={() => passwordRef.current?.focus()}
          clearButtonMode="while-editing"
        />
      </View>
      <View style={styles.inputWrapper}>
        <Text style={styles.labelStyle}>비밀번호</Text>
        <TextInput
          secureTextEntry
          style={styles.inputStyle}
          onChange={e => onTextInput('password', e)}
          placeholder="비밀번호를 입력해주세요"
          value={password}
          autoComplete="password"
          textContentType="password"
          importantForAutofill="yes"
          keyboardType="default"
          ref={passwordRef}
        />
      </View>
      <View style={styles.buttonContainer}>
        {/* 
        NOTE: disabled를 true로 추가하면 클릭 비활성화
              email,password의 값의 유무에 따라 스타일 변경
              스타일을 배열로 둬서 여러가지 스타일을 추가할 수 있으며 후자가 우선순위
          */}
        <Pressable onPress={onSubmit} disabled={!canGoNext || loading}>
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text
              style={
                !canGoNext
                  ? styles.buttonSign
                  : [styles.buttonSign, styles.buttonSignActive]
              }>
              로그인
            </Text>
          )}
        </Pressable>
        <Pressable onPress={onSubmit}>
          <Text style={styles.buttonSignUp} onPress={goSignUp}>
            회원가입
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  inputWrapper: {
    padding: 15,
  },
  labelStyle: {
    marginVertical: 15,
    fontWeight: 'bold',
    fontSize: 16,
  },
  inputStyle: {
    //NOTE: StyleSheet.hairlineWidth는 눈에 보이는데 가장 얇은 선이라는 뜻!
    borderBottomWidth: StyleSheet.hairlineWidth,
    padding: 5,
    fontSize: 16,
  },
  buttonContainer: {
    alignItems: 'center',
  },
  buttonSign: {
    backgroundColor: 'grey',
    color: 'white',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    //NOTE: borderRadius의 스타일이 적용되지 않을 경우 아래 코드를 추가
    overflow: 'hidden',
    marginVertical: 12,
    fontSize: 16,
  },
  buttonSignActive: {
    backgroundColor: '#6667AB',
  },
  buttonSignUp: {
    backgroundColor: '#e2c1c0',
    color: 'white',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    overflow: 'hidden',
    fontSize: 16,
  },
});
