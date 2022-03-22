import {createSlice, PayloadAction} from '@reduxjs/toolkit';

//NOTE 말로 어떤것을 할건지 먼저 표현해보자!

export interface Order {
  orderId: string;
  start: {
    latitude: number;
    longitude: number;
  };

  end: {
    latitude: number;
    longitude: number;
  };
  price: number;
}

//NOTE: initialState의 type
interface InitialState {
  orders: Order[];
  deliveries: Order[];
}

export const initialState: InitialState = {
  //NOTE: typescript는 빈배열을 싫어해요!(뭐가 들어갈지 몰라서)
  orders: [], //서버로 실시간으로 오는 주문을 저장,
  deliveries: [], //오더중에 실제로 배달하는 데이터 저장(주문 수락)
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    //NOTE: payload는 Order라는 뜻을 명시
    addOrder(state, action: PayloadAction<Order>) {
      state.orders.push(action.payload);
    },

    acceptOrder(state, action: PayloadAction<string>) {
      const filterIndex = state.orders.findIndex(
        el => el.orderId === action.payload,
      );
      // NOTE 값이 없다면 -1을 반환하니 아니니까 해당 값이 있다라는 내용이 성립된다.
      //NOTE:  filterIndex > -1 ===  state.order.includes(action.payload)
      if (filterIndex > -1) {
        state.deliveries.push(state.orders[filterIndex]);
        state.orders.splice(filterIndex, 1);

        //NOTE: splice로 하기 싫다면
        // state.deliveries = state.orders.filter(
        //   el => el.orderId === action.payload,
        // );
        // state.orders = state.orders.filter(el => el.orderId !== action.payload);
      }
    },
    rejectOrder(state, action: PayloadAction<string>) {
      const rejectOrderId = state.orders.findIndex(
        el => el.orderId === action.payload,
      );
      if (rejectOrderId > -1) {
        state.orders.splice(rejectOrderId, 1);
      }
      const rejectDeliveryId = state.deliveries.findIndex(
        el => el.orderId === action.payload,
      );
      if (rejectDeliveryId > -1) {
        state.deliveries.splice(rejectDeliveryId, 1);
      }
    },
  },
  extraReducers: builder => {},
});

export default orderSlice;
