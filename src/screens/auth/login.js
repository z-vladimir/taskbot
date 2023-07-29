import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  Image,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import React, {useState, useRef} from 'react';
import FormInput from '../../components/FormInput';
import FormButton from '../../components/FormButton';
import styles from '../../style/styles';
import Feather from 'react-native-vector-icons/Feather';
import RBSheet from 'react-native-raw-bottom-sheet';
import {useSelector, useDispatch} from 'react-redux';
import Spinner from 'react-native-loading-spinner-overlay';
import axios from 'axios';
import * as CONSTANT from '../../constants/globalConstants';
import constant from '../../constants/translation';
import {
  updateToken,
  updateUserInfo,
  updateVisibleProfile,
  updateProfileImage,
  updateVerified,
} from '../../Redux/AuthSlice';

const Login = ({navigation}) => {
  const RBSheetRestoreAccount = useRef();
  const token = useSelector(state => state.value.token);
  const userDetail = useSelector(state => state.value.userInfo);
  const dispatch = useDispatch();

  const [email, setEmail] = useState('');
  const [password, SetPassword] = useState('');
  const [remember, SetRemember] = useState(false);
  const [emailValid, setEmailValid] = useState(false);
  const [loader, setLoader] = useState(false);
  const [spinner, setSpinner] = useState(false);

  const login = () => {
    if (email != '' && password != '') {
      setSpinner(true);
      axios
        .post(CONSTANT.BaseUrl + 'user-login', {
          username: email,
          userpassword: password,
        })
        .then(async response => {
          if (response.data.type == 'success') {
            dispatch(updateToken(response.data.authToken));
            dispatch(updateUserInfo(response.data.userdetails));
            dispatch(
              updateVisibleProfile(
                response.data.userdetails.settings._deactivate_profile,
              ),
            );
            dispatch(updateProfileImage(response.data.userdetails.avatar));
            dispatch(
              updateVerified(response.data.userdetails.identity_verified),
            );
            if (response.data.userdetails.deactive_account == '1') {
              RBSheetRestoreAccount.current.open();
            } else {
              navigation.reset({
                index: 0,
                routes: [{name: 'home'}],
              });
            }

            setSpinner(false);
          } else if (response.data.type == 'error') {
            setSpinner(false);
            Alert.alert(constant.OopsText, constant.loginAlertError);
          }
        })
        .catch(error => {
          setSpinner(false);
          console.log(error);
        });
    } else {
      Alert.alert('Oops', 'Must enter data');
    }
  };

  const activeAccount = () => {
    setLoader(true);
    axios
      .post(
        CONSTANT.BaseUrl + 'update-account',
        {
          post_id: userDetail.profile_id,
          type: 'active_account',
        },
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        },
      )
      .then(async response => {
        if (response.data.type == 'success') {
          setLoader(false);
          navigation.navigate('home');
          RBSheetRestoreAccount.current.close();
        } else if (response.data.type == 'error') {
          setLoader(false);
        }
      })
      .catch(error => {
        setLoader(false);
        console.log(error);
      });
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
      {spinner && <Spinner visible={true} color={'#000'} />}
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
          <Text
            style={styles.authIconText}
            // onPress={() => {
            //   RBSheetRestoreAccount.current.open();
            // }}
            >
            {constant.loginWelcomeText}
          </Text>
        </View>
        <View style={{paddingHorizontal: 10}}>
          <Text style={styles.authText}>{constant.loginNowText}</Text>

          <FormInput
            labelValue={email}
            onChangeText={userEmail => setEmail(userEmail)}
            placeholderText={constant.loginEmailPalceHolder}
            autoCorrect={false}
          />
          <FormInput
            labelValue={password}
            onChangeText={text => SetPassword(text)}
            placeholderText={constant.loginPasswordPlaceHolder}
            autoCorrect={false}
            secure={true}
          />
          <FormButton
            buttonTitle={constant.loginNowText}
            backgroundColor={CONSTANT.primaryColor}
            textColor={'#fff'}
            onPress={() => login()}
          />
          {/* <View style={styles.authOrTextLine}>
            <Text style={styles.authOrText}>{constant.Or}</Text>
          </View> */}
          {/* <TouchableOpacity style={styles.authButtonGoogleButtonStyle}>
            <Image
              resizeMode="contain"
              style={styles.authGoogleImageStyle}
              source={require('../../../assets/images/GoogleIcon.png')}
            />
            <Text style={styles.authGoogleTextStyle}>
              {constant.loginGoogle}
            </Text>
          </TouchableOpacity> */}
        </View>
      </ScrollView>
      <View style={styles.authLastSectionStyle}>
        <View>
          <Text
            onPress={() => navigation.navigate('signup')}
            style={styles.authLastSectionTextStyle}>
            {constant.loginJoinUs}
          </Text>
        </View>
        <View>
          <Text
            onPress={() => navigation.navigate('lostPassword')}
            style={styles.authLastSectionTextStyle}>
            {constant.loginLost}
          </Text>
        </View>
      </View>
      <RBSheet
        ref={RBSheetRestoreAccount}
        closeOnPressBack={false}
        height={Dimensions.get('window').height * 0.6}
        duration={250}
        customStyles={{
          container: {
            padding: 15,
            backgroundColor: 'transparent',
          },
        }}>
        <View style={styles.loginRBsheetStyle}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.loginRBSheetStatusView}>
              <View
                style={[
                  styles.loginRBSheetStatusIconView,
                  {
                    backgroundColor: '#FF616710',
                  },
                ]}>
                <Feather
                  style={{}}
                  name="slash"
                  type="slash"
                  color={'#FF6167'}
                  size={40}
                />
              </View>
              <Text style={styles.loginRBSheetStatusHeading}>
                {constant.loginDeActive}
              </Text>
              <Text style={styles.loginRBSheetStatusDescription}>
                {constant.loginDeActiveDesc}
              </Text>
              <View style={styles.loginRBSheetStatusButonView}>
                <FormButton
                  buttonTitle={constant.loginRestore}
                  backgroundColor={'#22C55E'}
                  textColor={'#fff'}
                  iconName={'unlock'}
                  loader={loader}
                  onPress={() => activeAccount()}
                />
                <TouchableOpacity
                  style={styles.loginRBSheetStatusCancelButton}
                  onPress={() => RBSheetRestoreAccount.current.close()}>
                  <Text
                    style={styles.loginRBSheetStatusCancelButtonText} //No don't do anything
                  >
                    {constant.loginDontText}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </RBSheet>
    </SafeAreaView>
  );
};

export default Login;
