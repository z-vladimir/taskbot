import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  Image,
  Platform,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Alert,
} from 'react-native';
import React, {useState, useEffect, useRef} from 'react';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Header from '../../components/Header';
import styles from '../../style/styles.js';
import * as CONSTANT from '../../constants/globalConstants';
import {useSelector, useDispatch} from 'react-redux';
import RNFetchBlob from 'rn-fetch-blob';
import Spinner from 'react-native-loading-spinner-overlay';
import {ScrollView} from 'react-native-gesture-handler';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import {decode} from 'html-entities';
import axios from 'axios';
import RBSheet from 'react-native-raw-bottom-sheet';
import constant from '../../constants/translation';
import ProjectListinCard from './projectListingCard';
import FormInput from '../../components/FormInput';
import FormButton from '../../components/FormButton';

const SendProposal = ({route, navigation}) => {
  const RBSheetCreateMileStone = useRef();
  const settings = useSelector(state => state.setting.settings);
  const token = useSelector(state => state.value.token);
  const userDetail = useSelector(state => state.value.userInfo);
  const proposalData = route.params.data;
  const [emptyTask, setEmptyTask] = useState(false);
  const [rate, setRate] = useState('');
  const [serviceFee, setServiceFee] = useState('0.00');
  const [totalAmount, setTotalAmount] = useState('0.00');
  const [milestonePrice, setMilestonePrice] = useState('');
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [showLoading, setShowLoading] = useState(false);
  const [loader, setLoader] = useState(false);
  const [milestoneDes, setMilestoneDes] = useState('');
  const [comment, setComment] = useState('');
  const [milestonesArray, setMilestonesArray] = useState([]);
  const [refreshList, setRefreshList] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('fixed');
  const [packageIndex, setPackageIndex] = useState(1);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (route.params.edit == true) {
      getProposalData();
    }
  }, []);

  useEffect(() => {
    getAdminShare();
  }, [rate]);

  const getProposalData = async () => {
    // setShowLoading(true);
    return fetch(
      CONSTANT.BaseUrl +
        'get-proposal?post_id=' +
        userDetail.profile_id +
        '&proposal_id=' +
        proposalData.proposal_id +
        '&type=projects_activity',
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
          // setServiceFee(responseJson.admin_shares);
          // setTotalAmount(responseJson.user_shares);
          setServiceFee(responseJson.proposal_data.admin_shares_formate);
          setRate(responseJson.proposal_data.price);
          setTotalAmount(responseJson.proposal_data.seller_shares_formate);
          setComment(responseJson.proposal_data.proposal_meta.post_content);
          setPaymentMethod(responseJson.proposal_data.proposal_type);
          let milestones = [];
          Object.entries(responseJson.proposal_data.milestone).map(
            ([key, value]) => milestones.push(value),
          );
          setMilestonesArray(milestones);
        }

        // setShowLoading(false);
      })
      .catch(error => {
        // setShowLoading(false);
        console.error(error);
      });
  };

  const createMilestones = () => {
    RBSheetCreateMileStone.current.open();
    setMilestonePrice('');
    setMilestoneTitle('');
    setMilestoneDes('');
    setSelectedMilestone(null);
  };
  const addMilestoneData = () => {
    if (milestoneTitle != '' && milestonePrice != '' && milestoneDes != '') {
      if (selectedMilestone == null) {
        milestonesArray.push({
          title: milestoneTitle,
          detail: milestoneDes,
          price: milestonePrice,
          status: '',
        });
      } else {
        milestonesArray[selectedMilestone].title = milestoneTitle;
        milestonesArray[selectedMilestone].detail = milestoneDes;
        milestonesArray[selectedMilestone].price = milestonePrice;
      }
      setRefreshList(!refreshList);
      RBSheetCreateMileStone.current.close();
    }
  };
  const deleteMilestone = index => {
    milestonesArray.splice(index, 1);
    setRefreshList(!refreshList);
  };
  const editMilestone = (item, index) => {
    setSelectedMilestone(index);
    RBSheetCreateMileStone.current.open();
    setMilestoneTitle(item.title);
    setMilestonePrice(item.price);
    setMilestoneDes(item.detail);
  };
  const getAdminShare = async () => {
    setShowLoading(true);
    return fetch(
      CONSTANT.BaseUrl +
        'proposal-price-shares?post_id=' +
        userDetail.profile_id +
        '&price=' +
        rate,
      {
        method: 'POST',
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
          setServiceFee(responseJson.admin_shares);
          setTotalAmount(responseJson.user_shares);
        }

        setShowLoading(false);
      })
      .catch(error => {
        setShowLoading(false);
        // console.error(error);
      });
  };
  const submitProposal = () => {
    let mileStoneObject = {};
    for (let i = 0; i < milestonesArray.length; i++) {
      const string = Math.random().toString(36).substring(2, 12);
      mileStoneObject[string] = milestonesArray[i];
    }
    let finalData = {};
    finalData.price = rate;
    finalData.description = comment;
    finalData.proposal_type = paymentMethod;
    if (paymentMethod == 'milestone') {
      finalData.milestone = mileStoneObject;
    }
    setLoader(true);
    axios
      .post(
        CONSTANT.BaseUrl + 'update-proposal',
        {
          post_id: userDetail.profile_id,
          user_id: userDetail.user_id,
          project_id: proposalData.project_id,
          proposal_id:
            route.params.edit == true ? proposalData.proposal_id : '',
          status: settings.proposal_status,
          data: finalData,
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
  return (
    <SafeAreaView style={styles.globalContainer}>
      <Header
        title={constant.projectDetailsSendProposal}
        titleColor={'#1C1C1C'}
        backColor={'#F7F7F7'}
        iconColor={'#1C1C1C'}
        backIcon={true}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.ProjectDetailsContainer}>
          <View style={{flexDirection: 'row'}}>
            {proposalData.is_featured == 'yes' && (
              <View style={styles.ProjectDetailsFaetured}>
                <Text style={styles.ProjectDetailsFaeturedText}>
                  {constant.Featured}
                </Text>
              </View>
            )}
            {proposalData.project_meta.project_type == 'hourly' && (
              <View style={styles.ProjectDetailsHourly}>
                <Text style={styles.ProjectDetailsHourlyText}>
                  Hourly project
                </Text>
              </View>
            )}
            {proposalData.project_meta.project_type == 'fixed' && (
              <View style={styles.ProjectDetailsFixed}>
                <Text style={styles.ProjectDetailsFiexdText}>
                  {proposalData.type_text}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.ProjectDetailsTitleConatainer}>
            <Text style={styles.ProjectDetailsTitle}>{proposalData.title}</Text>
          </View>
          <View>
            <Text style={styles.ProjectDetailsBudget}>
              {decode(proposalData.project_price)}
            </Text>
          </View>
          {/* <View>
            <Text style={styles.ProjectDetailsEstimetedHours}>
              12 to 16 estimated hours per week
            </Text>
          </View> */}
          <View style={styles.ProjectDetailsPropertyContainer}>
            <View style={styles.ProjectDetailsPropertyList}>
              <Feather
                name={'calendar'}
                size={13}
                color={'#999999'}
                style={styles.ProjectDetailsPropertyListIcon}
              />
              <Text style={styles.ProjectDetailsPropertyListTitle}>
                {proposalData.posted_time}
              </Text>
            </View>
            <View
              style={[styles.ProjectDetailsPropertyList, {paddingLeft: 15}]}>
              <Feather
                name={'map-pin'}
                size={13}
                color={'#999999'}
                style={styles.ProjectDetailsPropertyListIcon}
              />
              <Text style={styles.ProjectDetailsPropertyListTitle}>
                {proposalData.location_text}
              </Text>
            </View>
          </View>
          <FormInput
            labelValue={rate}
            onChangeText={rate => setRate(rate)}
            placeholderText={constant.projectDetailsWorkingRate}
            inputType={'number-pad'}
            autoCorrect={false}
          />
          <View style={styles.disputeDetailsAddReply}>
            <View style={styles.MultiLineTextFieldView}>
              <TextInput
                style={styles.sendProjectMultiLineTextField}
                value={comment}
                onChangeText={body => setComment(body)}
                placeholder={constant.projectDetailsComments}
                placeholderTextColor="#888888"
                multiline={true}
                underlineColorAndroid="transparent"
              />
            </View>
          </View>
          <View style={styles.sendProjectConatiner}>
            <View style={[styles.sendProjectTax, {marginVertical: 10}]}>
              <Text style={styles.ProjectDetailsBudgetText}>
                {constant.sendProposalProjectFixedBudget}
              </Text>
              <Text style={styles.ProjectDetailsBudgetRate}>
                {decode(proposalData.project_price)}
              </Text>
            </View>
            <View style={styles.sendProjectDashedBorder} />
            <View style={[styles.sendProjectTax, {marginVertical: 10}]}>
              <Text style={styles.ProjectDetailsBudgetText}>
                {constant.sendProposalYourBudgetRate}
              </Text>
              <Text style={styles.ProjectDetailsBudgetRate}>
                {decode(settings.price_format.symbol)}
                {rate != '' ? rate : '0.00'}
              </Text>
            </View>
            <View style={styles.sendProjectDashedBorder} />
            <View style={[styles.sendProjectTax, {marginVertical: 10}]}>
              <Text style={styles.ProjectDetailsBudgetText}>
                {constant.sendProposalServiceFeeTax}
              </Text>
              {!showLoading ? (
                <Text style={styles.ProjectDetailsBudgetRate}>
                  {rate != '' ? decode(serviceFee) : '0.00'}
                </Text>
              ) : (
                <SkeletonPlaceholder>
                  <View
                    style={{
                      width: 40,
                      height: 17,
                      marginLeft: 20,
                      borderRadius: 45 / 2,
                      marginTop: 10,
                    }}
                  />
                </SkeletonPlaceholder>
              )}
            </View>
            <View style={styles.sendProjectDashedBorder} />
            <View style={[styles.sendProjectTax, {marginVertical: 10}]}>
              <Text style={styles.ProjectDetailsBudgetText}>
                {constant.sendProposalTotalAmount}
              </Text>
              {!showLoading ? (
                <Text style={styles.ProjectDetailsBudgetRate}>
                  {rate != '' ? decode(totalAmount) : '0.00'}
                </Text>
              ) : (
                <SkeletonPlaceholder>
                  <View
                    style={{
                      width: 40,
                      height: 17,
                      marginLeft: 20,
                      borderRadius: 45 / 2,
                      marginTop: 10,
                    }}
                  />
                </SkeletonPlaceholder>
              )}
            </View>
          </View>
          {proposalData.project_meta.is_milestone == 'yes' && (
            <View style={styles.sendProposalPayConatiner}>
              <Text style={styles.sendProposalPayHeader}>
                {constant.sendProposalHowYouPaid}
              </Text>
              <Text style={styles.sendProposalPayText}>
                {constant.sendProposalEmployerOpenDetail}
              </Text>
              <TouchableOpacity
                onPress={() => setPaymentMethod('milestone')}
                activeOpacity={0.6}
                style={[
                  styles.sendProposalMileStoneConatiner,
                  {
                    borderColor:
                      paymentMethod == 'milestone' ? '#22C55E' : '#fff',
                    overflow: 'hidden',
                    borderWidth: 1,
                    paddingVertical: 20,
                  },
                ]}>
                {paymentMethod == 'milestone' && (
                  <View style={styles.sendProposalChecke}>
                    <FontAwesome
                      name="check"
                      type="check"
                      color={'#fff'}
                      size={14}
                    />
                  </View>
                )}
                <Image
                  style={styles.sendProposalMileStonePhoto}
                  source={require('../../../assets/images/payPlaceholder.png')}
                />
                <Text style={styles.sendProposalMileStoneHeader}>
                  {constant.sendProposalWorkMilestones}
                </Text>
                <Text style={styles.sendProposalMileStoneText}>
                  {constant.sendProposalSplitmilestoneCompletion}
                </Text>
                {paymentMethod == 'milestone' && (
                  <TouchableOpacity
                    onPress={() => createMilestones()}
                    style={styles.sendProposalAddBtnContainer}>
                    <Text style={styles.sendProposalAddBtn}>
                      {constant.sendProposalAddMilestone}
                    </Text>
                    <Feather
                      name={'plus'}
                      size={22}
                      color={'#3377FF'}
                      style={styles.sendProposalAddBtnIcon}
                    />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.6}
                onPress={() => setPaymentMethod('fixed')}
                style={[
                  styles.sendProposalMileStoneConatiner,
                  {
                    borderColor: paymentMethod == 'fixed' ? '#22C55E' : '#fff',
                    overflow: 'hidden',
                    borderWidth: 1,
                    paddingVertical: 20,
                  },
                ]}>
                {paymentMethod == 'fixed' && (
                  <View style={styles.sendProposalChecke}>
                    <FontAwesome
                      name="check"
                      type="check"
                      color={'#fff'}
                      size={14}
                    />
                  </View>
                )}
                <Image
                  style={styles.sendProposalMileStonePhoto}
                  source={require('../../../assets/images/Placeholder01.png')}
                />
                <Text style={styles.sendProposalMileStoneHeader}>
                  {constant.sendProposalFixedPriceProject}
                </Text>
                <Text style={styles.sendProposalMileStoneText}>
                  {constant.sendProposalCompleteGetPayment}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          {/* <View style={styles.sendProposalEmpolyerInfoConatiner}>
            <Text style={styles.sendProposalEmpolyerHeader}>
              How do you want to be paid
            </Text>
            <Text style={styles.sendProposalEmpolyerText}>
              Document file size does not exceed 5MB and you can upload any
              document file format for users to download
            </Text>
            <TouchableOpacity
              onPress={() => {
                setShow(!show);
              }}
              style={[styles.sendProposalEmpolyerView]}>
              <View style={styles.sendProposalEmpolyerMain}>
                <View
                  style={[
                    styles.orderDetailSelectPlanCheckCircle,
                    {
                      backgroundColor: show == true ? '#22C55E' : '#fff',
                    },
                  ]}>
                  <View style={styles.orderDetailSelectPlanCheckInnerCircle} />
                </View>
                <Text style={styles.sendProposalEmpolyerCheckText}>Yes</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setShow(!show);
              }}
              style={[styles.sendProposalEmpolyerView]}>
              <View style={styles.sendProposalEmpolyerMain}>
                <View
                  style={[
                    styles.orderDetailSelectPlanCheckCircle,
                    {
                      backgroundColor: show != true ? '#22C55E' : '#fff',
                    },
                  ]}>
                  <View style={styles.orderDetailSelectPlanCheckInnerCircle} />
                </View>
                <Text style={styles.sendProposalEmpolyerCheckText}>No</Text>
              </View>
            </TouchableOpacity>
            <Text style={styles.sendProposalEmpolyerText}>
              Which skills do you have, Please select from the list below
            </Text>
            <FlatList
              style={{marginTop: 10}}
              data={skills}
              keyExtractor={(x, i) => i.toString()}
              renderItem={({item, index}) => (
                <TouchableOpacity
                  //   onPress={() => manageSelectedServices(item, index)}
                  style={styles.checkBoxMainView}>
                  <View style={styles.checkBoxCheckSkills}>
                    <FontAwesome
                      name="check"
                      type="check"
                      color={'#fff'}
                      size={14}
                    />
                  </View>
                  <Text style={styles.checkBoxCheckSkillsText}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <Text style={styles.sendProposalEmpolyerText}>
              How much relevant experience do you have?
            </Text>
            <FlatList
              style={{marginTop: 10}}
              data={experience}
              keyExtractor={(x, i) => i.toString()}
              renderItem={({item, index}) => (
                <TouchableOpacity
                  onPress={() => {
                    setShow(!show);
                  }}
                  style={[styles.sendProposalEmpolyerView]}>
                  <View style={styles.sendProposalEmpolyerMain}>
                    <View
                      style={[
                        styles.orderDetailSelectPlanCheckCircle,
                        {
                          backgroundColor: show == true ? '#22C55E' : '#fff',
                        },
                      ]}>
                      <View
                        style={styles.orderDetailSelectPlanCheckInnerCircle}
                      />
                    </View>
                    <Text style={styles.sendProposalEmpolyerCheckText}>
                      {item.name}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View> */}
          {/* <View style={styles.sendProposalResumeView}>
            <Text style={styles.sendProposalEmpolyerHeader}>
              Upload your resume for detailed review
            </Text>
            <View style={styles.sendProposalResumeImgView}>
              <Text style={styles.sendProposalResumeImgText}>
                Template-templatesda-9.png
              </Text>
              <Feather name={'trash-2'} size={22} color={'#EF4444'} />
            </View>
            <Text style={styles.sendProposalEmpolyerTextDec}>
              You can upload jpg and png only. Make sure your file does not
              exceed 3mb.
            </Text>
            <Text style={styles.sendProposalResumeUplodeText}>
              Click here to upload
            </Text>
          </View> */}
          {proposalData.project_meta.is_milestone == 'yes' && (
            <>
              {milestonesArray.length != 0 && (
                <View
                  style={[
                    styles.sendProposalResumeView,
                    {borderTopLeftRadius: 10, borderTopRightRadius: 10},
                  ]}>
                  <Text style={styles.sendProposalEmpolyerHeader}>
                    {constant.sendProposalMilestonesAdded}
                  </Text>
                  <FlatList
                    showsVerticalScrollIndicator={false}
                    data={milestonesArray}
                    extraData={refreshList}
                    keyExtractor={(x, i) => i.toString()}
                    renderItem={({item, index}) => (
                      <View style={styles.sendProposalResumeImgView}>
                        <View style={{width: '75%'}}>
                          <Text
                            style={{
                              fontFamily: 'Urbanist-SemiBold',
                              fontSize: 16,
                              lineHeight: 26,
                              letterSpacing: 0.5,
                              color: '#1C1C1C',
                            }}>
                            {constant.sendProposalTitle} {item.title}
                          </Text>
                          <Text
                            style={{
                              fontFamily: 'Urbanist-SemiBold',
                              fontSize: 16,
                              lineHeight: 26,
                              letterSpacing: 0.5,
                              color: '#1C1C1C',
                            }}>
                            {constant.sendProposalPrice}{' '}
                            <Text
                              style={{
                                fontFamily: 'Urbanist-SemiBold',
                                fontSize: 16,
                                lineHeight: 23,
                                marginLeft: 10,
                                letterSpacing: 0.5,
                                color: '#1DA1F2',
                              }}>
                              {decode(settings.price_format.symbol)}{item.price}
                            </Text>
                          </Text>
                          <Text
                            style={{
                              fontFamily: 'Urbanist-SemiBold',
                              fontSize: 16,
                              lineHeight: 26,
                              letterSpacing: 0.5,
                              color: '#1C1C1C',
                            }}>
                            {constant.sendProposalDescription} {item.detail}
                          </Text>
                        </View>

                        <View style={{flexDirection: 'row'}}>
                          <TouchableOpacity
                            onPress={() => deleteMilestone(index)}>
                            <Feather
                              style={{marginRight: 10}}
                              name={'trash-2'}
                              size={22}
                              color={'#EF4444'}
                            />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => editMilestone(item, index)}>
                            <Feather
                              name={'edit-3'}
                              size={22}
                              color={'#1c1c1c'}
                            />
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  />
                </View>
              )}
            </>
          )}
          <View style={{paddingTop: 15}}>
            <FormButton
              onPress={() => submitProposal()}
              buttonTitle={constant.projectDetailsSubmitBid}
              backgroundColor={CONSTANT.primaryColor}
              textColor={'#FFFFFF'}
              iconName={'download'}
              loader={loader}
            />
          </View>
        </View>
        {route.params.edit != true && (
          <FormButton
            buttonTitle={constant.projectDetailsSaveDraft}
            backgroundColor={'#F7F7F7'}
            textColor={'#999999'}
            // iconName={'chevron-right'}
            // loader={loader}
            // onPress={() => navigationforword.navigate('sendProposal')}
          />
        )}
      </ScrollView>
      <RBSheet
        ref={RBSheetCreateMileStone}
        height={Dimensions.get('window').height * 0.7}
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
              {constant.sendProposalAddNewMilestone}
            </Text>
            <Feather
              onPress={() => RBSheetCreateMileStone.current.close()}
              style={styles.RBSheetCloseIconStyle}
              name={'x'}
              size={20}
              color={'#1C1C1C'}
            />
          </View>

          <ScrollView
            style={{paddingHorizontal: 20, paddingVertical: 10}}
            showsVerticalScrollIndicator={false}>
            <View style={{width: '100%', flexDirection: 'row'}}>
              <View>
                <Text
                  style={[
                    styles.RBSheetReplyDisputeText,
                    {paddingVertical: 0},
                  ]}>
                 {constant.sendProposalHowMilestonesAdd}
                </Text>
              </View>
            </View>

            {/* {/* <FlatList
              showsVerticalScrollIndicator={false}
              data={addNewMilstone}
              extraData={refreshList}
              keyExtractor={(x, i) => i.toString()}
              renderItem={({item, index}) => ( */}
            <View
              style={{
                borderColor: '#DDDDDD',
                borderWidth: 1,
                paddingHorizontal: 10,
                borderRadius: 10,
                backgroundColor: '#F7F7F7',
                paddingBottom: 10,
                marginTop: 10,
              }}>
              <View style={styles.homeSearchParentInputStyle}>
                <TextInput
                  style={[
                    styles.homeSearchInputStyle,
                    {color: CONSTANT.fontColor},
                  ]}
                  placeholderTextColor={'#888888'}
                  onChangeText={text => setMilestonePrice(text)}
                  value={milestonePrice}
                  placeholder={constant.sendProposalAddPrice}
                  keyboardType={'number-pad'}
                />
              </View>
              <View style={styles.homeSearchParentInputStyle}>
                <TextInput
                  style={[
                    styles.homeSearchInputStyle,
                    {color: CONSTANT.fontColor},
                  ]}
                  placeholderTextColor={'#888888'}
                  onChangeText={text => setMilestoneTitle(text)}
                  value={milestoneTitle}
                  placeholder={constant.sendProposalEnterMilestoneTitle}
                />
              </View>
              <View style={{height: 100, marginVertical: 10, width: '100%'}}>
                <View style={[styles.MultiLineTextFieldView, {padding: 0}]}>
                  <TextInput
                    style={[
                      styles.MultiLineTextField,
                      {color: CONSTANT.fontColor},
                    ]}
                    value={milestoneDes}
                    onChangeText={body => setMilestoneDes(body)}
                    placeholder={constant.availableTaskDetailDisputeDetails}
                    placeholderTextColor="#888888"
                    multiline={true}
                    underlineColorAndroid="transparent"
                  />
                </View>
              </View>
              {/* <FormButton
                    onPress={() => removeMileStone(index)}
                    buttonTitle={'Delete milestone'}
                    backgroundColor={'#EF4444'}
                    textColor={'#fff'}
                    iconName={'trash-2'}
                  /> */}
            </View>
            {/* )}
            />  */}

            <FormButton
              onPress={() => addMilestoneData()}
              buttonTitle={constant.sendProposalAddList}
              backgroundColor={'#22C55E'}
              textColor={'#fff'}
            />
          </ScrollView>
        </View>
      </RBSheet>
    </SafeAreaView>
  );
};

export default SendProposal;
