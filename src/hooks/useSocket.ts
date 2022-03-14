import {Config} from 'react-native-config';
import {useCallback} from 'react';
import {io, Socket} from 'socket.io-client';

let socket: Socket | undefined;
//NOTE: () => void는 disconnect의 함수에 대한 타입 리턴값이 없으면 undefined니까 void로 타입지정
const useSocket = (): [Socket | undefined, () => void] => {
  //NOTE: disconnect는 서버와 연결을 끊는 함수
  const disconnect = useCallback(() => {
    if (socket) {
      socket.disconnect();
      socket = undefined;
    }
  }, []);
  if (!socket) {
    socket = io(`${Config.API_URL}`, {
      transports: ['websocket'],
    });
  }

  return [socket, disconnect];
};

// // NOTE: 기본형
// const useSocket = () => {
//   //NOTE: io안에 "서버주소를 넣는다."
//   socket = io(`${Config.API_URL}`, {
//     transports: ['websocket'],
//     path: '', //NOTE: path는 서버개발자와 규약대로
//   });
// };

export default useSocket;
