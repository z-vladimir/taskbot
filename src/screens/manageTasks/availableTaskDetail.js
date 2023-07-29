import {
  View,
  Text,
  SafeAreaView,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  FlatList,
  Platform,
  Alert,
  PermissionsAndroid,
  Dimensions,
} from 'react-native';
import React, {useState, useEffect, useRef} from 'react';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Octicons from 'react-native-vector-icons/Octicons';
import {useSelector, useDispatch} from 'react-redux';
import Header from '../../components/Header';
import RBSheet from 'react-native-raw-bottom-sheet';
import Spinner from 'react-native-loading-spinner-overlay';
import FormButton from '../../components/FormButton';
import HTML from 'react-native-render-html';
import StarRating from 'react-native-star-rating';
import * as CONSTANT from '../../constants/globalConstants';
import ImagePicker from 'react-native-image-crop-picker';
import axios from 'axios';
import RNFetchBlob from 'rn-fetch-blob';
import MultiSelect from 'react-native-multiple-select';
import styles from '../../style/styles';
import DocumentPicker from 'react-native-document-picker';
import {decode} from 'html-entities';
import FormInput from '../../components/FormInput';
import constant from '../../constants/translation';

const AvailableTaskDetail = ({route, navigation}) => {

  const userDetail = useSelector(state => state.value.userInfo);
  const token = useSelector(state => state.value.token);
  const RBSheetCreateDisputeAndRefund = useRef();
  const RBSheetOrderStatus = useRef();
  const RBSheetOrderCancelStatus = useRef();

  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loader, setLoader] = useState(false);
  const [data, setData] = useState("");
  const [disable, setDisable] = useState(false);
  const [sendingStatus, setSendingStatus] = useState('revision');
  const [refreshList, setRefreshList] = useState(false);
  const [ratings, setRatings] = useState(null);
  const [disputeIssue, setDisputeIssue] = useState([]);
  const [disputeData, setdisputeData] = useState({});
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [docArray, setDocArray] = useState([]);
  const [statusArray, setStatusArray] = useState([
    {
      key: 'complete',
      val: 'Complete now',
    },
    {
      key: 'cancel',
      val: 'Cancel now',
    },
  ]);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [orderId, setorderId] = useState(data.order_id);

  const tagsStyles = {
    body: {
      fontFamily: 'OpenSans-Regular',
      fontSize: 15,
      letterSpacing: 0.5,
      lineHeight: 24,
      marginTop: 5,
      color: '#0A0F26',
    },
  };

  useEffect(() => {
    setData(route.params.data)
    getDisputeIssues();
  }, []);

  const getAvailableTask = () => {
    setLoader(true);
    fetch(
      CONSTANT.BaseUrl +
        'get-orders?post_id=' +
        userDetail.profile_id +
        '&type=single' +
        '&order_post_id=' +
        data.order_id,
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
        setData(responseJson[0])
        setLoader(false);
       
      })
      .catch(error => {
        setLoader(false);
        console.error(error);
      });
  };

  const pickDocumentfromDevice = async () => {
    // docArray.length =0
    try {
      const res = await DocumentPicker.pickMultiple({
        type: [DocumentPicker.types.images],
        allowMultiSelection: true,
      });
      if (res.length < 4) {
        setDocArray(res);
        setRefreshList(!refreshList);
      } else {
        Alert.alert(constant.OopsText, constant.availableTaskDetailUploadFiles);
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker, exit any dialogs or menus and move on
      } else {
        throw err;
      }
    }
  };

  const getDisputeIssues = () => {
    setLoader(true);
    fetch(CONSTANT.BaseUrl + 'settings/get_settings', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
      .then(response => response.json())
      .then(responseJson => {
        setLoader(false);
        if (userDetail.user_type == 'sellers') {
          setDisputeIssue(responseJson.seller_dispute_issues);
        } else {
          setDisputeIssue(responseJson.buyer_dispute_issues);
        }
      })
      .catch(error => {
        setLoader(false);
        console.error(error);
      });
  };
  const getAttachmentLink = value => {
    setLoader(true);
    fetch(
      CONSTANT.BaseUrl +
        'get-attachments?post_id=' +
        userDetail.profile_id +
        '&comments_id=' +
        value,
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
        checkPermission(responseJson.attachment);
      })
      .catch(error => {
        setLoader(false);
        console.error(error);
      });
  };
  const checkPermission = async link => {
    if (Platform.OS === 'ios') {
      setLoader(false);
      downloadMedia(link);
    } else {
      setLoader(false);
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission Required',
            message: 'App needs access to your storage to download Photos',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('permission granted..');
          downloadMedia(link);
        } else {
          Alert.alert('Storage Permission Not Granted');
        }
      } catch (error) {
        console.warn(error);
      }
    }
  };
  const downloadMedia = link => {
    let URL = link;
    let date = new Date();
    let ext = '.zip';
    const {config, fs} = RNFetchBlob;
    let options;
    let PictureDir = fs.dirs.PictureDir;
    options = Platform.select({
      ios: {
        fileCache: true,
        path:
          PictureDir +
          '/Taskbot/Taskbot Documents/' +
          Math.floor(date.getTime() + date.getSeconds() / 2) +
          ext,
        appendExt: ext,
      },
      android: {
        fileCache: true,
        addAndroidDownloads: {
          useDownloadManager: true, // <-- this is the only thing required
          notification: true,
          path:
            PictureDir +
            '/Taskbot/Taskbot Documents/' +
            Math.floor(date.getTime() + date.getSeconds() / 2) +
            ext,
          description: 'Document',
        },
      },
    });
    config(options)
      .fetch('GET', URL)
      .then(res => {
        console.log('Success', res);
        if (Platform.OS === 'ios') {
          RNFetchBlob.ios.openDocument(res.data);
        }
      });
  };
  const removeDocument = index => {
    docArray.splice(index, 1);
    setRefreshList(!refreshList);
  };

  const updateActivities = () => {
    setLoader(true);
    const formData = new FormData();
    formData.append('post_id', userDetail.profile_id);
    formData.append('id', data.order_id);
    formData.append('activity_detail', description);
    formData.append('message_type', sendingStatus);
    formData.append('document_size', docArray.length);
    if (docArray.length != 0) {
      docArray.forEach((item, i) => {
        var index = parseInt(i) + 1;
        formData.append('documents_' + index, {
          uri: item.uri,
          type: item.type,
          name: item.name,
        });
      });
    }
    fetch(CONSTANT.BaseUrl + 'update-activities', {
      method: 'post',
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: 'Bearer ' + token,
      },
      body: formData,
    })
    .then(response => response.json())
      .then(responseJson => {
        setLoader(false);
        if (responseJson.type == 'error') {
          Alert.alert(constant.OopsText, responseJson.message_desc);
        }
        setDescription("")
        getAvailableTask()
        // Alert.alert(constant.availableTaskDetail, constant.MessageSuccessfuly);
        // navigation.goBack();
      })
      .catch(error => {
        setLoader(false);
        console.log(error);
      });
  };
  const createDispute = () => {
    setLoader(true);
    RBSheetCreateDisputeAndRefund.current.close();
    axios
      .post(
        CONSTANT.BaseUrl + 'create-dispute',
        {
          post_id: userDetail.profile_id,
          dispute_issue: disputeIssue[selectedIssue].val,
          dispute_details: description,
          task_id: data.task_id,
          order_id: data.order_id,
          dispute_terms: 'on',
        },
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        },
      )
      .then(async response => {
        if (response.data.type == 'success') {
          Alert.alert('Success', response.data.message_desc);
          setLoader(false);
        } else if (response.data.type == 'error') {
          setLoader(false);
          Alert.alert('Oops', response.data.message_desc);
        }
      })
      .catch(error => {
        setLoader(false);
        console.log(error);
      });
  };
  const completeStatusTask = () => {
    RBSheetOrderStatus.current.close();
    setLoader(true);
    axios
      .post(
        CONSTANT.BaseUrl + 'task-complete',
        {
          post_id: userDetail.profile_id,
          task_id: data.task_id,
          order_id: data.order_id,
          type: 'rating',
          rating: ratings,
          user_id: userDetail.user_id,
          rating_title: title,
          rating_details: feedback,
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
          setFeedback('');
          setTitle('');
          setRatings(null);
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
  };

  const cancelStatusTask = () => {
    RBSheetOrderCancelStatus.current.close();
    setLoader(true);
    axios
      .post(
        CONSTANT.BaseUrl + 'task-cancelled',
        {
          post_id: userDetail.profile_id,
          task_id: data.task_id,
          order_id: data.order_id,
          user_id: userDetail.user_id,
          details: description,
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
          setDescription('');
          setLoader(false);
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

  const updateDispute = () => {
    setLoader(true);
    axios
      .post(
        CONSTANT.BaseUrl + 'update-dispute',
        {
          post_id: userDetail.profile_id,
          dispute_id: data.dispute_id,
        },
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        },
      )
      .then(async response => {
        if (response.data.type == 'success') {
          Alert.alert('Success', response.data.message_desc);
          setLoader(false);
        } else if (response.data.type == 'error') {
          setLoader(false);
          Alert.alert('Oops', response.data.message_desc);
        }
      })
      .catch(error => {
        setLoader(false);
        console.log(error);
      });
  };

  const showDisputeDetail = () => {
    setLoader(true);
    fetch(
      CONSTANT.BaseUrl +
        'get-disputes?post_id=' +
        userDetail.profile_id +
        '&dispute_id=' +
        data.dispute_id +
        '&type=single',
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
        setLoader(false);
        navigation.navigate('disputesDetail', {item: responseJson[0]});
        // setdisputeData(responseJson);
      })
      .catch(error => {
        setLoader(false);
        console.error(error);
      });
  };

  return (
    <SafeAreaView style={styles.globalContainer}>
      <Header
        title={constant.availableTaskDetailTitle}
        titleColor={'#1C1C1C'}
        backColor={'#F7F7F7'}
        iconColor={'#1C1C1C'}
        backIcon={true}
      />
      {loader && <Spinner visible={true} color={'#000'} />}
      {data !=  "" &&
        <ScrollView
        showsVerticalScrollIndicator={false}
        style={{backgroundColor: '#f7f7f7'}}>
        <View style={styles.availableTaskDetailTopView}>
          <Text
            style={[
              styles.availableTaskDetailTagStatus,
              {
                backgroundColor:
                  data.task_status == 'cancelled'
                    ? '#EF4444'
                    : data.task_status == 'completed'
                    ? '#22C55E'
                    : '#F97316',
              },
            ]}>
            {data.order_label}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {Object.entries(data.categories).map((key, index) => (
              <>
                <Text style={styles.taskDetailSkillList}>
                  {decode(key[1])}
                  {Object.keys(data.categories).length - 1 == index
                    ? ''
                    : ', '}
                </Text>
              </>
            ))}
          </ScrollView>
          <Text style={styles.taskDetailMainHeading}>
            {data.task_title}
          </Text>
          <View style={styles.availableTaskDetailDatePlanView}>
            <View style={{width: '50%'}}>
              <Text style={styles.availableTaskDetailDatePlanText}>
                {constant.availableTaskDetailDeadline}
              </Text>
              <Text style={styles.availableTaskDetailDatePlanValue}>
                {data.delivery_time}
              </Text>
            </View>
            <View>
              <Text style={styles.availableTaskDetailDatePlanText}>
                {constant.availableTaskDetailPricingPlan}
              </Text>
              <Text style={styles.availableTaskDetailDatePlanValue}>
                {data.order_details.title}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.availableTaskDetailProfileView}>
          <View style={{flexDirection: 'row'}}>
            <ImageBackground
              imageStyle={{borderRadius: 50 / 2}}
              style={styles.availableTaskDetailProfileImage}
              source={{
                uri:
                  userDetail.user_type == 'sellers'
                    ? data.buyer_image
                    : data.seller_image,
              }}
            />
            <View style={styles.taskDetailPlansBodyNameView}>
              <Text style={styles.availableTaskDetailProfileHeading}>
                {constant.availableTaskDetailTask}
              </Text>
              <Text style={styles.availableTaskDetailProfileName}>
                {userDetail.user_type == 'sellers'
                  ? data.buyer_name
                  : data.seller_name}
              </Text>
            </View>
          </View>
        </View>

        <View
          style={{
            paddingHorizontal: 10,
            backgroundColor: '#fff',
            paddingBottom: 15,
          }}>
          <Text style={styles.orderDetailServicesHeading}>
            {constant.availableTaskDetailFeaturesIncluded}
          </Text>
          <FlatList
            showsVerticalScrollIndicator={false}
            data={data.order_details.fields}
            keyExtractor={(x, i) => i.toString()}
            renderItem={({item, index}) => (
              <View style={styles.availableTaskDetailfeaturedViewItem}>
                <View
                  style={[
                    styles.availableTaskDetailfeaturedViewItemList,
                    {
                      backgroundColor:
                        item.selected_val == 'yes' ? '#22C55E' : '#999999',
                    },
                  ]}>
                  <Feather
                    name={'check'}
                    type={'check'}
                    color={'#fff'}
                    size={16}
                  />
                </View>
                <Text style={styles.orderDetailServicesListTitle}>
                  {item.label}
                </Text>
              </View>
            )}
          />
          <FlatList
            showsVerticalScrollIndicator={false}
            data={data.order_details.tb_custom_fields}
            keyExtractor={(x, i) => i.toString()}
            renderItem={({item, index}) => (
              <View style={styles.availableTaskDetailCustomFieldscontainer}>
                <View style={styles.availableTaskDetailCustomFieldsView}>
                  <Feather
                    name={'check'}
                    type={'check'}
                    color={'#fff'}
                    size={16}
                  />
                </View>
                <Text style={styles.orderDetailServicesListTitle}>
                  {item.title}(
                  {data.order_details.key == 'premium'
                    ? item.premium
                    : data.order_details.key == 'pro'
                    ? item.pro
                    : item.basic}
                  )
                </Text>
              </View>
            )}
          />
        </View>
        {data.order_details.subtasks.length >= 1 && (
          <View style={styles.orderDetailServicesView}>
            <Text style={styles.orderDetailServicesHeading}>
              {constant.availableTaskDetailAdditionalServices}
            </Text>
            <FlatList
              showsVerticalScrollIndicator={false}
              data={data.order_details.subtasks}
              keyExtractor={(x, i) => i.toString()}
              renderItem={({item, index}) => (
                <View
                  style={
                    data.order_details.subtasks.length - 1 == index
                      ? styles.orderDetailServicesListViewLast
                      : styles.orderDetailServicesListView
                  }>
                  <View style={styles.orderDetailServicesListHeader}>
                    <TouchableOpacity style={[styles.orderDetailRatingView,{width:"75%"}]}>
                      <Octicons
                        name="primitive-dot"
                        type="primitive-dot"
                        color={'#1C1C1C'}
                        size={12}
                      />

                      <Text style={styles.orderDetailServicesListTitle}>
                        {item.title}
                      </Text>
                    </TouchableOpacity>

                    <Text style={styles.orderDetailServicesListPrice}>
                      + {decode(item.price_format)}
                    </Text>
                  </View>
                  <View style={{width: '100%'}}>
                    <HTML
                      tagsStyles={tagsStyles}
                      source={{html: item.content}}
                    />
                  </View>
                  {/* <Text style={styles.orderDetailServicesListDesc}>
             {item.content}

            </Text> */}
                </View>
              )}
            />
          </View>
        )}
        <View style={{height: 20}} />
        <View style={styles.availableTaskDetailTaskBudgetView}>
          <View style={styles.availableTaskDetailTaskBudgetHeader}>
            <Text style={styles.orderDetailHeadingOrder}>
              {constant.availableTaskDetailTotalBudget}
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
                {userDetail.user_type == 'sellers'
                  ? data.order_details.title
                  : data.task_title}
              </Text>
              <Text style={styles.orderDetailAdditionalfeatureListText}>
                ({decode(data.plan_price)})
              </Text>
            </View>
            <FlatList
              showsVerticalScrollIndicator={false}
              data={data.order_details.subtasks}
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

            {userDetail.user_type == 'sellers' ? (
              <>
                <View style={styles.orderDetailAdditionalfeatureSeparator} />
                <View style={styles.orderDetailServicesListHeader}>
                  <Text style={styles.orderDetailAdditionalfeatureListText}>
                    {constant.availableTaskDetailProcessing}
                  </Text>
                  <Text style={styles.orderDetailAdditionalfeatureListText}>
                    ({decode(data.admin_shares_fromat)})
                  </Text>
                </View>
              </>
            ) : (
              <>
                <View style={styles.orderDetailAdditionalfeatureSeparator} />
                <View style={styles.orderDetailServicesListHeader}>
                  <Text style={styles.orderDetailAdditionalfeatureListText}>
                    {constant.availableTaskDetailTaxes}
                  </Text>
                  <Text style={styles.orderDetailAdditionalfeatureListText}>
                    ({decode(data.get_taxes)})
                  </Text>
                </View>
              </>
            )}
            <View style={styles.orderDetailAdditionalfeatureSeparator} />
            <View style={styles.orderDetailServicesListHeader}>
              <Text style={styles.orderDetailAdditionalfeatureListText}>
                {constant.availableTaskDetailTotalBudget}
              </Text>
              <Text style={styles.orderDetailAdditionalfeatureListText}>
                (
                {userDetail.user_type == 'sellers'
                  ? decode(data.seller_shares_fromat)
                  : decode(data.order_price_format)}
                )
              </Text>
            </View>
            {userDetail.user_type != 'sellers' &&
              data.task_status != 'cancelled' &&
              data.task_status != 'completed' && (
                <View style={styles.availableTaskStatusConatiner}>
                  <View style={{width: '85%'}}>
                    <MultiSelect
                      fontSize={16}
                      onSelectedItemsChange={value => setSelectedStatus(value)}
                      uniqueKey="key"
                      items={statusArray}
                      selectedItems={selectedStatus}
                      borderBottomWidth={0}
                      single={true}
                      searchInputPlaceholderText={'Status: Ongoing'}
                      selectText={'Status: Ongoing'}
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
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() =>
                      selectedStatus.toString() == 'complete'
                        ? RBSheetOrderStatus.current.open()
                        : RBSheetOrderCancelStatus.current.open()
                    }
                    style={styles.availableTaskCompleted}>
                    <Feather
                      style={{backgroundColor: '#fddb5b', padding: 10}}
                      name={'check'}
                      type={'check'}
                      color={'#1C1C1C'}
                      size={19}
                    />
                  </TouchableOpacity>
                </View>
              )}
            {userDetail.user_type == 'sellers' ? (
              <>
                {(data.task_status == 'cancelled' ||
                  data.task_status == 'hired') &&
                data.dispute != 'yes' ? (
                  <FormButton
                    onPress={() => RBSheetCreateDisputeAndRefund.current.open()}
                    buttonTitle={
                      userDetail.user_type == 'sellers'
                        ? constant.availableTaskDetailCreateDispute
                        : constant.availableTaskDetailRefundRequest
                    }
                    backgroundColor={'#6366F1'}
                    textColor={'#fff'}
                  />
                ) : null}
              </>
            ) : (
              <>
                {data.dispute != 'yes' ? (
                  <FormButton
                    onPress={() => RBSheetCreateDisputeAndRefund.current.open()}
                    buttonTitle={
                      userDetail.user_type == 'sellers'
                        ? constant.availableTaskDetailCreateDispute
                        : constant.availableTaskDetailRefundRequest
                    }
                    backgroundColor={'#6366F1'}
                    textColor={'#fff'}
                  />
                ) : null}
              </>
            )}
            {userDetail.user_type == 'sellers' ? (
              <>
                {data.dispute_status == 'declined' ? (
                  <FormButton
                    onPress={() => updateDispute()}
                    buttonTitle={'Update dispute'}
                    backgroundColor={'#6366F1'}
                    textColor={'#fff'}
                  />
                ) : null}
              </>
            ) : (
              <>
                {data.dispute_status == 'publish' &&
                data.dispute_details.disbuted_time <
                  data.dispute_details.current_time ? (
                  <FormButton
                    onPress={() => updateDispute()}
                    buttonTitle={'Update dispute'}
                    backgroundColor={'#6366F1'}
                    textColor={'#fff'}
                  />
                ) : null}
              </>
            )}

            {userDetail.user_type == 'sellers' ? (
              <>
                {(data.dispute_status == 'disputed' ||
                  data.dispute_status == 'publish' ||
                  data.dispute_status == 'refunded') &&
                data.dispute == 'yes' &&
                (data.order_status == 'completed' ||
                  data.order_status == 'cancelled' ||
                  data.order_status == 'refunded') ? (
                  <FormButton
                    onPress={() => showDisputeDetail()}
                    buttonTitle={'View details'}
                    backgroundColor={'#ff5b00'}
                    textColor={'#fff'}
                  />
                ) : null}
              </>
            ) : (
              <>
                {data.dispute_status == 'disputed' ||
                data.dispute_status == 'publish' ||
                data.dispute_status == 'refunded' ? (
                  <FormButton
                    onPress={() => showDisputeDetail()}
                    buttonTitle={'View details'}
                    backgroundColor={'#ff5b00'}
                    textColor={'#fff'}
                  />
                ) : null}
              </>
            )}
          </View>
        </View>

        {data.task_comments.length >= 1 && (
          <>
            <View style={{height: 20}} />
            <View style={styles.availableTaskDetailTaskHistory}>
              <Text style={styles.orderDetailServicesHeading}>
                {constant.availableTaskDetailHistory}
              </Text>
              <FlatList
                style={{width: '100%'}}
                showsVerticalScrollIndicator={false}
                data={data.task_comments}
                keyExtractor={(x, i) => i.toString()}
                renderItem={({item, index}) => (
                  <View
                    style={
                      data.task_comments.length - 1 == index
                        ? styles.orderDetailServicesListViewLast
                        : styles.orderDetailServicesListView
                    }>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <View style={styles.orderDetailRatingView}>
                        <ImageBackground
                          imageStyle={{borderRadius: 56 / 2}}
                          style={styles.availableTaskDetailTaskHistoryImage}
                          source={{uri: item.avatar}}
                        />
                        <Text style={styles.orderDetailSelectPlanName}>
                          {item.author}
                        </Text>
                      </View>
                      <Text style={styles.availableTaskDetailTaskHistoryDate}>
                        {item.date_formate}
                      </Text>
                    </View>
                    <View style={{width: '100%'}}>
                      <Text style={styles.orderDetailServicesListDesc}>
                        {item.message}
                      </Text>
                    </View>

                    {item.attachments.length >= 1 && (
                      <View style={styles.orderDetailServicesListHeader}>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            width:"60%",
                          }}>
                          <FlatList
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            data={item.attachments}
                            keyExtractor={(x, i) => i.toString()}
                            renderItem={({item, index}) => (
                              <Image
                                style={
                                  styles.availableTaskDetailTaskHistoryFileImage
                                }
                                source={require('../../../assets/images/file.png')}
                              />
                            )}
                          />
                        </View>
                        <View style={{width: '20%'}}>
                          <Text
                            onPress={() => getAttachmentLink(item.comments_id)}
                            style={
                              styles.availableTaskDetailTaskHistoryDownload
                            }>
                            {constant.availableTaskDetailDownload}
                          </Text>
                        </View>
                      </View>
                    )}
                    {item.message_type == 'final' && (
                      <FormButton
                        buttonTitle={constant.availableTaskDetailFinalPackage}
                        backgroundColor={'#6366F1'}
                        textColor={'#fff'}
                        iconName={'bell'}
                      />
                    )}
                  </View>
                )}
              />
            </View>
          </>
        )}
        <View style={{height: 20}} />
        {data.task_status != 'cancelled' &&
        data.task_status != 'completed' ? (
          <View style={styles.availableTaskDetailDocumentsView}>
            <Text style={styles.orderDetailServicesHeading}>
              {constant.availableTaskDetailTaskDocuments}
            </Text>
            {userDetail.user_type == 'sellers' && (
              <>
                <TouchableOpacity
                  onPress={() => setSendingStatus('revision')}
                  style={styles.orderDetailRatingView}>
                  <View
                    style={[
                      styles.availableTaskDetailSelectedCircle,
                      {
                        backgroundColor:
                          sendingStatus == 'revision' ? '#22C55E' : '#fff',
                      },
                    ]}>
                    <View
                      style={styles.orderDetailSelectPlanCheckInnerCircle}
                    />
                  </View>

                  <Text style={styles.availableTaskDetailDocumentsStatus}>
                    {constant.availableTaskDetailRevision}
                  </Text>
                </TouchableOpacity>
                <View style={{height: 10}} />
                <TouchableOpacity
                  onPress={() => setSendingStatus('final')}
                  style={styles.orderDetailRatingView}>
                  <View
                    style={[
                      styles.availableTaskDetailSelectedCircle,
                      {
                        backgroundColor:
                          sendingStatus == 'final' ? '#22C55E' : '#fff',
                      },
                    ]}>
                    <View
                      style={styles.orderDetailSelectPlanCheckInnerCircle}
                    />
                  </View>

                  <Text style={styles.availableTaskDetailDocumentsStatus}>
                    {constant.availableTaskDetailFinalAttempt}
                  </Text>
                </TouchableOpacity>
              </>
            )}
            <View style={{height: 170, marginVertical: 10, width: '100%'}}>
              <View style={styles.MultiLineTextFieldView}>
                <TextInput
                  style={styles.MultiLineTextField}
                  value={description}
                  onChangeText={body => setDescription(body)}
                  placeholder={constant.availableTaskDetailDescription}
                  placeholderTextColor="#767676"
                  multiline={true}
                  underlineColorAndroid="transparent"
                />
              </View>
            </View>

            <Text style={styles.identityDownloadsImageText}>
              {constant.availableTaskDetailUpload}
            </Text>
            <View style={styles.ImagePickView}>
              <Image
                resizeMode="contain"
                style={styles.ImagePickPlacholder}
                source={require('../../../assets/images/PlaceholderImage.png')}
              />
              <View style={styles.ImagePickTextView}>
                <Text
                  onPress={() => pickDocumentfromDevice()}
                  style={styles.ImagePickBlueText}>
                  {constant.availableTaskDetailClickHere}{" "}
                </Text>
                <Text style={styles.ImagePickText}>
                  {constant.availableTaskDetailUploadPhoto}
                </Text>
              </View>
              <Text style={styles.ImagePickTextDescription}>
                {constant.availableTaskDetailText}
              </Text>
            </View>
            <View style={{width: '100%'}}>
              <FlatList
                data={docArray}
                keyExtractor={(x, i) => i.toString()}
                extraData={refreshList}
                renderItem={({item, index}) => (
                  <View style={styles.availableTaskPickDocView}>
                    <View style={styles.selectedDocTitleParentStyle}>
                      <View style={{width: '80%'}}>
                        <Text
                          numberOfLines={1}
                          style={styles.selectedDocTitleTextStyle}>
                          {item.name}
                        </Text>
                        <Text style={styles.selectedDocSizeTextStyle}>
                          {(item.size / 1024).toFixed(2)} KB
                        </Text>
                      </View>
                      <Feather
                        onPress={() => removeDocument(index)}
                        name={'trash-2'}
                        size={18}
                        color={'#EF4444'}
                      />
                    </View>
                  </View>
                )}
              />
            </View>

            <FormButton
              onPress={() => updateActivities()}
              buttonTitle={constant.Submit}
              backgroundColor={CONSTANT.primaryColor}
              textColor={'#fff'}
            />
          </View>
        ) : null}
      </ScrollView>}
      <RBSheet
        ref={RBSheetCreateDisputeAndRefund}
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
              {constant.availableTaskDetailReplyDispute}
            </Text>
            <Feather
              onPress={() => RBSheetCreateDisputeAndRefund.current.close()}
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
              {constant.availableTaskDetailIssue}
            </Text>
            <FlatList
              showsVerticalScrollIndicator={false}
              data={disputeIssue}
              keyExtractor={(x, i) => i.toString()}
              renderItem={({item, index}) => (
                <TouchableOpacity
                  onPress={() =>
                    setSelectedIssue(selectedIssue == index ? null : index)
                  }
                  style={{
                    flexDirection: 'row',
                    marginVertical: 5,
                  }}>
                  <View
                    style={[
                      styles.availableTaskDetailSelectedCircle,
                      {
                        backgroundColor:
                          selectedIssue == index ? '#295FCC' : '#fff',
                      },
                    ]}>
                    <View
                      style={styles.orderDetailSelectPlanCheckInnerCircle}
                    />
                  </View>

                  <Text style={styles.availableTaskDetailDocumentsStatus}>
                    {item.val}
                  </Text>
                </TouchableOpacity>
              )}
            />

            <View style={{height: 170, marginVertical: 10, width: '100%'}}>
              <View style={styles.MultiLineTextFieldView}>
                <TextInput
                  style={styles.MultiLineTextField}
                  value={description}
                  onChangeText={body => setDescription(body)}
                  placeholder={constant.availableTaskDetailDisputeDetails}
                  placeholderTextColor="#888888"
                  multiline={true}
                  underlineColorAndroid="transparent"
                />
              </View>
            </View>

            <FormButton
              onPress={() => createDispute()}
              buttonTitle={constant.Submit}
              backgroundColor={CONSTANT.primaryColor}
              textColor={'#fff'}
            />
          </ScrollView>
        </View>
      </RBSheet>
      <RBSheet
        ref={RBSheetOrderStatus}
        height={Dimensions.get('window').height * 0.66}
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
              {data.task_title}
            </Text>
            <Feather
              onPress={() => RBSheetOrderStatus.current.close()}
              style={styles.RBSheetCloseIconStyle}
              name={'x'}
              size={20}
              color={'#1C1C1C'}
            />
          </View>

          <ScrollView
            style={{paddingHorizontal: 20, paddingVertical: 10}}
            showsVerticalScrollIndicator={false}>
            <Text style={styles.taskDetailStatusTextHeading}>
              {constant.availableTaskDetailFeedback}
            </Text>
            <FormInput
              labelValue={title}
              onChangeText={title => setTitle(title)}
              placeholderText={constant.availableTaskDetailFeedback}
              autoCorrect={false}
            />
            <Text style={styles.taskDetailStatusTextHeading}>
              {constant.availableTaskDetailRating}
            </Text>
            <View style={styles.availableTaskRatingConatiner}>
              <View style={{width: '50%'}}>
                <StarRating
                  disabled={false}
                  maxStars={5}
                  starSize={22}
                  fullStarColor={'#fecb02'}
                  emptyStarColor={'#fecb02'}
                  rating={ratings}
                  selectedStar={rating => setRatings(rating)}
                />
              </View>
            </View>
            <Text style={styles.taskDetailStatusTextHeading}>
              {constant.availableTaskDetailAddFeedback}
            </Text>
            <View style={styles.availableTaskFeedBackView}>
              <View style={styles.MultiLineTextFieldView}>
                <TextInput
                  style={styles.MultiLineTextField}
                  value={feedback}
                  onChangeText={body => setFeedback(body)}
                  placeholder={constant.availableTaskDetailFeedbackPlaceholder}
                  placeholderTextColor="#888888"
                  multiline={true}
                  underlineColorAndroid="transparent"
                />
              </View>
            </View>

            <FormButton
              onPress={() => completeStatusTask()}
              buttonTitle={constant.Submit}
              backgroundColor={'#22C55E'}
              textColor={'#fff'}
            />
          </ScrollView>
        </View>
      </RBSheet>
      <RBSheet
        ref={RBSheetOrderCancelStatus}
        height={Dimensions.get('window').height * 0.4}
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
              {data.task_title}
            </Text>
            <Feather
              onPress={() => RBSheetOrderCancelStatus.current.close()}
              style={styles.RBSheetCloseIconStyle}
              name={'x'}
              size={20}
              color={'#1C1C1C'}
            />
          </View>
          <ScrollView
            style={{paddingHorizontal: 20, paddingVertical: 10}}
            showsVerticalScrollIndicator={false}>
            <View style={{height: 170, marginVertical: 10, width: '100%'}}>
              <View style={styles.MultiLineTextFieldView}>
                <TextInput
                  style={styles.MultiLineTextField}
                  value={description}
                  onChangeText={body => setDescription(body)}
                  placeholder={constant.availableTaskDetailDisputeDetails}
                  placeholderTextColor="#888888"
                  multiline={true}
                  underlineColorAndroid="transparent"
                />
              </View>
            </View>

            <FormButton
              onPress={() => cancelStatusTask()}
              buttonTitle={constant.availableTaskDetailCancelTask}
              backgroundColor={'#22C55E'}
              textColor={'#fff'}
            />
          </ScrollView>
        </View>
      </RBSheet>
    </SafeAreaView>
  );
};

export default AvailableTaskDetail;
