import {View, FlatList} from 'react-native';
import React, {useCallback} from 'react';
import {useAppDispatch} from '../store';
import {useSelector} from 'react-redux';
import {RootState} from '../store/reducer';
import EachOrder from '../components/EachOrder';
import {Order} from '../slices/order';

export default function Orders() {
  const orders = useSelector((state: RootState) => state.order.orders);

  const orderListItem = useCallback(({item}: {item: Order}) => {
    return <EachOrder item={item} />;
  }, []);

  return (
    <View>
      <FlatList
        //NOTE: FlatList는 자체적인 반복문이 있다.
        data={orders}
        keyExtractor={item => item.orderId}
        renderItem={orderListItem}
      />
    </View>
  );
}
