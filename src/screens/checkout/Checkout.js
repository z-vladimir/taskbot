import {View, Text, SafeAreaView} from 'react-native';
import React , { useEffect } from 'react';
import Header from '../../components/Header';
import styles from '../../style/styles';
import {WebView} from 'react-native-webview';
import constant from '../../constants/translation';

const Checkout = ({navigation,route}) => {
  return (
    <SafeAreaView style={styles.globalContainer}>
      <Header
        title={constant.Checkout}
        titleColor={'#1C1C1C'}
        backColor={'#F7F7F7'}
        iconColor={'#1C1C1C'}
        backIcon={true}
      />
      <WebView source={{uri: route.params.link}} />
    </SafeAreaView>
  );
};

export default Checkout;
