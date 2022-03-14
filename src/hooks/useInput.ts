import {useState} from 'react';

function useInput(initText) {
  const [test, setText] = useState(initText);
}
export default useInput;
