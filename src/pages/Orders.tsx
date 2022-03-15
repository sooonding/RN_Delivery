import {Text, SafeAreaView, Pressable, StyleSheet, View} from 'react-native';
import React, {useCallback} from 'react';
import {useAppDispatch} from '../store';
import orderSlice from '../slices/order';
import {useSelector} from 'react-redux';
import {RootState} from '../store/reducer';

export default function Orders() {
  const dispatch = useAppDispatch();
  const selector = useSelector((state: RootState) => {
    return state.order.orders;
  });

  return (
    <SafeAreaView>
      {/* {selector && selector ? (
        selector.map(el => {
          const {orderId} = el;
          return (
            <View>
              <Text>{orderId}</Text>
            </View>
          );
        })
      ) : (
        <View>
          <Text>order 내용이 없습니다.</Text>
        </View>
      )} */}
      <Text>Orders</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  orderWrapper: {
    alignItems: 'center',
  },
  orderButton: {
    backgroundColor: 'red',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  orderText: {
    color: 'white',
  },
});
