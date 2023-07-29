import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  TextInput,
  FlatList,
  Alert,
  Button,
} from 'react-native';
import React, {useRef, useState, useEffect} from 'react';
import Feather from 'react-native-vector-icons/Feather';
import Header from '../../components/Header';
import styles from '../../style/styles.js';
import {ScrollView} from 'react-native-gesture-handler';
import FormButton from '../../components/FormButton';
import RBSheet from 'react-native-raw-bottom-sheet';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import * as CONSTANT from '../../constants/globalConstants';
import {decode} from 'html-entities';
import {useSelector, useDispatch} from 'react-redux';
import axios from 'axios';
import constant from '../../constants/translation';

const DisputesDetail = ({route}) => {
  const [description, setDescription] = useState('');
  const settings = useSelector(state => state.setting.settings);
  const [disable, setDisable] = useState(false);
  const profileImage = useSelector(state => state.value.profileImage);
  const token = useSelector(state => state.value.token);
  const userDetail = useSelector(state => state.value.userInfo);
  const [availableTaskList, setAvailableTaskList] = useState([]);
  const [selectedReply, setSelectedReply] = useState('');

  const [billing, setBilling] = useState();
  const [refresh, setRefresh] = useState(false);
  const [loading, setLoading] = useState(false);
  const RBSheetReplyDispute = useRef();
  const RBSheetDeclineDispute = useRef();
  const RBSheetReply = useRef();

  useEffect(() => {
    getAvailableTask();
  }, []);
  const getAvailableTask = () => {
    fetch(
      CONSTANT.BaseUrl +
        'get-orders?post_id=' +
        userDetail.profile_id +
        '&type=single&order_post_id=' +
        route.params.item.order_id,
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
        setAvailableTaskList(responseJson);
      })
      .catch(error => {
        console.error(error);
      });
  };
  const postReply = () => {
    if (availableTaskList.length >= 1) {
      setLoading(true);
      axios
        .post(
          CONSTANT.BaseUrl + 'update-dispute-comments',
          {
            post_id: userDetail.profile_id,
            dispute_id: availableTaskList[0].dispute_id,
            dispute_comment: description,
            action_type: selectedReply,
          },
          {
            headers: {
              Authorization: 'Bearer ' + token,
            },
          },
        )
        .then(async response => {
          setLoading(false);

          if (response.data.type == 'success') {
            RBSheetReply.current.close();
            Alert.alert(constant.SuccessText, response.data.message_desc);
          } else if (response.data.type == 'error') {
            Alert.alert(constant.OopsText, response.data.message_desc);
          }
        })
        .catch(error => {
          setLoading(false);
          console.log(error);
        });
    }
  };
  const taskPostReply = () => {
      setLoading(true);
    axios
      .post(
        CONSTANT.BaseUrl + 'project-refund-dispute-reply',
        {
          post_id: userDetail.profile_id,
          user_id: userDetail.user_id,
          dispute_id: route.params.item.dispute_id,
          dispute_comment: description,
          action_type: selectedReply,
        },
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        },
      )
      .then(async response => {
        setLoading(false);
        if (response.data.type == 'success') {
          RBSheetReply.current.close();
          route.params.item.dispute_comments.push({
            message: description,
            author_name: userDetail.user_name,
            author_user_type: userDetail.user_type,
            avatar: profileImage,
          });
          setRefresh(!refresh);
          Alert.alert(constant.SuccessText, response.data.message_desc);
        } else if (response.data.type == 'error') {
          Alert.alert(constant.OopsText, response.data.message_desc);
        }
      })
      .catch(error => {
          setLoading(false);
          console.log(error);
      });
    // }
  };
  return (
    <SafeAreaView style={styles.globalContainer}>
      <Header
        title={constant.disputesDetailsTitle}
        titleColor={'#1C1C1C'}
        backColor={'#F7F7F7'}
        iconColor={'#1C1C1C'}
        backIcon={true}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.disputesDetailsContainer}>
          <View style={styles.disputesDetailsInfoContainer}>
            <Text style={styles.disputesDetailsInfoText1}>
              {constant.disputesDetailsID}
            </Text>
            <Text style={styles.disputesDetailsInfoText2}>
              {route.params.item.dispute_id}
            </Text>
          </View>
          <View style={styles.disputesDetailsInfoContainer2}>
          <View style={[styles.disputesStatus,{borderColor:route.params.item.status == "publish" ? "#999999" : "#F97316"}]}>
            {route.params.item.status == "publish" ?
               <Text style={styles.disputesStatusText}>
               {constant.disputesDetailsRefundRequested}
             </Text>:
                <Text style={styles.disputesStatusText}>
               {route.params.item.status.charAt(0).toUpperCase() +
                  route.params.item.status.slice(1)}
              </Text>}
            </View>
            <Text style={styles.disputesDetailsInfoText1}>
              {route.params.item.date}
            </Text>
            <Text style={styles.disputesDetailsInfoTagLine}>
              {route.params.item.task_title}
            </Text>
          </View>
        </View>
        {userDetail.user_type != 'sellers' ? (
          <>
            <View style={styles.disputesDetailsUserContainer}>
              <ImageBackground
                imageStyle={{borderRadius: 50 / 2}}
                style={styles.homefreelancerImageBackgroundStyle}
                source={{uri: route.params.item.seller_image}}
              />
              <View style={{paddingLeft: 10}}>
                <Text style={styles.disputesDetailsUserText}>
                  {constant.disputesDetailsSeller}
                </Text>
                <Text style={styles.disputesDetailsUserName}>
                  {route.params.item.seller_name}
                </Text>
              </View>
            </View>
            <View style={{marginHorizontal: 15}}>
              <Text
                style={[
                  styles.disputesDetailsDescriptionTagline,
                  {paddingVertical: 10, width: '90%'},
                ]}>
                {route.params.item.dispute_title}
              </Text>
              <Text
                style={[
                  styles.disputesDetailsDescription1,
                  {width: '90%', paddingRight: 10},
                ]}>
                {route.params.item.dispute_content}
              </Text>
            </View>
          </>
        ) : (
          <View
            style={{
              padding: 10,
              borderColor: '#DDDDDD',
              borderBottomWidth: 1,
              flexDirection: 'row',
            }}>
            <ImageBackground
              imageStyle={{borderRadius: 50 / 2}}
              style={styles.homefreelancerImageBackgroundStyle}
              source={{uri: route.params.item.buyer_image}}
            />
            <View style={{paddingLeft: 10, width: '100%'}}>
              <Text style={styles.disputesDetailsUserText}>
                {constant.disputesDetailsBuyer}
              </Text>
              <Text style={styles.disputesDetailsUserName}>
                {' '}
                {route.params.item.buyer_name}
              </Text>
              <Text
                style={[
                  styles.disputesDetailsDescriptionTagline,
                  {paddingVertical: 10, width: '90%'},
                ]}>
                {route.params.item.dispute_title}
              </Text>
              <Text
                style={[
                  styles.disputesDetailsDescription1,
                  {width: '90%', paddingRight: 10},
                ]}>
                {route.params.item.dispute_content}
              </Text>
            </View>
          </View>
        )}
        <View
          style={{
            padding: 10,
            borderColor: '#DDDDDD',
            borderBottomWidth: 1,
            paddingVertical: 15,
            flexDirection: 'row',
            // alignItems: 'center',
          }}>
          <FlatList
            data={route.params.item.dispute_comments}
            keyExtractor={(x, i) => i.toString()}
            extraData={refresh}
            renderItem={({item, index}) => (
              <View style={{flexDirection: 'row'}}>
                <ImageBackground
                  imageStyle={{borderRadius: 50 / 2}}
                  style={styles.homefreelancerImageBackgroundStyle}
                  source={{uri: item.avatar}}
                />

                <View style={{paddingLeft: 10}}>
                  <Text style={styles.disputesDetailsUserText}>
                    {item.author_user_type}
                  </Text>
                  <Text style={styles.disputesDetailsUserName}>
                    {' '}
                    {item.author_name}
                  </Text>

                  <Text
                    style={[
                      styles.disputesDetailsDescriptionTagline,
                      {paddingVertical: 10},
                    ]}>
                    {item.message}
                  </Text>
                  <Text style={styles.disputesDetailsDescription1}>
                    {item.dispute_content}
                  </Text>
                </View>
              </View>
            )}
          />
        </View>
        <View style={styles.disputesDetailsDescriptionContainer}>
          {availableTaskList.length >= 1 && (
            <View style={styles.availableTaskDetailTaskBudgetView}>
              <View style={styles.availableTaskDetailTaskBudgetHeader}>
                <Text style={styles.orderDetailHeadingOrder}>
                  {constant.disputesDetailsTotalbudget}
                </Text>
                <TouchableOpacity style={{width: '10%'}}>
                  <Feather
                    name={'chevron-down'}
                    type={'chevron-down'}
                    color={'#1C1C1C'}
                    size={24}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.orderDetailAdditionalfeatureView}>
                <View style={styles.orderDetailServicesListHeader}>
                  <Text style={styles.orderDetailAdditionalfeatureListText}>
                    {availableTaskList[0].task_title}
                  </Text>
                  <Text style={styles.orderDetailAdditionalfeatureListText}>
                    ({decode(settings.price_format.symbol)}{availableTaskList[0].order_details.price}.00)
                  </Text>
                </View>
                <FlatList
                  showsVerticalScrollIndicator={false}
                  data={availableTaskList[0].order_details.subtasks}
                  keyExtractor={(x, i) => i.toString()}
                  renderItem={({item, index}) => (
                    <View style={styles.orderDetailServicesListHeader}>
                      <Text style={styles.orderDetailAdditionalfeatureListText}>
                        {item.title}
                      </Text>
                      <Text style={styles.orderDetailAdditionalfeatureListText}>
                        ({decode(item.price_format)})
                      </Text>
                    </View>
                  )}
                />

                {userDetail.user_type == 'sellers' ? null : (
                  <>
                    <View
                      style={styles.orderDetailAdditionalfeatureSeparator}
                    />
                    <View style={styles.orderDetailServicesListHeader}>
                      <Text style={styles.orderDetailAdditionalfeatureListText}>
                        {constant.disputesDetailsTaxes}
                      </Text>
                      <Text style={styles.orderDetailAdditionalfeatureListText}>
                        ({decode(availableTaskList[0].get_taxes)})
                      </Text>
                    </View>
                  </>
                )}
                <View style={styles.orderDetailAdditionalfeatureSeparator} />
                <View style={styles.orderDetailServicesListHeader}>
                  <Text style={styles.orderDetailAdditionalfeatureListText}>
                    {constant.disputesDetailsTotalbudget}
                  </Text>
                  <Text style={styles.orderDetailAdditionalfeatureListText}>
                    ({decode(availableTaskList[0].order_price_format)})
                  </Text>
                </View>
              </View>
            </View>
          )}
          {route.params.item.status != 'refunded' &&
            route.params.item.status != 'cancelled' &&
            route.params.item.status != 'disputed' &&
            route.params.item.status != 'declined' && (
              <View style={styles.disputeDetailsReplyContainer}>
                <TouchableOpacity
                  onPress={() => {
                    RBSheetReply.current.open();
                    setDescription('');
                    setSelectedReply('reply');
                  }}
                  style={[
                    styles.disputeDetailsReplyBtn,
                    {width: userDetail.user_type == 'sellers' ? '32%' : '99%'},
                  ]}>
                  <Text style={styles.disputeDetailsReplyBtnText}>
                    {' '}
                    {constant.disputesDetailsReply}
                  </Text>
                </TouchableOpacity>
                {userDetail.user_type == 'sellers' && (
                  <>
                    <TouchableOpacity
                      onPress={() => {
                        RBSheetReply.current.open(), setSelectedReply('refund');
                      }}
                      style={styles.disputeDetailsRefundBtn}>
                      <Text style={styles.disputeDetailsRefundBtnText}>
                        {constant.disputesDetailsAllowRefund}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        RBSheetReply.current.open(),
                          setSelectedReply('decline');
                      }}
                      style={styles.disputeDetailsDeclineBtn}>
                      <Text style={styles.disputeDetailsDeclineBtnText}>
                        {constant.disputesDetailsDecline}
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}

          {route.params.item.status != 'refunded' &&
            route.params.item.status != 'cancelled' &&
            route.params.item.status != 'disputed' &&
            route.params.item.status != 'declined' && (
              <Text style={styles.disputesDetailsDescriptionBtn}>
                {constant.disputesDetailsDueDate}
                {route.params.item.final_date}
                {constant.disputesDetailsDueDateTwo}
              </Text>
            )}
        </View>
      </ScrollView>

      <RBSheet
        ref={RBSheetReply}
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
              {constant.disputesDetailsReplyDispute}
            </Text>
            <Feather
              onPress={() => RBSheetReply.current.close()}
              style={styles.RBSheetCloseIconStyle}
              name={'x'}
              size={20}
              color={'#1C1C1C'}
            />
          </View>

          <ScrollView
            style={{paddingHorizontal: 20, paddingVertical: 10}}
            showsVerticalScrollIndicator={false}>
            <Text style={styles.RBSheetReplyDisputeText}>
              {constant.disputesDetailsAddReply}
            </Text>

            <View style={styles.disputeDetailsAddReply}>
              <View style={styles.MultiLineTextFieldView}>
                <TextInput
                  style={styles.MultiLineTextField}
                  value={description}
                  onChangeText={body => setDescription(body)}
                  placeholder={constant.disputesDetailsDescription}
                  placeholderTextColor="#888888"
                  multiline={true}
                  underlineColorAndroid="transparent"
                />
              </View>
            </View>
            <FormButton
              onPress={() =>
                route.params.ProjectType ? taskPostReply() : postReply()
              }
              buttonTitle={
                selectedReply == 'reply'
                  ? constant.disputesDetailsReplyBtn
                  : selectedReply == 'refund'
                  ? constant.disputesDetailsRefundBtn
                  : constant.disputesDetailsDeclinedBtn
              }
              backgroundColor={
                selectedReply == 'reply'
                  ? '#999999'
                  : selectedReply == 'refund'
                  ? '#22C55E'
                  : '#EF4444'
              }
              textColor={'#fff'}
              loader={loading}
            />
          </ScrollView>
        </View>
      </RBSheet>
    </SafeAreaView>
  );
};

export default DisputesDetail;
