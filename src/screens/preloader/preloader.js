import {View, Text, SafeAreaView, Image, I18nManager} from 'react-native';
import React, {useEffect} from 'react';
import styles from '../../style/styles';
import * as CONSTANT from '../../constants/globalConstants';
import {useSelector, useDispatch} from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import * as Animatable from 'react-native-animatable';
import constant from '../../constants/translation';
import {updateSetting} from '../../Redux/SettingSlice';
const preloader = () => {
  const lang = useSelector(state => state.setting.language);
  const dispatch = useDispatch();

  useEffect(() => {
    getSettings();
    getLanguage();
  }, []);
  const getSettings = async () => {
    return fetch(CONSTANT.BaseUrl + 'settings/get_settings', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
      .then(response => response.json())
      .then(responseJson => {
        dispatch(updateSetting(responseJson));
      })
      .catch(error => {
        console.error(error);
      });
  };
  const getLanguage = async () => {
    if (lang == 'en') {
      constant.setLanguage('en');
      I18nManager.forceRTL(false);
    } else if (lang == 'ar') {
      constant.setLanguage('ar');
      I18nManager.forceRTL(true);
    } else {
      constant.setLanguage('en');
      I18nManager.forceRTL(false);
    }
  };

  return (
    <LinearGradient
      // colors={['#fff', '#fff', '#fff']}
      colors={['#4876d4', '#295FCC', '#1c5fe8']}
      style={styles.preloaderMainView}>
        {/* <View
        style={{
          width: 820,
          position:'absolute',
          height: 820,
          bottom:-50,
          borderRadius: 820 / 2,
          backgroundColor: '#4876d4',
        }}
      />
      <View
        style={{
          width: 800,
          position:'absolute',
          height: 800,
          bottom:-50,
          borderRadius: 800 / 2,
          backgroundColor: '#295FCC',
        }}
      />
       <LinearGradient
      // colors={['#fff', '#fff', '#fff']}
      colors={['#1c5fe8', '#295FCC', '#4876d4']}
        style={{
          width: 780,
          position:'absolute',
          height: 780,
          bottom:-50,
          borderRadius: 780 / 2,
          backgroundColor: '#1c5fe8',
        }}
      /> */}
      <Animatable.View
        animation="pulse"
        iterationCount="infinite"
        style={{
          height: 220,
          width: 220,
          borderRadius: 220 / 2,
          backgroundColor: '#FFFFFF40',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <View
          style={{
            height: 200,
            width: 200,
            borderRadius: 200 / 2,
            backgroundColor: '#FFFFFF60',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <View
            style={{
              height: 180,
              width: 180,
              borderRadius: 180 / 2,
              backgroundColor: '#FFFFFF',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Image
              resizeMode="contain"
              style={{width: 130, height: 100}}
              source={require('../../../assets/images/logo.png')}
            />
          </View>
        </View>
      </Animatable.View>
    </LinearGradient>
  );
};

export default preloader;
