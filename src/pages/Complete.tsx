import {
  Alert,
  Dimensions,
  Image,
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
    console.log(response.width, response.height, response.exif, 'OPEN');
    setPreview({uri: `data:${response.mime};base64,${response.data}`});
    const orientation = (response.exif as any)?.Orientation;
    console.log('orientation', orientation);
    return ImageResizer.createResizedImage(
      response.path,
      600,
      600,
      response.mime.includes('jpeg') ? 'JPEG' : 'PNG',
      100,
      0,
    ).then(r => {
      console.log(r.uri, r.name);

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
          }>
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
