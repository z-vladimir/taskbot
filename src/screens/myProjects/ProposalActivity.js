import {
  View,
  Text,
  SafeAreaView,
  Dimensions,
  TextInput,
  ScrollView,
  Image,
  FlatList,
  Alert,
  TouchableOpacity,
} from 'react-native';
import React, {useState, useEffect, useRef} from 'react';
import Feather from 'react-native-vector-icons/Feather';
import Header from '../../components/Header';
import {useSelector, useDispatch} from 'react-redux';
import styles from '../../style/styles.js';
import RBSheet from 'react-native-raw-bottom-sheet';
import {useNavigation} from '@react-navigation/native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import axios from 'axios';
import {decode} from 'html-entities';
import constant from '../../constants/translation';
import FormButton from '../../components/FormButton';
import * as CONSTANT from '../../constants/globalConstants';
import Dialog, {
  DialogFooter,
  DialogButton,
  DialogContent,
  DialogTitle,
} from 'react-native-popup-dialog';

const ProposalActivity = ({route, navigation}) => {
  const navigationforword = useNavigation();
  const RBSheetDeclineProposal = useRef();
  const [walletDialoge, setWalletDialoge] = useState(false);
  const [show, setShow] = useState(false);
  const [loader, setLoader] = useState(false);
  const [description, setDescription] = useState('');
  const [selectedKey, setSelectedKey] = useState(null);
  const [freelancersDetails, setFreelancersDetails] = useState([]);
  const token = useSelector(state => state.value.token);
  const userDetail = useSelector(state => state.value.userInfo);
  const wallet = useSelector(state => state.value.wallet);

  let sellerDetails = route.params.item;
  let mainItem = route.params.mainItem;
  let sellerProfileId = sellerDetails.seller_detail.profile_id;
  let mileStoneData = [];

  useEffect(() => {
    getFreelancers();
  }, []);

  const getFreelancers = async () => {
    return fetch(
      CONSTANT.BaseUrl +
        'sellers/get_sellers?type=single&profile_id=' +
        sellerProfileId,
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
        setFreelancersDetails(responseJson);
      })
      .catch(error => {
        console.error(error);
      });
  };
  if (mainItem.proposals[0].hasOwnProperty('milestone')) {
    Object.entries(mainItem.proposals[0].milestone).map(([key, value]) =>
      mileStoneData.push({
        detail: value.detail,
        price: value.price,
        price_format: value.price_format,
        status: value.status,
        title: value.title,
        key: key,
      }),
    );
  }

  const declineProposal = () => {
    setLoader(true);
    axios
      .post(
        CONSTANT.BaseUrl + 'decline-proposal',
        {
          post_id: userDetail.profile_id,
          user_id: userDetail.user_id,
          detail: description,
          proposal_id: sellerDetails.proposal_id,
        },
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        },
      )
      .then(async response => {
        if (response.data.type == 'success') {
          setDescription('');
          Alert.alert(constant.SuccessText, response.data.message_desc);
          navigation.goBack();
        } else if (response.data.type == 'error') {
          setLoader(false);
          Alert.alert(constant.OopsText, response.data.message_desc);
        }
      })
      .catch(error => {
        setLoader(false);
        console.log(error);
      });
  };
  const hireAndPay = val => {
    setLoader(true);
    axios
      .post(
        CONSTANT.BaseUrl + 'order-project',
        {
          post_id: userDetail.profile_id,
          project_id: mainItem.project_id,
          wallet: val,
          key: selectedKey,
          proposal_id: sellerDetails.proposal_id,
        },
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        },
      )
      .then(async response => {
        if (response.data.type == 'success') {
          if (val == true) {
            Alert.alert(constant.SuccessText, response.data.message_desc);
          } else {
            navigation.navigate('checkout', {link: response.data.checkout_url});
          }
        } else if (response.data.type == 'error') {
          setLoader(false);
          Alert.alert(constant.OopsText, response.data.message_desc);
        }
      })
      .catch(error => {
        setLoader(false);
        console.log(error);
      });
  };
  return (
    <SafeAreaView style={styles.globalContainer}>
      <Header
        title={constant.ProposalActivityHeading}
        titleColor={'#1C1C1C'}
        backColor={'#F7F7F7'}
        iconColor={'#1C1C1C'}
        backIcon={true}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{backgroundColor: '#F7F7F7'}}>
        <>
          <View
            style={[styles.ProjectDetailsContainer, {backgroundColor: '#fff'}]}>
            <View
              style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <View style={{flexDirection: 'row'}}>
                {route.params.mainItem.type_text == 'hourly' ? (
                  <View style={styles.empProjectDetailsHourly}>
                    <Text style={styles.ProjectDetailsHourlyText}>
                      {constant.projectActivityHourlyProject}
                    </Text>
                  </View>
                ) : (
                  <View style={[styles.ProjectDetailsFixed, {marginLeft: 0}]}>
                    <Text style={styles.ProjectDetailsFiexdText}>
                      {constant.projectActivityFixedPriceProject}
                    </Text>
                  </View>
                )}
                {route.params.mainItem.is_featured == 'yes' && (
                  <View
                    style={[styles.taskFeaturedBadgeParent, {marginLeft: 10}]}>
                    <Text style={styles.taskFeaturedTextStyle}>
                      {constant.Featured}
                    </Text>
                  </View>
                )}
              </View>
              <View>
                <Feather
                  name={show == false ? 'chevron-down' : 'chevron-up'}
                  size={18}
                  color={'#999999'}
                  style={styles.ProjectDetailsPropertyListIcon}
                  onPress={() => setShow(!show)}
                />
              </View>
            </View>
            <View style={styles.ProjectDetailsTitleConatainer}>
              <Text style={styles.propsalDetailsTitle}>
                {route.params.mainItem.title}
              </Text>
            </View>
            {show && (
              <>
                <View style={styles.empProjectDetailsContainer}>
                  <View style={styles.ProjectDetailsPropertyList}>
                    <Feather
                      name={'calendar'}
                      size={13}
                      color={'#999999'}
                      style={styles.ProjectDetailsPropertyListIcon}
                    />
                    <Text style={styles.ProjectDetailsPropertyListTitle}>
                      {route.params.mainItem.posted_time}
                    </Text>
                  </View>
                  <View style={[styles.ProjectDetailsPropertyList]}>
                    <Feather
                      name={'map-pin'}
                      size={13}
                      color={'#999999'}
                      style={styles.ProjectDetailsPropertyListIcon}
                    />
                    <Text style={styles.ProjectDetailsPropertyListTitle}>
                      {route.params.mainItem.location_text}
                    </Text>
                  </View>
                  <View style={styles.ProjectDetailsPropertyList}>
                    <Feather
                      name={'calendar'}
                      size={13}
                      color={'#999999'}
                      style={styles.ProjectDetailsPropertyListIcon}
                    />
                    <Text style={styles.ProjectDetailsPropertyListTitle}>
                      {route.params.mainItem.expertise_level[0].name}
                    </Text>
                  </View>
                </View>
                <View style={{paddingVertical: 10}}>
                  <FormButton
                    buttonTitle={constant.ProposalActivityViewProposals}
                    backgroundColor={CONSTANT.primaryColor}
                    textColor={'#FFFFFF'}
                    // loader={loader}
                    onPress={() => navigationforword.goBack()}
                  />
                  {/* <FormButton
                    buttonTitle={'Project Activity'}
                    backgroundColor={CONSTANT.primaryColor}
                    textColor={'#FFFFFF'}
                    // loader={loader}
                    onPress={() =>
                      navigationforword.navigate('projectActivity')
                    }
                  />
                  <View
                    style={{
                      backgroundColor: '#F7F7F7',
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingVertical: 10,
                    }}>
                    <Text style={styles.ProjectCardListEidtBtn}>
                      Edit proposal
                    </Text>
                  </View> */}
                </View>
              </>
            )}
          </View>
          <View
            style={{
              borderTopWidth: 1,
              borderColor: '#DDDDDD',
              width: '100%',
            }}
          />
        </>
        <View
          style={[styles.empProppsalActivityView, {backgroundColor: '#fff'}]}>
          <View
            style={{
              paddingHorizontal: 15,
              paddingVertical: 15,
              // alignItems: 'flex-start',
            }}>
            <View style={{flexDirection: 'row'}}>
              <Image
                style={styles.empProjectCardFreelancerImg}
                source={{uri: sellerDetails.seller_detail.avatar}}
              />

              <View
                style={{
                  justifyContent: 'center',
                  paddingHorizontal: 15,
                  // alignItems: 'center',
                  // backgroundColor:"red"
                }}>
                <View style={{}}>
                  <Text style={styles.empProjectFreelancerName}>
                    {sellerDetails.seller_detail.user_name}
                  </Text>
                  {sellerDetails.rating_details.length != 0 && (
                    <View
                      style={{
                        flexDirection: 'row',
                        // paddingVertical: 5,
                        // alignItems: 'center',
                      }}>
                      <Feather name={'star'} size={13} color={'#FCCF14'} />
                      <Text style={styles.empProjectFreelancerRating}>4.5</Text>
                      <Text style={styles.empAllProjectsNo}> (32516)</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>
          <View style={{paddingHorizontal: 15}}>
            <FormButton
              buttonTitle={'View Profile'}
              backgroundColor={'#22C55E'}
              textColor={'#FFFFFF'}
              // loader={loader}

              onPress={() =>
                navigationforword.navigate('profileDetail', {
                  data: freelancersDetails[0],
                })
              }
            />
          </View>
          <>
            <View
              style={{
                borderTopWidth: 1,
                borderColor: '#DDDDDD',
                width: '100%',
              }}
            />
            <View style={styles.empProppsalActivityProfileView}>
              <View>
                <Text style={styles.empProppsalActivityProfileHeading}>
                  {sellerDetails.seller_detail.user_name} {constant.ProposalActivitybudgetWorkingRate}
                </Text>
                <Text style={styles.empProppsalActivityProfileText}>
                  {decode(sellerDetails.proposal_price_formate)}
                </Text>
              </View>
              {/* <View style={{paddingTop: 10}}>
                <Text style={styles.empProppsalActivityProfileHeading}>
                  Raymond’s hourly working rate
                </Text>
                <Text style={styles.empProppsalActivityProfileText}>
                  $1,250/hr
                </Text>
              </View> */}
            </View>
          </>

          <View
            style={{
              borderTopWidth: 1,
              borderColor: '#DDDDDD',
              width: '100%',
            }}
          />
          <View style={styles.empProppsalActivityProfileView}>
            {mainItem.project_meta.is_milestone == 'yes' && (
              <>
                <View>
                  <Text style={styles.empProppsalActivityFAQHeading}>
                    {constant.ProposalActivityOfferedMilestons}
                  </Text>
                  <Text style={styles.empProppsalActivityProfileAns}>
                    {constant.ProposalActivityStartProject}
                  </Text>
                </View>
                <FlatList
                  // style={{marginBottom: 10}}
                  showsVerticalScrollIndicator={false}
                  data={mileStoneData}
                  keyExtractor={(x, i) => i.toString()}
                  renderItem={({item, index}) => (
                    <View style={styles.empProppsalActivityFixedView}>
                      <View style={styles.empProppsalActivityFixed}>
                        <Text style={styles.empProppsalActivityFAQHeading}>
                          {item.title}
                        </Text>
                        <Text style={styles.empProppsalActivityFAQHeading}>
                          {decode(item.price_format)}
                        </Text>
                        <Text style={styles.empProppsalActivityProfileAns}>
                         {constant.ProposalActivityDemoText}
                        </Text>
                        <FormButton
                          buttonTitle={constant.ProposalActivityPayHire}
                          backgroundColor={CONSTANT.primaryColor}
                          textColor={'#FFFFFF'}
                          // loader={loader}
                          // onPress={() => navigationforword.navigate('projectActivity')}
                          onPress={() => {
                            setSelectedKey(item.key);
                            setWalletDialoge(true);
                          }}
                        />
                      </View>
                    </View>
                  )}
                />
              </>
            )}

            {/* <>
            <View>
              <Text style={styles.empProppsalActivityFAQHeading}>
                Are you flexible in working with late night hours?
              </Text>
              <Text style={styles.empProppsalActivityProfileAns}>Yes</Text>
            </View>
            <View>
              <Text style={styles.empProppsalActivityFAQHeading}>
                How much relevant experience do you have?
              </Text>
              <Text style={styles.empProppsalActivityProfileAns}>Yes</Text>
            </View>
            <View>
              <Text style={styles.empProppsalActivityFAQHeading}>
                Upload your resume for detailed review
              </Text>
              <View style={styles.empProppsalActivityResume}>
                <Text style={styles.empProppsalActivityResumeText}>
                  WordPress-logotype-simplified.png
                </Text>
              </View>
            </View>
              </> */}
            <View>
              <Text style={styles.empProppsalActivityFAQHeading}>
                {constant.ProposalActivitySpecialCommentsEmployer}
              </Text>
              <Text style={styles.empProppsalActivityProfileAns}>
                {sellerDetails.proposal_meta.post_content}
              </Text>
            </View>
          </View>
          <View
            style={{
              borderTopWidth: 1,
              borderColor: '#DDDDDD',
              width: '100%',
            }}
          />
          {/* <View
            style={[
              styles.myProjectDetailsLockedView,
              {marginHorizontal: 15, marginTop: 20, marginBottom: 10},
            ]}>
            <View
              style={{
                backgroundColor: '#ffff',
                height: 80,
                width: 80,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 80 / 2,
              }}>
              <Image
                resizeMode="contain"
                style={styles.lockedimg}
                source={require('../../../assets/images/clock.png')}
              />
            </View>

            <Text style={styles.myProjectDetailsLockedHeading}>
              Like this freelancer? Let’s escrow first week paymentto get
              started
            </Text>
            <Text style={styles.myProjectDetailsLockedText}>
              Wait for the employer to activate this week, If your services
              further required for this project.
            </Text>
          </View> */}
          <View style={{paddingVertical: 10, paddingHorizontal: 15}}>
            {sellerDetails.proposal_type == 'fixed' || sellerDetails.proposal_type == '' && (
              <FormButton
                buttonTitle={`${constant.ProposalActivityHire} ${sellerDetails.seller_detail.user_name}`}
                backgroundColor={CONSTANT.primaryColor}
                textColor={'#FFFFFF'}
                // loader={loader}
                onPress={() => {
                  setSelectedKey(null);
                  setWalletDialoge(true);
                }}
              />
            )}
            <TouchableOpacity
              onPress={() => RBSheetDeclineProposal.current.open()}
              style={{
                backgroundColor: '#F7F7F7',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 10,
                marginBottom: 10,
              }}>
              <Text style={styles.ProjectCardListEidtBtn}>
               {constant.ProposalActivityDeclinedProposal}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <RBSheet
        ref={RBSheetDeclineProposal}
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
            <Text
              style={{
                color: CONSTANT.fontColor,
                fontSize: 18,
                lineHeight: 26,
                textAlign: 'left',
                fontFamily: 'Urbanist-Bold',
                width: '95%',
              }}>
              {constant.ProposalActivityAddDeclineReason}
            </Text>
            <Feather
              onPress={() => RBSheetDeclineProposal.current.close()}
              style={styles.RBSheetCloseIconStyle}
              name={'x'}
              size={20}
              color={'#1C1C1C'}
            />
          </View>
          <ScrollView>
            <View style={{marginHorizontal: 15}}>
              <View style={[styles.MultiLineTextFieldView, {height: 170}]}>
                <TextInput
                  style={styles.sendProjectMultiLineTextField}
                  value={description}
                  onChangeText={body => setDescription(body)}
                  placeholder={constant.ProposalActivityEnterDescription}
                  placeholderTextColor="#888888"
                  multiline={true}
                  underlineColorAndroid="transparent"
                />
              </View>
              <FormButton
                buttonTitle={constant.Submit}
                backgroundColor={CONSTANT.primaryColor}
                textColor={'#FFFFFF'}
                loader={loader}
                onPress={() => declineProposal()}
              />
            </View>
          </ScrollView>
        </View>
      </RBSheet>
      <Dialog
        onTouchOutside={() => {
          setWalletDialoge(false);
        }}
        dialogStyle={{
          overflow: 'hidden',
          width: Dimensions.get('window').width / 1.3,
        }}
        // dialogTitle={<DialogTitle title="You can also use wallet" />}
        visible={walletDialoge}
        footer={
          <>
            <DialogFooter
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#22C55E',
                marginHorizontal: 20,
              }}>
              <TouchableOpacity
                onPress={() => hireAndPay(true)}
                style={{flexDirection: 'row', paddingVertical: 10}}>
                <Text
                  style={{
                    color: '#FFFFFF',
                    fontSize: 16,
                    lineHeight: 26,
                    letterSpacing: 0.5,
                    fontFamily: 'Urbanist-Bold',
                  }}>
                  {constant.projectActivityContinueWallet}
                </Text>
              </TouchableOpacity>
            </DialogFooter>
            <DialogFooter
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#F7F7F7',
                marginHorizontal: 20,
                marginVertical: 10,
                borderColor: '#F7F7F7',
              }}>
              <TouchableOpacity
                onPress={() => hireAndPay('')}
                style={{flexDirection: 'row', paddingVertical: 10}}>
                <Text
                  style={{
                    color: '#999999',
                    fontSize: 16,
                    lineHeight: 26,
                    letterSpacing: 0.5,
                    fontFamily: 'Urbanist-Bold',
                  }}>
                  {constant.projectActivityContinueWithoutWallet}
                </Text>
              </TouchableOpacity>
            </DialogFooter>

            <DialogFooter>
              <DialogButton
                textStyle={{
                  fontSize: 15,
                  lineHeight: 24,
                  letterSpacing: 0.5,
                  fontFamily: 'Urbanist-Regular',
                  color: '#1C1C1C',
                }}
                text={'Cancel'}
                onPress={() => {
                  setWalletDialoge(false);
                }}
              />
            </DialogFooter>
          </>
        }>
        <DialogContent>
          <View
            style={{
              flexDirection: 'column',
              marginTop: 15,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <View
              style={{
                width: 50,
                height: 50,
                backgroundColor: '#22C55E20',
                borderRadius: 50 / 2,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 5,
              }}>
              <FontAwesome5 name="bullhorn" color={'#22C55E'} size={20} />
            </View>

            <Text
              style={{
                fontSize: 18,
                lineHeight: 26,
                fontFamily: 'Urbanist-Bold',
                letterSpacing: 0.5,
                color: CONSTANT.fontColor,
                paddingBottom: 5,
              }}>
              {constant.projectActivityYouUseWallet}
            </Text>
            <Text
              style={{
                fontSize: 15,
                lineHeight: 20,
                fontFamily: 'OpenSans-Regular',
                letterSpacing: 0.5,
                color: CONSTANT.fontColor,
                textAlign: 'center',
              }}>
              {constant.projectActivityYouHave}{' '}
              <Text style={{fontFamily: 'OpenSans-Bold'}}>
                {decode(wallet)}
              </Text>{' '}
              {constant.projectActivityTransaction}
            </Text>
          </View>
        </DialogContent>
      </Dialog>
    </SafeAreaView>
  );
};

export default ProposalActivity;
