import {
  View,
  Text,
  Image,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
  I18nManager,
} from 'react-native';
import React, {useState, useEffect, useRef} from 'react';
import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import * as CONSTANT from '../../constants/globalConstants';
import constant from '../../constants/translation';
import FormButton from '../../components/FormButton';
import {decode} from 'html-entities';
import {useSelector, useDispatch} from 'react-redux';
import RBSheet from 'react-native-raw-bottom-sheet';
import RNRestart from 'react-native-restart';  
import {
  updateStep,
  updatePostedTaskId,
} from '../../Redux/PostTaskSlice';
import FormInput from '../../components/FormInput';
import {useIsFocused} from '@react-navigation/native';
import styles from '../../style/styles';
import {
  updateToken,
  updateUserInfo,
  updateVisibleProfile,
  updateProfileImage,
  updateVerified,
  updateWallet,
} from '../../Redux/AuthSlice';
import Feather from 'react-native-vector-icons/Feather';
import Dialog, {
  DialogFooter,
  DialogButton,
  DialogContent,
} from 'react-native-popup-dialog';
import {updateLanguage} from '../../Redux/SettingSlice';

const customDrawer = ({navigation, props}) => {
  const verify = useSelector(state => state.value.verified);
  const settings = useSelector(state => state.setting.settings);
  const lang = useSelector(state => state.setting.language);
  const userDetail = useSelector(state => state.value.userInfo);
  const wallet = useSelector(state => state.value.wallet);
  const profileImage = useSelector(state => state.value.profileImage);
  const RBSheetAddCredit = useRef();
  const token = useSelector(state => state.value.token);
  const isFocused = useIsFocused();
  const dispatch = useDispatch();
  const [selectedSetting, setSelectedSetting] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedTask, setSelectedTask] = useState('');
  const [dialogVisible, setDialogVisible] = useState(false);
  const [show, setShow] = useState(false);
  const [showProjects, setShowProjects] = useState(false);
  const [showTask, setShowTask] = useState(false);
  const [amount, setAmount] = useState('');
  const [balance, setBalance] = useState('');
  const [loader, setLoader] = useState(false);
  const [loading, setLoading] = useState(false);
  const [spinner, setSpinner] = useState(false);

  useEffect(() => {
    if (isFocused) {
      userBalance();
    }
  }, [isFocused]);
  function isObjectEmpty(object) {
    var isEmpty = true;
    for (keys in object) {
      isEmpty = false;
      break;
    }
    return isEmpty;
  }
  var isEmpty = isObjectEmpty(userDetail);

  const handelSetting = value => {
    switch (value) {
      case 'profile':
        return (
          navigation.navigate('profileSetting'), setSelectedSetting('profile')
        );
      case 'identityInformation':
        return (
          navigation.navigate('identityInformation'),
          setSelectedSetting('identityInformation')
        );
      case 'billingInformation':
        return (
          navigation.navigate('billingInformation'),
          setSelectedSetting('billingInformation')
        );
      case 'accountSetting':
        return (
          navigation.navigate('accountSetting'),
          setSelectedSetting('accountSetting')
        );
      default:
        break;
    }
  };

  const logout = () => {
    dispatch(updateToken(null));
    dispatch(updateUserInfo({}));
    dispatch(updateVisibleProfile(''));
    dispatch(updateProfileImage(''));
    dispatch(updateVerified(''));
    navigation.reset({
      index: 0,
      routes: [{name: 'login'}],
    });
  };

  const userBalance = () => {
    setSpinner(true);
    fetch(CONSTANT.BaseUrl + 'user-balance?post_id=' + userDetail.profile_id, {
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
          dispatch(updateWallet(responseJson.user_balance_formate));
          setSpinner(false);
        }
      })
      .catch(error => {
        setSpinner(false);
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

  const addWallet = () => {
    if (amount != '') {
      setLoading(true);
      fetch(
        CONSTANT.BaseUrl +
          'add-wallet?post_id=' +
          userDetail.profile_id +
          '&amount=' +
          amount,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        },
      )
        .then(response => response.json())
        .then(responseJson => {
          if (responseJson.type == 'success') {
            setLoading(false);
            setAmount('');
            RBSheetAddCredit.current.close();
            navigation.navigate('checkout', {link: responseJson.checkout_url});
            // navigation.navigate('home');
          } else if (responseJson.type == 'error') {
            setLoading(false);
            Alert.alert(constant.OopsText, decode(responseJson.message_desc));
            RBSheetAddCredit.current.close();
          }
        })
        .catch(error => {
          setLoader(false);
          setLoading(false);
          console.error(error);
        });
    } else {
      Alert.alert(constant.OopsText, constant.orderDetailsAlertError);
    }
  };

  const openWallatRbsheet = () => {
    setAmount('');
    RBSheetAddCredit.current.open();
  };

  const changeLanguage = val => {
    dispatch(updateLanguage(val));
    if (val == 'ar') {
      I18nManager.forceRTL(true);
    } else if (val == 'en') {
      I18nManager.forceRTL(false);
    }
    constant.setLanguage(val);

    setTimeout(() => {
      RNRestart.Restart();
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.drawerMainStyle}>
      <View style={styles.drawerUserHeaderParentStyle}>
        <View style={styles.draweruserImageHeaderStyle}>
          <Image
            style={styles.drawerUserImageStyle}
            source={
              isEmpty == true
                ? require('../../../assets/images/PlaceholderImage.png')
                : {uri: profileImage}
            }
          />
        </View>
        <View style={styles.draweruserDetailParentStyle}>
          <Text style={styles.drawerNameStyle}>
            {isEmpty ? constant.customDrawerGuest : userDetail.user_name}
          </Text>
          <View style={{flexDirection: 'row'}}>
            {settings.switch_user == '1' && (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() =>
                  userDetail.user_type == 'sellers'
                    ? switchUser()
                    : userDetail.user_type == 'buyers'
                    ? switchUser()
                    : console.log('NotLogin')
                }>
                <Text style={styles.drawerManageProfileTextStyle}>
                  {isEmpty
                    ? constant.customDrawerGreetings
                    : userDetail.user_type == 'sellers'
                    ? constant.customDrawerSwitchBuyer
                    : constant.customDrawerSwitchSeller}
                </Text>
              </TouchableOpacity>
            )}
            {loader && <ActivityIndicator size="small" color="#1C1C1C" />}
          </View>
        </View>
        <TouchableOpacity
          style={{alignItems: 'center'}}
          onPress={() => setDialogVisible(true)}>
          <Feather
            style={{alignSelf: 'flex-end'}}
            name={'globe'}
            size={22}
            color={'#999999'}
          />
          <Text
            style={{
              fontFamily: 'Urbanist-Regular',
              fontSize: 14,
              lineHeight: 24,
              letterSpacing: 0.5,
              color: CONSTANT.fontColor,
            }}>
            {lang.toUpperCase()}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.drawerSeparatorStyle} />
      {!isEmpty && (
        <View style={styles.drawerWalletContainer}>
          <View style={{flexDirection: 'row'}}>
            <View style={styles.drawerCreditCard}>
              <Feather
                name={'credit-card'}
                size={24}
                color={CONSTANT.primaryColor}
              />
            </View>
            <View style={styles.draweruserDetailParentStyle}>
              <Text style={styles.drawerNameStyle}>
                {constant.customDrawerBalance}
              </Text>
              <View style={{flexDirection: 'row'}}>
                {wallet == '' ? (
                  <ActivityIndicator
                    size="small"
                    color={CONSTANT.primaryColor}
                  />
                ) : (
                  <Text style={styles.drawerCreditBlance}>
                    {decode(wallet)}
                  </Text>
                )}
              </View>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => {
              verify == '1'
                ? openWallatRbsheet()
                : Alert.alert(
                    constant.OopsText,
                    constant.taskDetailsVerificationAccess,
                  );
            }}>
            <Feather
              style={{marginRight: 10}}
              name={'briefcase'}
              size={24}
              color={CONSTANT.primaryColor}
            />
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.drawerSeparatorStyle} />
      <ScrollView showsVerticalScrollIndicator={false}>
        {!isEmpty && (
          <TouchableOpacity
            onPress={() => navigation.navigate('dashboard')}
            style={styles.drawerItemParentStyle}>
            <Feather name={'flag'} size={18} color={'#999999'} />
            <Text style={styles.drawerItemTextStyle}>
              {constant.customDrawerDashboard}
            </Text>
          </TouchableOpacity>
        )}
        {isEmpty && (
          <TouchableOpacity
            onPress={() => navigation.navigate('home')}
            style={styles.drawerItemParentStyle}>
            <Feather name={'home'} size={18} color={'#999999'} />
            <Text style={styles.drawerItemTextStyle}>
              {constant.customDrawerHome}
            </Text>
          </TouchableOpacity>
        )}
        {isEmpty && (
          <TouchableOpacity
            onPress={() => navigation.navigate('signup')}
            style={styles.drawerItemParentStyle}>
            <Feather name={'edit-3'} size={18} color={'#999999'} />
            <Text style={styles.drawerItemTextStyle}>
              {constant.customDrawerSignup}
            </Text>
          </TouchableOpacity>
        )}
        {isEmpty && (
          <TouchableOpacity
            onPress={() => navigation.navigate('login')}
            style={styles.drawerItemParentStyle}>
            <Feather name={'user'} size={18} color={'#999999'} />
            <Text style={styles.drawerItemTextStyle}>
              {constant.customDrawerLogin}
            </Text>
          </TouchableOpacity>
        )}

        {!isEmpty && (
          <TouchableOpacity
            style={styles.drawerItemParentStyle}
            onPress={() => navigation.navigate('home')}>
            <Feather name={'home'} size={18} color={'#999999'} />
            <Text style={styles.drawerItemTextStyle}>
              {constant.customDrawerHome}
            </Text>
          </TouchableOpacity>
        )}

        {!isEmpty && userDetail.user_type != 'buyers' && (
          <TouchableOpacity
            style={styles.drawerItemParentStyle}
            onPress={() => navigation.navigate('earnings')}>
            <Feather name={'dollar-sign'} size={18} color={'#999999'} />
            <Text style={styles.drawerItemTextStyle}>
              {constant.customDrawerEarnings}
            </Text>
          </TouchableOpacity>
        )}

        {!isEmpty && userDetail.user_type == 'buyers' && (
          <TouchableOpacity
            style={styles.drawerItemParentStyle}
            onPress={() => navigation.navigate('task', {orderType: 'any'})}>
            <Feather name={'briefcase'} size={18} color={'#999999'} />
            <Text style={styles.drawerItemTextStyle}>
              {constant.customDrawerManageTasks}
            </Text>
          </TouchableOpacity>
        )}
        {!isEmpty && userDetail.user_type != 'buyers' && (
          <>
            <TouchableOpacity
              onPress={() => {
                setShow(false)
                setShowProjects(false)
                setShowTask(!showTask)}}
              style={[
                styles.drawerItemParentStyle,
                {justifyContent: 'space-between'},
              ]}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <Feather name={'database'} size={18} color={'#999999'} />
                <Text style={styles.drawerItemTextStyle}>
                  {constant.customDrawerManageTasks}
                </Text>
              </View>

              <Feather
                style={{marginRight: 15, width: '10%'}}
                name={showTask ? 'minus' : 'plus'}
                type={showTask ? 'minus' : 'plus'}
                size={18}
                color={'#1C1C1C'}
              />
            </TouchableOpacity>
            {showTask && (
              <View style={styles.drawerSettingConatiner}>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedTask('create');
                    dispatch(updateStep(0));
                    dispatch(updatePostedTaskId(null));
                    navigation.navigate('postTask',{data:null});
                  }}
                  style={styles.drawerSubSettingsContainer}>
                  <View
                    style={[
                      styles.drawerSubSettingsIconStyle,
                      {
                        borderColor:
                          selectedTask == 'create' ? '#22C55E' : '#999',
                        backgroundColor:
                          selectedTask == 'create' ? '#22C55E' : '#fff',
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.drawerItemTextStyle,
                      {
                        color: selectedTask == 'create' ? '#1C1C1C' : '#999',
                      },
                    ]}>
                    {constant.customDrawerCreateTask}
                  </Text>
                </TouchableOpacity>
                <View style={styles.drawerSettingSeprater} />
                <TouchableOpacity
                  onPress={() => {
                    setSelectedTask('list');
                    navigation.navigate('taskListing', {orderType: 'any'});
                  }}
                  style={styles.drawerSubSettingsContainer}>
                  <View
                    style={[
                      styles.drawerSubSettingsIconStyle,
                      {
                        borderColor:
                          selectedTask == 'list' ? '#22C55E' : '#999',
                        backgroundColor:
                          selectedTask == 'list' ? '#22C55E' : '#fff',
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.drawerItemTextStyle,
                      {
                        color: selectedTask == 'list' ? '#1C1C1C' : '#999',
                      },
                    ]}>
                    {constant.customDrawerTaskListings}
                  </Text>
                </TouchableOpacity>
                <View style={styles.drawerSettingSeprater} />
                <TouchableOpacity
                  onPress={() => {
                    setSelectedTask('order');
                    navigation.navigate('task', {orderType: 'any'});
                  }}
                  style={styles.drawerSubSettingsContainer}>
                  <View
                    style={[
                      styles.drawerSubSettingsIconStyle,
                      {
                        borderColor:
                          selectedTask == 'order' ? '#22C55E' : '#999',
                        backgroundColor:
                          selectedTask == 'order' ? '#22C55E' : '#fff',
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.drawerItemTextStyle,
                      {
                        color: selectedTask == 'order' ? '#1C1C1C' : '#999',
                      },
                    ]}>
                    {constant.customDrawerOrders}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        {!isEmpty && (
          <>
            <TouchableOpacity
              onPress={() => {
                setShow(!show)
                setShowProjects(false)
                setShowTask(false)}}
              style={[
                styles.drawerItemParentStyle,
                {justifyContent: 'space-between'},
              ]}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <Feather name={'settings'} size={18} color={'#999999'} />
                <Text style={styles.drawerItemTextStyle}>
                  {constant.customDrawerSettings}
                </Text>
              </View>

              <Feather
                style={{marginRight: 15, width: '10%'}}
                name={show ? 'minus' : 'plus'}
                type={show ? 'minus' : 'plus'}
                size={18}
                color={'#1C1C1C'}
              />
            </TouchableOpacity>
            {show && (
              <View style={styles.drawerSettingConatiner}>
                <TouchableOpacity
                  onPress={() => handelSetting('profile')}
                  style={styles.drawerSubSettingsContainer}>
                  <View
                    style={[
                      styles.drawerSubSettingsIconStyle,
                      {
                        borderColor:
                          selectedSetting == 'profile' ? '#22C55E' : '#999',
                        backgroundColor:
                          selectedSetting == 'profile' ? '#22C55E' : '#fff',
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.drawerItemTextStyle,
                      {
                        color:
                          selectedSetting == 'profile' ? '#1C1C1C' : '#999',
                      },
                    ]}>
                    {constant.customDrawerProfileSettings}
                  </Text>
                </TouchableOpacity>
                {settings.identity_verification == 1 && (
                  <>
                    <View style={styles.drawerSettingSeprater} />
                    <TouchableOpacity
                      onPress={() => handelSetting('identityInformation')}
                      style={styles.drawerSubSettingsContainer}>
                      <View
                        style={[
                          styles.drawerSubSettingsIconStyle,
                          {
                            borderColor:
                              selectedSetting == 'identityInformation'
                                ? '#22C55E'
                                : '#999',
                            backgroundColor:
                              selectedSetting == 'identityInformation'
                                ? '#22C55E'
                                : '#fff',
                          },
                        ]}
                      />
                      <Text
                        style={[
                          styles.drawerItemTextStyle,
                          {
                            color:
                              selectedSetting == 'identityInformation'
                                ? '#1C1C1C'
                                : '#999',
                          },
                        ]}>
                        {constant.customDrawerIdentityVerification}
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
                <View style={styles.drawerSettingSeprater} />
                <TouchableOpacity
                  onPress={() => handelSetting('billingInformation')}
                  style={styles.drawerSubSettingsContainer}>
                  <View
                    style={[
                      styles.drawerSubSettingsIconStyle,
                      {
                        borderColor:
                          selectedSetting == 'billingInformation'
                            ? '#22C55E'
                            : '#999',
                        backgroundColor:
                          selectedSetting == 'billingInformation'
                            ? '#22C55E'
                            : '#fff',
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.drawerItemTextStyle,
                      {
                        color:
                          selectedSetting == 'billingInformation'
                            ? '#1C1C1C'
                            : '#999',
                      },
                    ]}>
                    {constant.customDrawerBillingInformation}
                  </Text>
                </TouchableOpacity>
                <View style={styles.drawerSettingSeprater} />
                <TouchableOpacity
                  onPress={() => handelSetting('accountSetting')}
                  style={styles.drawerSubSettingsContainer}>
                  <View
                    style={[
                      styles.drawerSubSettingsIconStyle,
                      {
                        borderColor:
                          selectedSetting == 'accountSetting'
                            ? '#22C55E'
                            : '#999',
                        backgroundColor:
                          selectedSetting == 'accountSetting'
                            ? '#22C55E'
                            : '#fff',
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.drawerItemTextStyle,
                      {
                        color:
                          selectedSetting == 'accountSetting'
                            ? '#1C1C1C'
                            : '#999',
                      },
                    ]}>
                    {constant.customDrawerAccountSettings}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        {!isEmpty && (
          <TouchableOpacity
            style={styles.drawerItemParentStyle}
            onPress={() => navigation.navigate('disputes')}>
            <Feather name={'refresh-cw'} size={18} color={'#999999'} />
            <Text style={styles.drawerItemTextStyle}>
              {constant.customDrawerDisputes}
            </Text>
          </TouchableOpacity>
        )}

        {!isEmpty && (
          <TouchableOpacity
            style={styles.drawerItemParentStyle}
            onPress={() => navigation.navigate('invoice')}>
            <Feather name={'shopping-bag'} size={18} color={'#999999'} />
            <Text style={styles.drawerItemTextStyle}>
              {constant.customDrawerInvoices}
            </Text>
          </TouchableOpacity>
        )}

        {!isEmpty && (
          <TouchableOpacity
            style={styles.drawerItemParentStyle}
            onPress={() => navigation.navigate('savedItem')}>
            <Feather name={'heart'} size={18} color={'#999999'} />
            <Text style={styles.drawerItemTextStyle}>
              {constant.customDrawerSavedItems}
            </Text>
          </TouchableOpacity>
        )}
        {!isEmpty && (
          <>
            <TouchableOpacity
              onPress={() => {
                setShowProjects(!showProjects)
                setShow(false)
                setShowTask(false)}}
              style={[
                styles.drawerItemParentStyle,
                {justifyContent: 'space-between'},
              ]}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <Feather name={'database'} size={18} color={'#999999'} />
                <Text style={styles.drawerItemTextStyle}>
                  {constant.customDrawerManageProjects}
                </Text>
              </View>

              <Feather
                style={{marginRight: 15, width: '10%'}}
                name={showProjects ? 'minus' : 'plus'}
                type={showProjects ? 'minus' : 'plus'}
                size={18}
                color={'#1C1C1C'}
              />
            </TouchableOpacity>
            {showProjects && (
              <View style={styles.drawerSettingConatiner}>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedProject('create');
                    userDetail.user_type == 'sellers'
                      ? navigation.navigate('projectListing', {
                          text: '',
                          min: '',
                          max: '',
                          location: '',
                          skills: [],
                          expert: [],
                          category: '',
                          languages: [],
                          showSkills: true,
                          showMoreDetails: true,
                        })
                      : navigation.navigate('postProjectType');
                  }}
                  style={styles.drawerSubSettingsContainer}>
                  <View
                    style={[
                      styles.drawerSubSettingsIconStyle,
                      {
                        borderColor:
                          selectedProject == 'create' ? '#22C55E' : '#999',
                        backgroundColor:
                          selectedProject == 'create' ? '#22C55E' : '#fff',
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.drawerItemTextStyle,
                      {
                        color: selectedProject == 'create' ? '#1C1C1C' : '#999',
                      },
                    ]}>
                    {userDetail.user_type == 'sellers'
                      ? constant.customDrawerExploreProjects
                      : constant.customDrawerCreateProjects}
                  </Text>
                </TouchableOpacity>
                <View style={styles.drawerSettingSeprater} />
                <TouchableOpacity
                  onPress={() => {
                    setSelectedProject('all');
                    navigation.navigate('myProjectListing');
                  }}
                  style={styles.drawerSubSettingsContainer}>
                  <View
                    style={[
                      styles.drawerSubSettingsIconStyle,
                      {
                        borderColor:
                          selectedProject == 'all' ? '#22C55E' : '#999',
                        backgroundColor:
                          selectedProject == 'all' ? '#22C55E' : '#fff',
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.drawerItemTextStyle,
                      {
                        color: selectedProject == 'all' ? '#1C1C1C' : '#999',
                      },
                    ]}>
                    {constant.customDrawerProjects}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
        {/* {!isEmpty && (
          <TouchableOpacity
            style={styles.drawerItemParentStyle}
            onPress={() =>
              navigation.navigate('projectListing', {
                text: '',
                min: '',
                max: '',
                location: '',
                skills: [],
                expert: [],
                category: '',
                languages: [],
                showSkills: true,
                showMoreDetails: true,
              })
            }>
            <Feather name={'heart'} size={18} color={'#999999'} />
            <Text style={styles.drawerItemTextStyle}>
              {constant.customDrawerExploreProjects}ll
            </Text>
          </TouchableOpacity>
        )} */}

        {/* {!isEmpty && (
          <TouchableOpacity
            style={styles.drawerItemParentStyle}
            onPress={() => navigation.navigate('sampleProjectDetails')}>
            <Feather name={'heart'} size={18} color={'#999999'} />
            <Text style={styles.drawerItemTextStyle}>
              {constant.customDrawerProjectsDetails}
            </Text>
          </TouchableOpacity>
        )} */}
        {/* {!isEmpty && (
          <TouchableOpacity
            style={styles.drawerItemParentStyle}
            onPress={() => navigation.navigate('myProjectListing')}>
            <Feather name={'heart'} size={18} color={'#999999'} />
            <Text style={styles.drawerItemTextStyle}>
              {constant.customDrawerEmpProjects}
            </Text>
          </TouchableOpacity>
        )} */}
      </ScrollView>

      {!isEmpty && (
        <TouchableOpacity
          style={styles.drawerLogoutParentStyle}
          onPress={() => logout()}>
          <Feather name={'power'} size={18} color={'#EF4444'} />
          <Text style={styles.drawerLogoutTextStyle}>
            {constant.customDrawerLogout}
          </Text>
        </TouchableOpacity>
      )}
      <RBSheet
        ref={RBSheetAddCredit}
        height={Dimensions.get('window').height * 0.5}
        duration={250}
        customStyles={{
          container: {
            paddingVertical: 15,
            paddingHorizontal: 15,
            backgroundColor: 'transparent',
          },
        }}>
        <View style={styles.RBSheetParentStyleTwo}>
          <View style={styles.RBSheetheaderStyleTwo}>
            <Text style={styles.RBSheetHeaderTextStyle}>
              {constant.customDrawerAddCredit}
            </Text>
            <Feather
              onPress={() => RBSheetAddCredit.current.close()}
              style={styles.RBSheetCloseIconStyle}
              name={'x'}
              size={20}
              color={'#1C1C1C'}
            />
          </View>

          <ScrollView
            style={{marginHorizontal:15, paddingVertical: 10}}
            showsVerticalScrollIndicator={false}>
            <FormInput
              labelValue={amount}
              onChangeText={val => setAmount(val)}
              inputType={'numeric'}
              placeholderText={constant.orderDetailsEnterAmount}
            />
            <FormButton
              onPress={() => addWallet()}
              buttonTitle={constant.orderDetailsAddFund}
              backgroundColor={CONSTANT.primaryColor}
              iconName={'arrow-right'}
              textColor={'#fff'}
              loader={loading}
            />
            <View style={styles.RbSheetAddCreditDescConatainer}>
              <Text style={styles.RbSheetAddCreditAsterisk}>*</Text>
              <Text style={styles.RbSheetAddCreditDescription}>
                {constant.customDrawerWoocommerce}
              </Text>
            </View>
          </ScrollView>
        </View>
      </RBSheet>
      <Dialog
        dialogStyle={{
          marginHorizontal: 20,
          backgroundColor: '#fff',
          width: '80%',
        }}
        visible={dialogVisible}
        onTouchOutside={() => {
          setDialogVisible(false);
        }}
        footer={
          <DialogFooter>
            <DialogButton
              textStyle={{fontSize: 15, fontWeight: '700', color: '#000'}}
              text={constant.customDrawerCancel}
              onPress={() => setDialogVisible(false)}
            />
          </DialogFooter>
        }>
        <DialogContent>
          <View style={{paddingVertical: 10}}>
            <Text
              style={{
                fontSize: 20,
                fontFamily: 'Urbanist-SemiBold',
                marginVertical: 10,
                color: '#000',
                textAlign: 'left',
              }}>
              {constant.customDrawerSelectLanguage}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => changeLanguage('en')}
            style={{
              marginTop: 5,
              marginBottom: 10,
              borderRadius: 5,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 10,
            }}>
            <Text
              style={{
                fontFamily: 'Urbanist-SemiBold',
                fontSize: 16,
                lineHeight: 26,
                letterSpacing: 0.5,
                color: CONSTANT.fontColor,
              }}>
              English
            </Text>

            {lang == 'en' && (
              <Feather name="check" size={19} color={CONSTANT.primaryColor} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => changeLanguage('ar')}
            style={{
              marginTop: 5,
              marginBottom: 10,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 10,
            }}>
            <Text
              style={{
                fontFamily: 'Urbanist-SemiBold',
                fontSize: 16,
                lineHeight: 26,
                letterSpacing: 0.5,
                color: CONSTANT.fontColor,
              }}>
              عربي
            </Text>

            {lang == 'ar' && (
              <Feather name="check" size={19} color={CONSTANT.primaryColor} />
            )}
          </TouchableOpacity>
        </DialogContent>
      </Dialog>
    </SafeAreaView>
  );
};

export default customDrawer;
