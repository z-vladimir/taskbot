import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import React, {useState} from 'react';
import FormInput from '../../components/FormInput';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import styles from '../../style/styles';
import * as CONSTANT from '../../constants/globalConstants';
import constant from '../../constants/translation';
import FormButton from '../../components/FormButton';

const LostPassword = ({navigation}) => {
  const [email, setEmail] = useState('');
  const getEmail = async () => {
    return fetch(CONSTANT.BaseUrl + 'get-password?email=' + email, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
      .then(response => response.json())
      .then(responseJson => {
        if (responseJson.type == 'success') {
          Alert.alert('Success', responseJson.message_desc);
          navigation.navigate('login');
        }
      })
      .catch(error => {
        console.error(error);
      });
  };
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.authIconContainer}>
          <View style={{width: '100%'}}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => navigation.navigate('home')}>
              <Text style={styles.authIconSkipBtn}>{constant.Skip}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.authAppIconStyleOne}>
            <View style={styles.authAppIconStyleTwo}>
              <View style={styles.authAppIconStyleThree}>
                <Image
                  resizeMode="contain"
                  style={{width: 70, height: 60}}
                  source={require('../../../assets/images/logo.png')}
                />
              </View>
            </View>
          </View>
          <Text style={[styles.authIconText, {textAlign: 'center'}]}>
            {constant.LWelcomeText}
          </Text>
        </View>
        <View style={{paddingHorizontal: 10}}>
          <Text style={styles.authText}>{constant.lostPasswordText}</Text>

          <FormInput
            labelValue={email}
            onChangeText={text => setEmail(text)}
            placeholderText={constant.lostPasswordAddEmail}
            autoCorrect={false}
          />
          <FormButton
            buttonTitle={constant.lostPasswordLink}
            backgroundColor={CONSTANT.primaryColor}
            textColor={'#fff'}
            iconName={'arrow-right'}
            onPress={() => getEmail()}
          />
          <View style={styles.authOrTextLine}>
            <Text style={styles.authOrText}>
              {constant.lostPasswordAddEmail}
            </Text>
          </View>
          {/* <TouchableOpacity style={styles.authButtonGoogleButtonStyle}>
            <Image
              resizeMode="contain"
              style={styles.authGoogleImageStyle}
              source={require('../../../assets/images/GoogleIcon.png')}
            />
            <Text style={styles.authGoogleTextStyle}>
              {constant.lostPasswordGoogle}
            </Text>
          </TouchableOpacity> */}
        </View>
      </ScrollView>
      <View style={styles.authLastSectionStyle}>
        <View>
          <Text
            onPress={() => navigation.navigate('signup')}
            style={styles.authLastSectionTextStyle}>
            {constant.lostPasswordJoinToday}
          </Text>
        </View>
        <View>
          <Text
            onPress={() => navigation.navigate('login')}
            style={styles.authLastSectionTextStyle}>
            {constant.lostPasswordSignIn}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default LostPassword;
