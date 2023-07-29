import React, {useState, useEffect} from 'react';
import {StyleSheet, Text, View, ImageBackground, Platform} from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo';
import styles from '../../style/styles';

const ImagePreview = ({route, navigation}) => {
  const [data, setData] = useState([]);

  return (
    <View style={{flex: 1}}>
      <ImageBackground
        resizeMode={'contain'}
        style={styles.imagePreviewImage}
        source={{
          uri: route.params.imageData,
        }}>
        <View style={styles.imagePreviewCross}>
          <Entypo
            onPress={() => navigation.goBack()}
            name="cross"
            type="cross"
            color={'#fff'}
            size={32}
          />
        </View>
      </ImageBackground>
    </View>
  );
};

export default ImagePreview;
