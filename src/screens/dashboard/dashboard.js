import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Alert,
  ImageBackground,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  I18nManager
} from 'react-native';
import React, {useState,useEffect} from 'react';
import styles from '../../style/styles.js';
import Feather from 'react-native-vector-icons/Feather';
import ImagePicker from 'react-native-image-crop-picker';
import {useIsFocused} from '@react-navigation/native';
import axios from 'axios';
import Spinner from 'react-native-loading-spinner-overlay';
import Header from '../../components/Header';
import * as CONSTANT from '../../constants/globalConstants';
import constant from '../../constants/translation';
import {useSelector, useDispatch} from 'react-redux';
import {
  updateToken,
  updateUserInfo,
  updateVisibleProfile,
  updateProfileImage,
} from '../../Redux/AuthSlice';
import FormButton from '../../components/FormButton';

import {VictoryBar, VictoryChart} from 'victory-native';

const Dashboard = ({navigation}) => {
  const userDetail = useSelector(state => state.value.userInfo);
  const settings = useSelector(state => state.setting.settings);
  const profileImage = useSelector(state => state.value.profileImage);
  const token = useSelector(state => state.value.token);
  const isFocused = useIsFocused();
  const dispatch = useDispatch();
  const [image, setImage] = useState(null);
  const [spinner, setSpinner] = useState(false);
  const [loader, setLoader] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hired, setHired] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (isFocused) {
      getDashboardData();
    }
  }, [isFocused]);

  const getDashboardData = () => {
    setLoading(true);
    fetch(CONSTANT.BaseUrl + 'get-profile?post_id=' + userDetail.profile_id, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
    })
      .then(response => response.json())
      .then(responseJson => {
        setHired(responseJson.profile_data.hired_order)
        setTotal(responseJson.profile_data.completed_order)
        setLoading(false);
      })
      .catch(error => {
        setLoading(false);
        console.error(error);
      });
  };

  const switchUser = () => {
    setLoader(true);
    fetch(CONSTANT.BaseUrl + 'switch-user?post_id=' + userDetail.profile_id, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
    })
      .then(response => response.json())
      .then(responseJson => {
        if (responseJson.type == 'success') {
          setLoader(false);
          dispatch(updateToken(responseJson.authToken));
          dispatch(updateUserInfo(responseJson.userdetails));
          dispatch(
            updateVisibleProfile(
              responseJson.userdetails.settings._deactivate_profile,
            ),
          );
          navigation.navigate('home');
        } else if (responseJson.type == 'error') {
          setLoader(false);
          Alert.alert(constant.OopsText, responseJson.message_desc);
        }
      })
      .catch(error => {
        setLoader(false);
        console.error(error);
      });
  };
  const choosePictureFromGallery = async () => {
    ImagePicker.openPicker({
      width: 1200,
      height: 1200,
      mediaType: 'photo',
    }).then(img => {
      setImage(img);
      uploadPhoto(img);
    });
  };

  const uploadPhoto = img => {
    setSpinner(true);
    const formData = new FormData();
    formData.append('post_id', userDetail.profile_id);
    if (img != null) {
      formData.append('profile_image', {
        uri: Platform.OS == 'ios' ? img.sourceURL : img.path,
        type: img.mime,
        name: Platform.OS == 'ios' ? img.filename : 'profileImage',
      });
    }

    fetch(CONSTANT.BaseUrl + 'upload-avatar', {
      method: 'post',
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: 'Bearer ' + token,
      },
      body: formData,
    })
      .then(response => response.json())
      .then(responseJson => {
        setSpinner(false);
        if (responseJson.type == 'success') {
          Alert.alert('Success', responseJson.message);
          dispatch(updateProfileImage(responseJson.avatar));
        } else if (responseJson.type == 'error') {
          Alert.alert('Oops', responseJson.message);
        }
      })
      .catch(error => {
        setSpinner(false);

        console.log(error);
      });
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <Header
        title={constant.dashboardTitle}
        titleColor={'#1C1C1C'}
        backColor={'#F7F7F7'}
        iconColor={'#1C1C1C'}
      />
        {loading && <Spinner visible={true} color={'#000'} />}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.dashboardUserProfile}>
          <View style={{flexDirection: 'row'}}>
            <ImageBackground
              imageStyle={{borderRadius: 70 / 2}}
              style={styles.homefreelancerImageBackgroundStyle}
              source={{
                uri:
                  image != null
                    ? Platform.OS === 'ios'
                      ? image.sourceURL
                      : image.path
                    : profileImage,
              }}>
              <View style={styles.homefreelancerImageEditIconStyle} />
              {spinner && (
                <ActivityIndicator
                  style={{marginLeft: 15}}
                  size="small"
                  color={CONSTANT.primaryColor}
                />
              )}
            </ImageBackground>

            <View style={styles.dashboardUserProfileNameConatiner}>
              <View>
                <Text style={styles.dashboardUserProfileName}>
                  {userDetail.user_name}
                </Text>
              </View>
              <View>
                <Text style={styles.dashboardUserProfileAccount}>
                  {userDetail.user_type == 'sellers' ? constant.Seller : constant.Buyer}
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => choosePictureFromGallery()}
            style={styles.dashboardUserProfileIcon}>
            <Feather name={'camera'} size={18} color={'#1C1C1C'} />
          </TouchableOpacity>
        </View>
        {/* <View style={styles.dashboardTabContainer}>
          <View style={styles.dashboardTabsInner}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Feather name={'message-square'} size={18} color={'#1C1C1C'} />
              <Text style={styles.dashboardTabsText}>
                {constant.dashboardMessages}
              </Text>
            </View>
            <View style={styles.dashboardTabsNotification} />
          </View>
          <View style={{backgroundColor: '#fff', borderRadius: 4}} />
        </View> */}
        {/* <View style={styles.dashboardTabContainer}>
          <View style={[styles.dashboardTabsInner, {flexDirection: 'column'}]}>
            <Text style={styles.dashboardGraphText}>Profile views</Text>
            <View style={{width: '100%'}}>
              <VictoryChart
                // width={""}
                domainPadding={{x: 40}}
                domain={{x: [0, 5], y: [0, 2000]}}>
                <VictoryBar
                  barWidth={10}
                  style={{data: {fill: '#1DA1F2'}}}
                  data={[
                    {x: 1, y: 400},
                    {x: 2, y: 800},
                    {x: 3, y: 1300},
                    {x: 4, y: 700},
                    {x: 5, y: 1000},
                    {x: 6, y: 1600},
                  ]}
                />
              </VictoryChart>
            </View>
          </View>
        </View> */}
        <TouchableOpacity
        activeOpacity={0.8}
        onPress={()=> navigation.navigate("task",{orderType: "hired"})}
        style={[styles.dashboardServicesContainer,{marginTop:15,}]}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <View style={styles.dashboardServices2Rgb}>
              <Feather name={'trending-up'} size={18} color={'#7357FB'} />
            </View>
            <View style={{marginLeft: 15}}>
              <Text style={styles.dashboardServicestext1}> {hired.toString().length == 1 ? "0"+hired : hired}</Text>
              <Text style={styles.dashboardServicestext2}>
                {constant.dashboardPostedServices}
              </Text>
            </View>
          </View>
          <Feather name={I18nManager.isRTL ? 'chevron-left' : 'chevron-right'} size={18} color={'#999999'} />
        </TouchableOpacity>
        <TouchableOpacity
        activeOpacity={0.8}
         onPress={()=> navigation.navigate("task",{orderType: "completed"})}
        style={styles.dashboardServicesContainer}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <View style={styles.dashboardServices3Rgb}>
              <Feather name={'activity'} size={18} color={'#FF6167'} />
            </View>

            <View style={{marginLeft: 15}}>
              <Text style={styles.dashboardServicestext1}>
                {total.toString().length == 1 ? "0"+total : total}
              </Text>
              <Text style={styles.dashboardServicestext2}>
                {constant.dashboardCurrent}
              </Text>
            </View>
          </View>
          <Feather name={I18nManager.isRTL ? 'chevron-left' : 'chevron-right'} size={18} color={'#999999'} />
        </TouchableOpacity>
        {settings.switch_user == "1" &&
          <View style={styles.dashboardFooterParentStyle}>
          <Text style={styles.dashboardFooterMainTextStyle}>
            {constant.dashboardSwitch}
          </Text>
          <Text style={styles.dashboardfooterTaglineTextStyle}>
            {constant.dashboardSwitchText}
          </Text>
          <FormButton
            onPress={() => switchUser()}
            buttonTitle={
              userDetail.user_type == 'sellers'
                ? constant.dashboardBuyerAccount
                :constant.dashboardSellerAccount 
            }
            backgroundColor={'#9B59B6'}
            textColor={'#fff'}
            loader={loader}
          />
        </View>}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Dashboard;
