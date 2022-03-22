import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import orderSlice, {Order} from '../slices/order';
import {useDispatch, useSelector} from 'react-redux';
import {useAppDispatch} from '../store/index';
import axios, {AxiosError} from 'axios';
import Config from 'react-native-config';
import {RootState} from '../store/reducer';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {LoggedInParamList} from '../../App';
import NaverMapView, {Marker, Path, Polyline} from 'react-native-nmap';

interface Props {
  item: Order;
}

const EachOrder = ({item}: Props) => {
  const [detail, setDetail] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NavigationProp<LoggedInParamList>>();
  //NOTE: 로그인 이후에는 accessToken을 가져와서 헤더에 넣어줘야 한다.
  const accessToken = useSelector((state: RootState) => state.user.accessToken);
  const toggleDetail = useCallback(() => {
    setDetail(prev => !prev);
  }, []);

  const {start, end} = item;

  const orderAccept = useCallback(async () => {
    if (!accessToken) {
      return;
    }
    //NOTE: 이미 수락이 된 경우도 있으니 서버 확인을 해준다.
    try {
      await axios.post(
        `${Config.API_URL}/accept`,
        {
          orderId: item.orderId,
        },
        {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        },
      );
      dispatch(orderSlice.actions.acceptOrder(item.orderId));
      setLoading(true);
      navigation.navigate('Delivery');
    } catch (e) {
      let errorResponse = (e as AxiosError).response;
      console.log(errorResponse, 'errorResponseerrorResponse');
      if (errorResponse?.status === 400) {
        //NOTE: 다른사람이 했다라면 에러
        Alert.alert('실패', errorResponse.data.message);
        dispatch(orderSlice.actions.rejectOrder(item.orderId));
      }
      setLoading(true);
    } finally {
      setLoading(false);
    }
  }, [dispatch, item, accessToken, navigation]);

  //NOTE: cancel 오더
  const orderReject = useCallback(() => {
    dispatch(orderSlice.actions.rejectOrder(item.orderId));
  }, [dispatch, item]);

  return (
    <View style={styles.orderContainer}>
      <Pressable style={styles.orderButton} onPress={toggleDetail}>
        <Text style={styles.orderButtonText}>
          {item.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}원
        </Text>
        <Text>압구정</Text>
        <Text>왕십리</Text>
      </Pressable>
      {/* NOTE: 상세보기를 위한 로직 */}
      {detail ? (
        <View>
          <View>
            {/* 
            NOTE: 네이버맵이 들어갈 장소 
            Dimensions은 화면 너비를 구하기 위해서 사용
            */}
            <View
              style={{
                width: Dimensions.get('window').width - 30,
                height: 200,
                marginTop: 10,
              }}>
              <NaverMapView
                style={{width: '100%', height: '100%'}}
                zoomControl={false}
                center={{
                  zoom: 10,
                  tilt: 50,
                  latitude: (start.latitude + end.latitude) / 2,
                  longitude: (start.longitude + end.longitude) / 2,
                }}>
                <Marker
                  coordinate={{
                    latitude: start.latitude,
                    longitude: start.longitude,
                  }}
                  pinColor="red"
                />
                <Path
                  width={5}
                  outlineColor="white"
                  color="pink"
                  coordinates={[
                    {
                      latitude: start.latitude,
                      longitude: start.longitude,
                    },
                    {latitude: end.latitude, longitude: end.longitude},
                  ]}
                />
                <Polyline
                  coordinates={[
                    {
                      latitude: start.latitude,
                      longitude: start.longitude,
                    },
                    {latitude: end.latitude, longitude: end.longitude},
                  ]}
                  strokeColor="blue"
                />
                <Marker
                  coordinate={{
                    latitude: end.latitude,
                    longitude: end.longitude,
                  }}
                />
              </NaverMapView>
            </View>
          </View>
          <View style={styles.buttonWrapper}>
            <Pressable
              onPress={orderAccept}
              disabled={loading}
              style={styles.acceptButton}>
              <Text style={styles.buttonText}>수락</Text>
            </Pressable>
            <Pressable onPress={orderReject} style={styles.rejectButton}>
              <Text style={styles.buttonText}>거절</Text>
            </Pressable>
          </View>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  orderContainer: {
    backgroundColor: '#82c4f8',
    margin: 5,
    padding: 10,
    borderRadius: 5,
  },
  orderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  orderButtonText: {
    // flex: 1,
    color: 'white',
    fontWeight: '600',
    fontSize: 17,
  },

  buttonWrapper: {
    flexDirection: 'row',
  },

  acceptButton: {
    backgroundColor: '#4cb5ab',
    flex: 1,
    alignItems: 'center',
    borderBottomLeftRadius: 5,
    borderTopLeftRadius: 5,
  },
  rejectButton: {
    backgroundColor: '#b54c56',
    flex: 1,
    alignItems: 'center',
    borderBottomRightRadius: 5,
    borderTopRightRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
    padding: 15,
  },
});

export default EachOrder;
