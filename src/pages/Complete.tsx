import {
  Alert,
  Dimensions,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useCallback, useState} from 'react';
import {useAppDispatch} from '../store';
import {
  NavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {LoggedInParamList} from '../../App';
import {useSelector} from 'react-redux';
import {RootState} from '../store/reducer';
import {SafeAreaView} from 'react-native-safe-area-context';
import ImageResizer from 'react-native-image-resizer';
import ImagePicker from 'react-native-image-crop-picker';
import axios, {AxiosError} from 'axios';
import Config from 'react-native-config';
import orderSlice from '../slices/order';

//TODO disable랑 로딩 로직 짜기

export default function Complete() {
  const dispatch = useAppDispatch();
  const route = useRoute<RouteProp<LoggedInParamList>>();
  const navigation = useNavigation<NavigationProp<LoggedInParamList>>();
  const [image, setImage] =
    useState<{uri: string; name: string; type: string}>();
  const [preview, setPreview] = useState<{uri: string}>();
  const accessToken = useSelector((state: RootState) => state.user.accessToken);
  const orderId = route.params?.orderId;

  const onResponse = useCallback(async response => {
    setPreview({uri: `data:${response.mime};base64,${response.data}`});
    //exif의Orientation은 핸드폰을 어떤 방향에서 찍었는가
    const orientation = (response.exif as any)?.Orientation;

    return ImageResizer.createResizedImage(
      response.path, // 파일의 경로(실제 파일 경로)
      600,
      600,
      response.mime.includes('jpeg') ? 'JPEG' : 'PNG',
      100,
      0,
    ).then(r => {
      setImage({
        uri: r.uri,
        name: r.name,
        type: response.mime,
      });
    });
  }, []);

  const onChangeFile = useCallback(() => {
    return ImagePicker.openPicker({
      includeExif: true,
      includeBase64: true,
      mediaType: 'photo',
    })
      .then(onResponse)
      .catch(console.log);
  }, [onResponse]);

  const onTakePhoto = useCallback(() => {
    console.log('이미지 촬영 클릭!');
    return ImagePicker.openCamera({
      width: 300,
      height: 400,
      includeBase64: true, //NOTE: 미리보기 표시를 위함
      includeExif: true, //NOTE: 핸드폰 위치 방향
      // cropping: true,
      // saveToPhotos: true,
    })
      .then(onResponse)
      .catch(console.log);
  }, [onResponse]);

  /* NOTE: web에서는 img src='경로', native에서는 source={{uri: '경로'}}
   */

  const onComplete = useCallback(async () => {
    if (!image) {
      Alert.alert('경고', '이미지가 없습니다. 이미지를 업로드해주세요');
      return;
    }
    if (!orderId) {
      Alert.alert('알림', '유효한 주문이 아닙니다.');
      return;
    }
    const formData = new FormData();
    formData.append('image', image);
    formData.append('orderId', orderId);
    try {
      await axios.post(
        `${
          Platform.OS === 'android' ? Config.API_URL : Config.IOS_URL
        }/complete`,
        formData,
        {
          headers: {authorization: `Bearer ${accessToken}`},
        },
      );
      Alert.alert('완료', '완료처리 되었습니다.');
      //NOTE: 바로 navigate를 이용하여 화면으로 이동하지 않고 뒤로 가는 이유는?
      // => 뒤로가는걸 해주지 않으면 완료된 화면이 유지되서 (완료 화면을 없애기 위함)
      navigation.goBack();
      navigation.navigate('Settings');
      dispatch(orderSlice.actions.rejectOrder(orderId));
    } catch (e) {
      const errorResponse = (e as AxiosError).response;
      if (errorResponse) {
        Alert.alert('알림', errorResponse.data.message);
      }
    }
  }, [orderId, image, navigation, dispatch, accessToken]);

  return (
    <SafeAreaView>
      <View style={styles.orderId}>
        <Text style={styles.orderIdText}>주문번호: {orderId}</Text>
      </View>
      <View style={styles.preview}>
        {preview && <Image style={styles.previewImage} source={preview} />}
      </View>
      <View style={styles.buttonWrapper}>
        <Pressable style={styles.button} onPress={onTakePhoto}>
          <Text style={styles.buttonText}>이미지 촬영</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={onChangeFile}>
          <Text style={styles.buttonText}>이미지 선택</Text>
        </Pressable>
        <Pressable
          style={
            image
              ? styles.button
              : StyleSheet.compose(styles.button, styles.buttonDisabled)
          }
          onPress={onComplete}>
          <Text style={styles.buttonText}>완료</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  orderId: {
    margin: 15,
  },
  orderIdText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6667AB',
  },
  preview: {
    marginHorizontal: 10,
    width: Dimensions.get('window').width - 20,
    height: Dimensions.get('window').height / 3,
    backgroundColor: 'rgba(62, 62, 62, 0.3)',
    marginBottom: 10,
  },
  previewImage: {
    height: Dimensions.get('window').height / 3,
    resizeMode: 'contain', //NOTE:
  },
  buttonWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 10,
  },
  button: {
    width: 110,
    fontSize: 18,
    alignItems: 'center',
    backgroundColor: '#e2c1c0',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 5,
    marginVertical: 5,
  },
  buttonText: {
    color: 'white',
  },
  buttonDisabled: {
    backgroundColor: '#6667AB',
  },
});
