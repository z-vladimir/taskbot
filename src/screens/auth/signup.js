import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import React, {useState} from 'react';
import FormInput from '../../components/FormInput';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import styles from '../../style/styles';
import FormButton from '../../components/FormButton';
import axios from 'axios';
import * as CONSTANT from '../../constants/globalConstants';
import constant from '../../constants/translation';
import Spinner from 'react-native-loading-spinner-overlay';
import {useSelector, useDispatch} from 'react-redux';
import {
  updateToken,
  updateUserInfo,
  updateVisibleProfile,
} from '../../Redux/AuthSlice';
const Signup = ({navigation}) => {
  const token = useSelector(state => state.value.token);
  const userDetail = useSelector(state => state.value.userInfo);
  const dispatch = useDispatch();
  const [disable, setDisable] = useState(false);
  const [text, setText] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [userName, setUserName] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userType, setUserType] = useState('sellers');
  const [email, setEmail] = useState('');
  const [signUp, setSignUp] = useState({});
  const [refresh, setRefresh] = useState(false);
  const [loader, setLoader] = useState(false);

  const signUpHandel = () => {
    setRefresh(true);

    var signupArray = {
      first_name: firstName,
      last_name: lastName,
      user_name: userName,
      user_email: email,
      user_password: userPassword,
      user_type: userType,
      user_agree_terms: disable ? 'on' : 'off',
    };
    if ((firstName != '' && lastName != '' && userName != '', email != '')) {
      setLoader(true);
      axios
        .post(CONSTANT.BaseUrl + 'signup', {
          user_registration: signupArray,
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
            navigation.navigate('home');
            Alert.alert('Success', response.data.message_desc);
            setLoader(false);
          } else if (response.data.type == 'error') {
            setLoader(false);
            Alert.alert(constant.OopsText, response.data.message_desc);
          }
        })
        .catch(error => {
          setLoader(false);
          console.log(error);
        });
    } else {
      Alert.alert(constant.OopsText, constant.signupAlertError);
    }
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
      {loader && <Spinner visible={true} color={'#000'} />}
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
          <Text style={styles.signupIconText}>
            {constant.signupWelcomeText}
          </Text>
        </View>
        <View style={{paddingHorizontal: 10}}>
          <Text style={styles.authText}>{constant.signupJoinUs}</Text>

          <FormInput
            labelValue={firstName}
            onChangeText={text => setFirstName(text)}
            placeholderText={constant.signupFirstName}
            autoCorrect={false}
          />
          <FormInput
            labelValue={lastName}
            onChangeText={text => setLastName(text)}
            placeholderText={constant.signupLastName}
            autoCorrect={false}
          />
          <FormInput
            labelValue={userName}
            onChangeText={text => setUserName(text)}
            placeholderText={constant.signupUserName}
            autoCorrect={false}
          />
          <FormInput
            labelValue={email}
            onChangeText={text => setEmail(text)}
            placeholderText={constant.signupEmailAddress}
            autoCorrect={false}
          />
          <FormInput
            labelValue={userPassword}
            onChangeText={text => setUserPassword(text)}
            placeholderText={constant.signupPassword}
            autoCorrect={false}
            secure={true}
          />
          <TouchableOpacity
            onPress={() => setDisable(!disable)}
            style={styles.checkBoxMainView}>
            {disable ? (
              <View style={styles.checkBoxCheck}>
                <FontAwesome
                  name="check"
                  type="check"
                  color={'#fff'}
                  size={14}
                />
              </View>
            ) : (
              <View style={styles.checkBoxUncheck} />
            )}
            <View style={{flexDirection: 'row'}}>
              <Text style={styles.signupTermsAndConditionText}>
                {constant.signupAgree}
              </Text>
              <Text style={styles.signupTermsAndConditionTextLast}>
                {constant.signupTerms}
              </Text>
            </View>
          </TouchableOpacity>
          <FormButton
            buttonTitle={constant.signupNow}
            backgroundColor={CONSTANT.primaryColor}
            textColor={'#fff'}
            onPress={() => signUpHandel()}
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
              {constant.signupLoginGoogle}
            </Text>
          </TouchableOpacity> */}
        </View>
      </ScrollView>
      <View style={styles.authLastSectionStyle}>
        <View>
          <Text
            onPress={() => navigation.navigate('login')}
            style={styles.authLastSectionTextStyle}>
            {constant.signupToday}
          </Text>
        </View>
        <View>
          <Text
            //onPress={() => navigation.navigate('lostPassword')}
            style={styles.authLastSectionTextStyle}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Signup;
