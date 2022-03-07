import {Pressable, Text, View} from 'react-native';
import React, {useState} from 'react';

function Settings() {
  const [num, setNum] = useState(0);
  return (
    <View>
      <Pressable onPress={() => setNum(prev => prev + 1)}>
        <Text>{num}</Text>
      </Pressable>
    </View>
  );
}

export default Settings;
