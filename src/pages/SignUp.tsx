import React, {useCallback, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../App';
import DismissKeyboardView from '../components/DismissKeyboardView';
import axios, {Axios, AxiosError} from 'axios';
import Config from 'react-native-config';

type SignUpScreenProps = NativeStackScreenProps<RootStackParamList, 'SignUp'>;

function SignUp({navigation}: SignUpScreenProps) {
  const [inputText, setInputText] = useState({
    email: '',
    name: '',
    password: '',
  });
  //NOTE: 처음에는 로딩을 없애기위해 false로
  const [loading, setLoading] = useState(false);
  const {email, name, password} = inputText;

  const emailRef = useRef<TextInput | null>(null);
  const nameRef = useRef<TextInput | null>(null);
  const passwordRef = useRef<TextInput | null>(null);

  const onChangeInput = useCallback(
    (t, e) => {
      //NOTE: 애초에 spacebar를 입력하지 못하게 setState안에서 trim()처리를 한다.
      setInputText({...inputText, [t]: e.nativeEvent.text.trim()});
    },
    [inputText],
  );

  //ANCHOR: 기존 레거시 코드
  /*
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');

    const onChangeEmail = useCallback(text => {
      setEmail(text.trim());
    }, []);
    const onChangeName = useCallback(text => {
      setName(text.trim());
    }, []);
    const onChangePassword = useCallback(text => {
      setPassword(text.trim());
    }, []);
  */

  const onSubmit = useCallback(async () => {
    console.log('회원가입 로직-');
    //NOTE: 로딩중인데 한번 더 누르면 return하는 로직
    if (loading) {
      return;
    }
    if (!email || !email.trim()) {
      return Alert.alert('알림', '이메일을 입력해주세요.');
    }
    if (!name || !name.trim()) {
      return Alert.alert('알림', '이름을 입력해주세요.');
    }
    if (!password || !password.trim()) {
      return Alert.alert('알림', '비밀번호를 입력해주세요.');
    }
    if (
      //NOTE: 이메일에 대한 정규 표현식
      !/^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/.test(
        email,
      )
    ) {
      return Alert.alert('알림', '올바른 이메일 주소가 아닙니다.');
    }
    //NOTE: 비밀번호 정규 표현식
    if (!/^(?=.*[A-Za-z])(?=.*[0-9])(?=.*[$@^!%*#?&]).{8,50}$/.test(password)) {
      return Alert.alert(
        '알림',
        '비밀번호는 영문,숫자,특수문자($@^!%*#?&)를 모두 포함하여 8자 이상 입력해야합니다.',
      );
    }
    //NOTE: 요청을 받기 직전에 loadging을 띄우기 위해 true로
    //NOTE: axios.post의 세번째는 부가정보라고 보면 된다.(config)
    try {
      console.log('signUp');
      setLoading(true);
      console.log(Config.API_URL, 'CONFIG주소');
      const response = await axios.post(
        `${Platform.OS === 'android' ? Config.API_URL : Config.IOS_URL}/user`,
        {
          email,
          name,
          password,
        },
      );
      console.log(email, name, password, '회원가입정보');
      console.log(response, 'response');
      Alert.alert('성공!', '회원가입이 완료되었습니다.');
      navigation.push('SignIn');
    } catch (e) {
      const errorResponse = (e as AxiosError).response;
      console.error(errorResponse);
      if (errorResponse) {
        Alert.alert('실패', errorResponse.data.message);
      }
    } finally {
      //NOTE: 요청이 끝나면 로딩을 없애기
      //NOTE: 실패하든 성공하는 무조건 실행되는 것은 finally에 넣으니 로딩값은 finally에서 변경
      setLoading(false);
    }
  }, [navigation, loading, email, name, password]);

  const canGoNext = email && name && password;
  return (
    <DismissKeyboardView>
      <View style={styles.inputWrapper}>
        <Text style={styles.label}>이메일</Text>
        <TextInput
          style={styles.textInput}
          onChange={e => onChangeInput('email', e)}
          placeholder="이메일을 입력해주세요"
          placeholderTextColor="#666"
          textContentType="emailAddress"
          value={email}
          returnKeyType="next"
          clearButtonMode="while-editing"
          ref={emailRef}
          onSubmitEditing={() => nameRef.current?.focus()}
          blurOnSubmit={true}
        />
      </View>
      <View style={styles.inputWrapper}>
        <Text style={styles.label}>이름</Text>
        <TextInput
          style={styles.textInput}
          placeholder="이름을 입력해주세요."
          placeholderTextColor="#666"
          onChange={e => onChangeInput('name', e)}
          value={name}
          textContentType="name"
          returnKeyType="next"
          clearButtonMode="while-editing"
          ref={nameRef}
          onSubmitEditing={() => passwordRef.current?.focus()}
          blurOnSubmit={false}
        />
      </View>
      <View style={styles.inputWrapper}>
        <Text style={styles.label}>비밀번호</Text>
        <TextInput
          style={styles.textInput}
          placeholder="비밀번호를 입력해주세요(영문,숫자,특수문자)"
          placeholderTextColor="#666"
          onChange={e => onChangeInput('password', e)}
          value={password}
          keyboardType={Platform.OS === 'android' ? 'default' : 'ascii-capable'}
          textContentType="password"
          secureTextEntry
          returnKeyType="send"
          clearButtonMode="while-editing"
          ref={passwordRef}
          onSubmitEditing={onSubmit}
        />
      </View>
      <View style={styles.buttonZone}>
        <Pressable
          style={
            canGoNext
              ? StyleSheet.compose(styles.loginButton, styles.loginButtonActive)
              : styles.loginButton
          }
          /*
          NOTE: disabled에 loading을 넣어준다.
          많이 하는 실수 중 회원가입을 한번만 누르는것이 아니기 때문에 로딩중일때 클릭을 막아줘야 한다.
          */
          disabled={!canGoNext || loading}
          onPress={onSubmit}>
          {loading ? (
            <ActivityIndicator color="blue" />
          ) : (
            <Text style={styles.loginButtonText}>회원가입</Text>
          )}
        </Pressable>
      </View>
    </DismissKeyboardView>
  );
}

const styles = StyleSheet.create({
  textInput: {
    padding: 5,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  inputWrapper: {
    padding: 20,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 20,
  },
  buttonZone: {
    alignItems: 'center',
  },
  loginButton: {
    backgroundColor: 'grey',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  loginButtonActive: {
    backgroundColor: '#e2c1c0',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default SignUp;
