import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TextInput,
  Switch,
  Alert,
  ActivityIndicator
} from 'react-native';
import React, {useState, useEffect} from 'react';
import Header from '../../components/Header';
import FormInput from '../../components/FormInput';
import FormButton from '../../components/FormButton';
import MultiSelect from 'react-native-multiple-select';
import styles from '../../style/styles';
import {useSelector, useDispatch} from 'react-redux';
import Feather from 'react-native-vector-icons/Feather';
import Spinner from 'react-native-loading-spinner-overlay';
import RBSheet from 'react-native-raw-bottom-sheet';
import {updateToken, updateUserInfo,updateVisibleProfile} from '../../Redux/AuthSlice';
import * as CONSTANT from '../../constants/globalConstants';
import constant from '../../constants/translation';
import axios from 'axios';

const AccountSetting = ({navigation}) => {
  const userDetail = useSelector(state => state.value.userInfo);
  const visibleProfile = useSelector(state => state.value.visibleProfile);
  const settings = useSelector(state => state.setting.settings);
  const token = useSelector(state => state.value.token);
  const dispatch = useDispatch();
  const [deactivateText, setdeactivateText] = useState('');
  const [description, setDescription] = useState('');
  const [removeReason, setRemoveReason] = useState([]);
  const [selectedReason, setSelectedReason] = useState('');
  const [loader, setLoader] = useState(false);
  const [spinner, setSpinner] = useState(false);
  const [spinnerDeactivate, setSpinnerDeactivate] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setRemoveReason(settings.remove_account_reasons);
    getDeactivateSetting();
    if (visibleProfile == 'off') {
      setVisible(false);
    } else {
      setVisible(true);
    }
  }, []);

 
  const getDeactivateSetting = async () => {
    return fetch(
      CONSTANT.BaseUrl + 'settings/get_options?type=privacy_settigs',
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      },
    )
      .then(response => response.json())
      .then(responseJson => {
        if (userDetail.user_type == 'sellers') {
          setdeactivateText(responseJson.sellers._deactivate_profile);
        } else if (userDetail.user_type == 'buyers') {
          setdeactivateText(responseJson.buyers._deactivate_profile);
        }
      })
      .catch(error => {
        console.error(error);
      });
  };

  const toggleSwitch = () => {
    setVisible(previousState => !previousState);
  };

  const saveAccountSetting = () => {
  setLoader(true)
    axios
    .post(
      CONSTANT.BaseUrl + 'update-privacy',
      {
        post_id: userDetail.profile_id,
        _deactivate_profile: visible == true ?  "on" : "off",
      },
      {
        headers: {
          Authorization: 'Bearer ' + token,
        },
      },
    )
    .then(async response => {
      if (response.data.type == 'success') {
        Alert.alert(constant.SuccessText, response.data.message_desc);
       dispatch(updateVisibleProfile( visible == true ?  "on" : "off"))
        setLoader(false);
      } else if (response.data.type == 'error') {
        Alert.alert(constant.OopsText, response.data.message_desc);
        setLoader(false);
      }
    })
    .catch(error => {
      setLoader(false);
      console.log(error);
    });
  }

  const deactiveAccount = () => {
    // setRefresh(true)
    setSpinnerDeactivate(true)
    axios
      .post(
        CONSTANT.BaseUrl + 'update-account',
        {
          post_id: userDetail.profile_id,
          type: 'deactive_account',
          reason: selectedReason[0],
          details: description 
        },
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        },
      )
      .then(async response => {
        if (response.data.type == 'success') {
          dispatch(updateToken(null));
          dispatch(updateUserInfo({}));
          dispatch(updateVisibleProfile(""))
          navigation.navigate('login');
          setSpinnerDeactivate(false);
        } else if (response.data.type == 'error') {
          setSpinnerDeactivate(false);
        }
      })
      .catch(error => {
        setSpinnerDeactivate(false);
        console.log(error);
      });
  };

  return (
    <SafeAreaView style={styles.accountSettingParent}>
      <Header
        title={constant.accountSettingTitle}
        titleColor={'#1C1C1C'}
        backColor={'#F7F7F7'}
        iconColor={'#1C1C1C'}
        backIcon={true}
      />
      {spinner && <Spinner visible={true} color={'#000'} />}
      <ScrollView>
        <View style={styles.accountLostPasswordParentStyle}>
          <Text
            style={[
              styles.profileSettingDropDownHeadingStyle,
              {marginLeft: 0},
            ]}>
           {constant.accountSettingLostPassword}
          </Text>
          <View style={styles.photoSettingparent}>
            <Text style={styles.photoSettingTextStyle}>{deactivateText}</Text>
            <Switch
              style={{
                transform: [{scaleX: 0.8}, {scaleY: 0.8}],
              }}
              trackColor={{false: '#DDDDDD', true: '#22C55E'}}
              thumbColor={'#fff'}
              ios_backgroundColor={'#DDDDDD'}
              onValueChange={toggleSwitch}
              value={visible}
            />
          </View>
          {/* <View style={styles.disableAccountParentStyle}>
            <Text style={styles.disableAccountTextStyle}>
              Disable account temporarily
            </Text>
            <Switch
              style={{
                transform: [{scaleX: 0.8}, {scaleY: 0.8}],
              }}
              trackColor={{false: '#DDDDDD', true: '#22C55E'}}
              thumbColor={'#fff'}
              ios_backgroundColor={'#DDDDDD'}
              //onValueChange={toggleSwitch}
              value={true}
            />
          </View> */}
          <View style={{paddingBottom: 10, marginTop: 10}}>
            <FormButton
              buttonTitle={constant.accountSettingUpdate}
              backgroundColor={CONSTANT.primaryColor}
              textColor={'#FFFFFF'}
              loader={loader}
              onPress={() => saveAccountSetting()}
            />
            <Text style={[styles.eduRBDescStyle,{textAlign:"center"}]}>
              {constant.accountSettingLatestChange}
            </Text>
          </View>
        </View>

        <View style={styles.deactivateAccountParent}>
          <Text
            style={[
              styles.profileSettingDropDownHeadingStyle,
              {marginLeft: 0},
            ]}>
          {constant.accountSettingDeactivate}
          </Text>

          <Text
            style={[
              styles.profileSettingDropDownHeadingStyle,
              {marginLeft: 0, fontFamily: 'Urbanist-Regular'},
            ]}>
            {constant.accountSettingReason}
          </Text>
          <View
            style={styles.accountSettingReasonStyle}>
            <MultiSelect
              fontSize={16}
              onSelectedItemsChange={value => setSelectedReason(value)}
              uniqueKey="key"
              items={removeReason}
              selectedItems={selectedReason}
              borderBottomWidth={0}
              single={true}
              searchInputPlaceholderText={constant.accountSettingPlaceholderText}
              selectText={constant.accountSettingPlaceholderText}
              styleMainWrapper={styles.multiSlectstyleMainWrapper}
              styleDropdownMenuSubsection={
                styles.multiSlectstyleDropdownMenuSubsection
              }
              styleListContainer={{
                maxHeight: 150,
              }}
              onChangeInput={text => console.log(text)}
              displayKey="val"
              submitButtonText={constant.Submit}
            />
          </View>

          <View style={{height: 170, marginVertical: 10, width: '100%'}}>
            <View style={styles.MultiLineTextFieldView}>
              <TextInput
                style={styles.MultiLineTextField}
                value={description}
                onChangeText={body => setDescription(body)}
                placeholder={constant.accountSettingDescription}
                placeholderTextColor="#888888"
                multiline={true}
                underlineColorAndroid="transparent"
              />
            </View>
          </View>
          <View style={{paddingBottom: 10, marginTop: 10}}>
            <FormButton
              buttonTitle={constant.accountSettingDeactivateBtn}
              backgroundColor={'#EF4444'}
              textColor={'#FFFFFF'}
              loader={spinnerDeactivate}
              onPress={() => deactiveAccount()}
            />
            <Text style={styles.eduRBDescStyle}>
             {constant.accountSettingPermanentlyDeactivate}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AccountSetting;
