import {
  View,
  Text,
  SafeAreaView,
  ImageBackground,
  TextInput,
  ScrollView,
  Image,
  FlatList,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
  Dimensions,
  Alert,
} from 'react-native';
import React, {useState, useEffect, useRef} from 'react';
import Feather from 'react-native-vector-icons/Feather';
import Header from '../../components/Header';
import {useSelector, useDispatch} from 'react-redux';
import styles from '../../style/styles.js';
import {useNavigation} from '@react-navigation/native';
import {decode} from 'html-entities';
import constant from '../../constants/translation';
import FormButton from '../../components/FormButton';
import * as CONSTANT from '../../constants/globalConstants';
import RNFetchBlob from 'rn-fetch-blob';
import Spinner from 'react-native-loading-spinner-overlay';
import DocumentPicker from 'react-native-document-picker';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Dialog, {
  DialogFooter,
  DialogButton,
  DialogContent,
  DialogTitle,
} from 'react-native-popup-dialog';
import axios from 'axios';
import RBSheet from 'react-native-raw-bottom-sheet';
import {useIsFocused} from '@react-navigation/native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import FormInput from '../../components/FormInput';
import StarRating from 'react-native-star-rating';

const EmpProjectActivity = ({route, navigation}) => {
  const navigationforword = useNavigation();
  const settings = useSelector(state => state.setting.settings);
  let projectData = route.params.item;
  const [show, setShow] = useState(false);
  const [emptyTask, setEmptyTask] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [escrowAmmount, setEscrowAmmount] = useState('0');
  const [totalAmount, setTotalAmount] = useState('0');
  const [remaining, setRemaining] = useState('0');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [declineResone, setDeclineResone] = useState('');
  const [disputeDetails, setDisputeDetails] = useState('');
  const [selectedItem, setSelectedItem] = useState([route.params.indexItem]);
  const token = useSelector(state => state.value.token);
  const userDetail = useSelector(state => state.value.userInfo);
  const wallet = useSelector(state => state.value.wallet);
  const [invoicePath, setInvoicePath] = useState('');
  const [selectedMilestoneIndex, setSelectedMilestoneIndex] = useState(null);
  const [loader, setLoader] = useState(false);
  const [loading, setloading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [docArray, setDocArray] = useState([]);
  const [refreshList, setRefreshList] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [visible, setVisible] = useState(false);
  const [walletDialoge, setWalletDialoge] = useState(false);
  const [disputeIssue, setDisputeIssue] = useState([]);
  const [addNewMilstone, setAddNewMilstone] = useState([]);
  const [completedMileStone, setCompletedMileStone] = useState([]);
  const [mileStoneData, setMileStoneData] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [declineItem, setDeclineItem] = useState('');
  const [declineIndex, setDeclineIndex] = useState('');
  const [declineType, setDeclineType] = useState('');
  const [disable, setDisable] = useState(false);
  const [disputeTerms, setDisputeTerms] = useState('');
  const [escrowKey, setEscrowKey] = useState('');
  const [payWithWallet, setPayWithWallet] = useState(true);
  const [completeContract, setCompleteContract] = useState(false);
  const [ratings, setRatings] = useState(null);
  const [withRating, setWithRating] = useState('');
  const [feedback, setFeedback] = useState('');
  const RBSheetCreateDisputeAndRefund = useRef();
  const RBSheetCreateMileStone = useRef();
  const RBSheetDeclineMilestone = useRef();
  const RBSheetOrderStatus = useRef();
  const isFocused = useIsFocused();
  useEffect(() => {
    if (isFocused) {
      getUpdatedAmounts();
      completedMileStone.length = 0;
      mileStoneData.length = 0;
      if (selectedItem[0].hasOwnProperty('completed_mil_array')) {
        Object.values(selectedItem[0].completed_mil_array).forEach(val => {
          completedMileStone.push(val);
        });
      }
      if (selectedItem[0].hasOwnProperty('milestone')) {
        Object.entries(selectedItem[0].milestone).forEach(([key, value]) =>
          mileStoneData.push({
            key: key,
            value: value,
          }),
        );
      }
      if (selectedItem[0].hasOwnProperty('complete_option')) {
        setCompleteContract(true);
      }
    }
  }, [isFocused, selectedItem]);
  let commentProposalArray = [];
  let invoiceListArray = [];

  selectedItem.forEach(item => {
    item.proposal_comments.forEach(ele => commentProposalArray.push(ele));
    item.invoices_list.forEach(ele => invoiceListArray.push(ele));
  });

  if (userDetail.user_type == 'buyers') {
    var newProposalData = projectData.proposals.filter(item => {
      return item.proposal_status != 'publish';
    });
  }
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
  const removeDocument = index => {
    docArray.splice(index, 1);
    setRefreshList(!refreshList);
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
  const downloadInvoice = item => {
    setLoader(true);
    fetch(
      CONSTANT.BaseUrl +
        'get-invoice?post_id=' +
        userDetail.profile_id +
        '&order_id=' +
        item.order_id,
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
          setInvoicePath(responseJson.invoice_detail.file_path);
          checkPermission(
            responseJson.invoice_detail.file_url,
            responseJson.invoice_detail.file_path,
          );
        }
        setLoader(false);
      })
      .catch(error => {
        setLoader(false);
        console.error(error);
      });
  };

  const checkPermission = async (link, path) => {
    if (Platform.OS === 'ios') {
      setLoader(false);
      downloadMedia(link, path);
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
          downloadMedia(link, path);
        } else {
          Alert.alert(constant.invoiceAlertPermission);
        }
      } catch (error) {
        console.warn(error);
      }
    }
  };
  const downloadMedia = (link, path) => {
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
        //  removeInvoicePDF(path)
        console.log('Success', res);
        if (Platform.OS === 'ios') {
          RNFetchBlob.ios.openDocument(res.data);
        }
      });
  };
  const addComment = () => {
    setLoader(true);
    const formData = new FormData();
    formData.append('post_id', userDetail.profile_id);
    formData.append('id', selectedItem[0].proposal_id);
    formData.append('activity_detail', description);
    // formData.append('message_type', sendingStatus);
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
        setDescription('');
        getAvailableTask();
        // Alert.alert(constant.availableTaskDetail, constant.MessageSuccessfuly);
        // navigation.goBack();
      })
      .catch(error => {
        setLoader(false);
        console.log(error);
      });
  };
  const getSingleProject = value => {
    setloading(true);
    axios
      .get(CONSTANT.BaseUrl + 'projects/get_projects', {
        params: {
          type: 'single',
          project_id: value,
        },
      })
      .then(async response => {
        if (response.status == 200) {
          setloading(false);
          navigationforword.navigate('projectDetails', {
            item: response.data.projects[0],
          });
        } else if (response.data.type == 'error') {
          setloading(false);

          Alert.alert(constant.OopsText, response.data.message_desc);
        }
      })
      .catch(error => {
        setloading(false);
        console.log(error);
      });
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
        setVisible(false);

        setLoader(false);
        if (userDetail.user_type == 'sellers') {
          setDisputeIssue(responseJson.seller_project_dispute_issues);
        } else {
          setDisputeIssue(responseJson.buyer_project_dispute_issues);
        }
        RBSheetCreateDisputeAndRefund.current.open();
      })
      .catch(error => {
        setLoader(false);
        console.error(error);
      });
  };
  const handelAddMilstone = () => {
    addNewMilstone.push({
      price: '',
      title: '',
      detail: '',
      status: '',
    });
    setRefreshList(!refreshList);
  };
  const removeMileStone = index => {
    addNewMilstone.splice(index, 1);
    setRefreshList(!refreshList);
  };
  const openMileStone = () => {
    setAddNewMilstone([]);
    setVisible(false), RBSheetCreateMileStone.current.open();
  };
  const createDispute = () => {
    setLoader(true);
    RBSheetCreateDisputeAndRefund.current.close();
    // if ((selectedIssue != null || description != '', disputeTerms != '')) {
    axios
      .post(
        CONSTANT.BaseUrl + 'create-project-dispute',
        {
          user_id: userDetail.user_id,
          post_id: userDetail.profile_id,
          proposal_id: selectedItem[0].proposal_id,
          dispute_issue: disputeIssue[selectedIssue].key,
          dispute_details: description,
          dispute_terms: disable ? 'on' : '',
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

  const changePrice = (txt, index) => {
    addNewMilstone[index].price = txt;
    setRefreshList(!refreshList);
  };
  const changeTitle = (txt, index) => {
    addNewMilstone[index].title = txt;
    setRefreshList(!refreshList);
  };
  const changeDecription = (txt, index) => {
    addNewMilstone[index].detail = txt;
    setRefreshList(!refreshList);
  };

  const handelAddNewMileStone = () => {
    setloading(true);
    let mileStoneObject = {};
    for (let i = 0; i < addNewMilstone.length; i++) {
      const string = Math.random().toString(36).substring(2, 12);
      mileStoneObject[string] = addNewMilstone[i];
    }

    axios
      .post(
        CONSTANT.BaseUrl + 'update-milestone',
        {
          user_id: userDetail.user_id,
          post_id: userDetail.profile_id,
          proposal_id: selectedItem[0].proposal_id,
          milestone: mileStoneObject,
        },
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        },
      )
      .then(async response => {
        setloading(false);
        if (response.data.type == 'success') {
          Alert.alert('Success', response.data.message_desc);
          Object.entries(mileStoneObject).forEach(([key, value]) =>
            mileStoneData.push({
              key: key,
              value: value,
            }),
          );
          setRefreshList(!refreshList);
          setloading(false);
        } else if (response.data.type == 'error') {
          setloading(false);
          Alert.alert('Oops', response.data.message_desc);
        }
        RBSheetCreateMileStone.current.close();
      })
      .catch(error => {
        setLoader(false);
        console.log(error);
      });
  };
  const opneDeclinedRbSheet = (item, index) => {
    RBSheetDeclineMilestone.current.open();
    setDeclineItem(item);
    setDeclineIndex(index);
  };
  const updateMileStoneStatus = (item, index, type, description) => {
    setSelectedIndex(index);
    setloading(true);
    axios
      .post(
        CONSTANT.BaseUrl + 'update-milestone-status',
        {
          user_id: userDetail.user_id,
          post_id: userDetail.profile_id,
          id: selectedItem[0].proposal_id,
          key: item.key,
          status: type,
          decline_reason: description,
        },
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        },
      )
      .then(async response => {
        if (response.data.type == 'success') {
          setloading(false);
          // if (type == 'requested') {
          //   item.value.status = 'requested';
          //   setRefreshList(!refreshList);
          // } else if (type == 'completed') {
          //   item.value.status = 'completed';
          //   completedMileStone.push(item.value);
          //   mileStoneData.splice(index, 1);
          //   setRefreshList(!refreshList);
          if (type == 'decline') {
            // item.value.status = 'decline';
            // item.value.decline_reason = description;
            RBSheetDeclineMilestone.current.close();
            setRefreshList(!refreshList);
          }

          getUpdatedAmounts();
          Alert.alert('Success', response.data.message_desc);
          // setLoader(false);
        } else if (response.data.type == 'error') {
          setloading(false);
          Alert.alert('Oops', response.data.message_desc);
        }
      })
      .catch(error => {
        setLoader(false);
        console.log(error);
      });
  };
  const openWallet = (item, index) => {
    setSelectedMilestoneIndex(index);
    setEscrowKey(item.key);
    setWalletDialoge(true);
  };

  const openCompeteContractSheet = () => {
    setVisible(false);
    RBSheetOrderStatus.current.open();
  };
  const completeProjectContract = val => {
    RBSheetOrderStatus.current.close();

    setLoader(true);
    axios
      .post(
        CONSTANT.BaseUrl + 'complete-project',
        {
          post_id: userDetail.profile_id,
          proposal_id: selectedItem[0].proposal_id,
          user_id: userDetail.user_id,
          type: val == true ? 'rating' : '',
          rating: ratings,
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
          selectedItem[0].proposal_status = 'completed';
          setFeedback('');
          setTitle('');
          setRatings(null);
          setWithRating('');
          // setLoader(false);
        } else if (response.data.type == 'error') {
          // setLoader(false);
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
    setWalletDialoge(false);
    axios
      .post(
        CONSTANT.BaseUrl + 'order-project',
        {
          post_id: userDetail.profile_id,
          project_id: projectData.project_id,
          wallet: val,
          key: escrowKey,
          proposal_id: selectedItem[0].proposal_id,
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
          setWalletDialoge(false);
          if (val == true) {
            Alert.alert('Success', response.data.message_desc);
            getUpdatedAmounts();
          } else {
            navigation.navigate('checkout', {link: response.data.checkout_url});
          }
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
  const getUpdatedAmounts = () => {
    axios
      .post(
        CONSTANT.BaseUrl + 'activity-amounts',
        {
          post_id: userDetail.profile_id,
          user_id: userDetail.user_id,
          proposal_id: selectedItem[0].proposal_id,
        },
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        },
      )
      .then(async response => {
        setEscrowAmmount(response.data.hired_balance);
        setTotalAmount(response.data.earned_balance);
        setRemaining(response.data.remaning_balance);
        completedMileStone.length = 0;
        mileStoneData.length = 0;
        if (response.data.hasOwnProperty('completed_mil_array')) {
          Object.values(response.data.completed_mil_array).forEach(val => {
            completedMileStone.push(val);
          });
        }
        if (response.data.hasOwnProperty('mileastone_array')) {
          Object.entries(response.data.mileastone_array).forEach(
            ([key, value]) =>
              mileStoneData.push({
                key: key,
                value: value,
              }),
          );
        }
        setRefreshList(!refreshList);
      })
      .catch(error => {
        setLoader(false);
        console.log(error);
      });
  };
  const getDisputes = id => {
  
    fetch(
      CONSTANT.BaseUrl +
        'get-disputes?post_id=' +
        userDetail.profile_id +
        '&type=single&proposal_id=' +
        selectedItem[0].proposal_id +
        '&user_id=' +
        userDetail.user_id,
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
        navigation.navigate('disputesDetail', {
          item: responseJson[0],
          ProjectType: true,
        });
      })
      .catch(error => {
        setLoader(false);
        console.error(error);
      });
  };
  return (
    <SafeAreaView style={styles.globalContainer}>
      <Header
        title={constant.empProjectActivityHeader}
        titleColor={'#1C1C1C'}
        backColor={'#F7F7F7'}
        iconColor={'#1C1C1C'}
        backIcon={true}
      />
      {loader && <Spinner visible={true} color={'#000'} />}
      <ScrollView showsVerticalScrollIndicator={false}>
        <>
          <View style={styles.ProjectDetailsContainer}>
            <View
              style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <View style={{flexDirection: 'row'}}>
                {projectData.type_text == 'hourly' ? (
                  <View style={styles.empProjectDetailsHourly}>
                    <Text style={styles.ProjectDetailsHourlyText}>
                      {constant.projectActivityHourlyProject}
                    </Text>
                  </View>
                ) : (
                  <View
                    style={[
                      styles.ProjectDetailsFixed,
                      {justifyContent: 'center', alignItems: 'center'},
                    ]}>
                    <Text
                      style={styles.ProjectDetailsFiexdText}>
                      {constant.projectActivityFixedPriceProject}
                    </Text>
                  </View>
                )}
                {userDetail.user_type == 'sellers'
                  ? selectedItem.is_featured == 'yes' && (
                      <View
                        style={[
                          styles.taskFeaturedBadgeParent,
                          {marginLeft: 10},
                        ]}>
                        <Text style={styles.taskFeaturedTextStyle}>
                          {constant.Featured}
                        </Text>
                      </View>
                    )
                  : projectData.is_featured == 'yes' && (
                      <View
                        style={[
                          styles.taskFeaturedBadgeParent,
                          {marginLeft: 10},
                        ]}>
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
                {userDetail.user_type == 'sellers'
                  ? decode(projectData.project_detail.title)
                  : decode(projectData.title)}
              </Text>
            </View>
            {userDetail.user_type == 'sellers'
              ? show && (
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
                          {projectData.project_detail.posted_time}
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
                          {projectData.project_detail.location_text}
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
                          {projectData.project_detail.expertise_level[0].name}
                        </Text>
                      </View>
                    </View>
                    <View style={{paddingVertical: 10}}>
                      <FormButton
                        buttonTitle={'Project details'}
                        backgroundColor={CONSTANT.primaryColor}
                        textColor={'#FFFFFF'}
                        loader={loading}
                        onPress={() =>
                          getSingleProject(
                            projectData.project_detail.project_id,
                          )
                        }
                      />
                      {/* <View
                        style={{
                          // backgroundColor: '#F7F7F7',
                          alignItems: 'center',
                          justifyContent: 'center',
                          paddingVertical: 10,
                        }}>
                        <Text style={styles.ProjectCardListEidtBtn}>
                          Edit projects
                        </Text>
                      </View> */}
                    </View>
                  </>
                )
              : show && (
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
                          {projectData.posted_time}
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
                          {projectData.location_text}
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
                          {projectData.expertise_level[0].name}
                        </Text>
                      </View>
                    </View>
                    <View style={{paddingVertical: 10}}>
                      <FormButton
                        buttonTitle={'View All porposlas'}
                        backgroundColor={CONSTANT.primaryColor}
                        textColor={'#FFFFFF'}
                        // loader={loader}
                        onPress={() =>
                          navigationforword.navigate('proposalListing', {
                            item: projectData,
                            // indexItem: item,
                          })
                        }
                      />
                      {/* <View
                        style={{
                          // backgroundColor: '#F7F7F7',
                          alignItems: 'center',
                          justifyContent: 'center',
                          paddingVertical: 10,
                        }}>
                        <Text style={styles.ProjectCardListEidtBtn}>
                          Edit projects
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
        {userDetail.user_type == 'buyers' ? (
          <>
            {/* {projectData.proposal_status == "disputed" && */}
            {selectedItem[0].proposal_status == 'disputed' && (
              <FlatList
                showsVerticalScrollIndicator={false}
                data={selectedItem[0].dispute_messages}
                keyExtractor={(x, i) => i.toString()}
                renderItem={({item, index}) => (
                  <View style={styles.empProjectActivityContainer}>
                    <View
                      style={[
                        styles.empProjectActivityView,
                        {
                          backgroundColor: '#e15b001a',
                          borderColor: '#ff5b0045',
                          padding: 15,
                          alignItems: 'flex-start',
                        },
                      ]}>
                      <Text style={styles.empAllProjectsHeading}>
                        {item.title}
                      </Text>
                      <Text style={styles.myProjectDetailsRoadeMapText}>
                        {item.message}
                      </Text>
                      <TouchableOpacity
                        onPress={() =>
                          item.type == 'create_dispute_admin'
                            ? getDisputeIssues()
                            : getDisputes()
                        }
                        style={{
                          backgroundColor: '#ff5b00',
                          paddingHorizontal: 15,
                          paddingVertical: 10,
                        }}>
                        <Text
                          style={{
                            fontFamily: 'Urbanist-Bold',
                            fontSize: 16,
                            letterSpacing: 0.5,
                            color: '#fff',
                          }}>
                          {item.type == 'create_dispute_admin'
                            ? constant.projectActivityCreateDispute
                            : constant.projectActivityViewDetail}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              />
            )}
          </>
        ) : (
          <>
            {projectData.proposal_status == 'disputed' && (
              <View style={styles.empProjectActivityContainer}>
                <View
                  style={[
                    styles.empProjectActivityView,
                    {
                      backgroundColor: '#e15b001a',
                      borderColor: '#ff5b0045',
                      padding: 15,
                      alignItems: 'flex-start',
                    },
                  ]}>
                  <Text style={styles.empAllProjectsHeading}>
                    {projectData.dispute_messages[0].title}
                  </Text>
                  <Text style={styles.myProjectDetailsRoadeMapText}>
                    {projectData.dispute_messages[0].message}
                  </Text>
                  <TouchableOpacity
                    onPress={() => getDisputes()}
                    style={{
                      backgroundColor: '#ff5b00',
                      paddingHorizontal: 15,
                      paddingVertical: 10,
                    }}>
                    <Text
                      style={{
                        fontFamily: 'Urbanist-Bold',
                        fontSize: 16,
                        letterSpacing: 0.5,
                        color: '#fff',
                      }}>
                      {/* {projectData.dispute_type == 'Refund requested'
                        ? constant.projectActivityCreateDispute
                        : constant.projectActivityViewDetail} */}
                      {constant.projectActivityViewDetail}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </>
        )}
        {userDetail.user_type == 'buyers' && newProposalData.length != 0 && (
          <View style={styles.empProjectActivityContainer}>
            <View style={styles.empProjectActivityView}>
              <View style={styles.empProjectActivity}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                  <Text style={styles.empAllProjectsHeading}>
                    {constant.buyerProjectCardHiredFreelancers}
                    <Text style={styles.empAllProjectsNo}>
                      {'  '} ({newProposalData.length})
                    </Text>
                  </Text>

                  <View>
                    <Feather
                      name={'chevron-down'}
                      size={18}
                      color={'#999999'}
                      style={styles.ProjectDetailsPropertyListIcon}
                    />
                  </View>
                </View>
              </View>

              <FlatList
                showsVerticalScrollIndicator={false}
                data={newProposalData}
                keyExtractor={(x, i) => i.toString()}
                renderItem={({item, index}) => (
                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      width: '100%',
                      paddingVertical: 10,
                      paddingHorizontal: 15,
                    }}
                    onPress={() => setSelectedItem([item])}>
                    <View style={{width: '15%', justifyContent: 'center'}}>
                      <Image
                        style={styles.empProjectCardFreelancerImgList}
                        source={{uri: item.seller_detail.avatar}}
                      />
                    </View>

                    <View
                      style={[
                        styles.empProjectActivityListView,
                        {paddingLeft: 5, alignItems: 'flex-start'},
                      ]}>
                      <Text style={styles.empProjectActivityListText}>
                        {item.seller_detail.user_name}
                      </Text>
                      <View
                        style={[
                          styles.empProjectActivityListStatus,
                          {
                            backgroundColor:
                              item.proposal_status == 'hired'
                                ? '#F97316'
                                : item.proposal_status == 'completed'
                                ? '#22C55E'
                                : item.proposal_status == 'disputed'
                                ? '#64748B'
                                : '#EF4444',
                          },
                        ]}>
                        <Text style={styles.empProjectActivityListStatusText}>
                          {item.proposal_status == 'hired'
                            ? constant.buyerProjectCardOngoing
                            : item.proposal_status == 'completed'
                            ? constant.buyerProjectCardCompleted
                            : item.proposal_status == 'disputed'
                            ? constant.projectActivityDisputed
                            : constant.projectActivityDeclined}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        )}
        <View
          style={{
            borderTopWidth: 1,
            borderColor: '#DDDDDD',
            width: '100%',
            marginTop: 20,
          }}
        />
        <View
          style={{
            paddingHorizontal: 15,
            paddingVertical: 15,
          }}>
          <View
            style={{
              flexDirection: 'row',
              width: '100%',
              justifyContent: 'space-between',
            }}>
            <View
              style={{
                flexDirection: 'row',
                width: '45%',
                justifyContent: 'space-between',
                // alignItems: 'center',
              }}>
              <View>
                <Image
                  style={styles.empProjectCardFreelancerImg}
                  source={{
                    uri:
                      userDetail.user_type == 'buyers'
                        ? selectedItem[0].seller_detail.avatar
                        : projectData.project_detail.avatar,
                  }}
                />
              </View>
              <View
                style={[
                  styles.empProjectActivityListView,
                  {paddingLeft: 10, alignItems: 'flex-start'},
                ]}>
                <View
                  style={[
                    styles.empProjectActivityListStatus,
                    {
                      backgroundColor:
                        selectedItem[0].proposal_status == 'hired'
                          ? '#F97316'
                          : selectedItem[0].proposal_status == 'completed'
                          ? '#22C55E'
                          : selectedItem[0].proposal_status == 'disputed'
                          ? '#64748B'
                          : '#EF4444',
                    },
                  ]}>
                  <Text style={styles.empProjectActivityListStatusText}>
                    {selectedItem[0].proposal_status == 'hired'
                      ? 'Ongoing'
                      : selectedItem[0].proposal_status == 'completed'
                      ? 'Completed'
                      : selectedItem[0].proposal_status == 'disputed'
                      ? 'Disputed'
                      : 'Declined'}
                  </Text>
                </View>
                <Text style={styles.empProjectActivityListText}>
                  {userDetail.user_type == 'buyers'
                    ? selectedItem[0].seller_detail.user_name
                    : projectData.project_detail.user_name}
                </Text>
              </View>
            </View>
            {selectedItem[0].proposal_status != 'disputed' &&
              selectedItem[0].proposal_status != 'completed' && (
                <View>
                  <Feather
                    name={'more-horizontal'}
                    size={20}
                    color={'#1C1C1C'}
                    onPress={() => setVisible(true)}
                  />
                </View>
              )}
          </View>
          <View>
            <Text style={styles.empProjectActivityRate}>
              {decode(selectedItem[0].proposal_price_formate)}
            </Text>
            {/* <Text style={styles.empProjectActivityHours}>
              06 daily proposed hours
            </Text> */}
          </View>
        </View>
        <View
          style={{
            borderTopWidth: 1,
            borderColor: '#DDDDDD',
            width: '100%',
          }}
        />
        {selectedItem[0].proposal_type == 'milestone' && (
          <View
            style={[
              styles.myProjectDetailsUserConatiner,
              {backgroundColor: '#F7F7F7', paddingBottom: 20},
            ]}>
            <View style={styles.myProjectDetailsEarnigs}>
              <View style={styles.myProjectDetailsEarnigsView}>
                <View style={styles.myProjectDetailsEarnigsViewIcon}>
                  <Feather name={'clock'} size={20} color={'#6366F1'} />
                </View>
                <View style={styles.myProjectDetailsEarnigsViewDetails}>
                  <Text style={styles.myProjectDetailsEarnigsTitle}>
                    {constant.projectActivityTotalEscrowAmount}
                  </Text>
                  <Text style={styles.myProjectDetailsEarnigsAmount}>
                    {decode(settings.price_format.symbol)}
                    {parseInt(escrowAmmount).toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.myProjectDetailsEarnigsSecond}>
              <View style={styles.myProjectDetailsEarnigsView}>
                <View style={styles.myProjectDetailsEarnigsViewIconSecond}>
                  <Feather name={'calendar'} size={20} color={'#F44336'} />
                </View>
                <View style={styles.myProjectDetailsEarnigsViewDetails}>
                  <Text style={styles.myProjectDetailsEarnigsTitle}>
                    {userDetail.user_type == 'sellers'
                      ? constant.projectActivityTotalEarnedAmount
                      : constant.projectActivityTotalAmountSpent}
                  </Text>
                  <Text style={styles.myProjectDetailsEarnigsAmount}>
                    {decode(settings.price_format.symbol)}
                    {parseInt(totalAmount).toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.myProjectDetailsEarnigsThird}>
              <View style={styles.myProjectDetailsEarnigsView}>
                <View style={styles.myProjectDetailsEarnigsViewIconThird}>
                  <Feather name={'dollar-sign'} size={20} color={'#FCCF14'} />
                </View>
                <View style={styles.myProjectDetailsEarnigsViewDetails}>
                  <Text style={styles.myProjectDetailsEarnigsTitle}>
                    {constant.projectActivityRemainingBudget}
                  </Text>
                  <Text style={styles.myProjectDetailsEarnigsAmount}>
                    {decode(settings.price_format.symbol)}
                    {parseInt(remaining).toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}
        {selectedItem[0].proposal_type == 'milestone' && (
          <>
            <TouchableOpacity
              onPress={() =>
                activeIndex == 1 ? setActiveIndex(0) : setActiveIndex(1)
              }
              style={styles.myProjectDetailsRoadMap}>
              <View style={styles.myProjectDetailsTimeCardActivityView}>
                <View style={{justifyContent: 'center', alignItems: 'center'}}>
                  <Feather name={'clock'} size={20} color={'#1C1C1C'} />
                </View>

                <Text style={styles.myProjectDetailsTimeCardActivityTitle}>
                  {constant.projectActivityProjectRoadmap}
                </Text>
              </View>
              <Feather
                name={activeIndex == 1 ? 'minus' : 'plus'}
                size={20}
                color={'#1C1C1C'}
              />
            </TouchableOpacity>
            {activeIndex == 1 && (
              <>
                <FlatList
                  showsVerticalScrollIndicator={false}
                  data={mileStoneData}
                  extraData={refreshList}
                  ListEmptyComponent={
                    emptyTask && (
                      <View style={styles.NodataFoundContainer}>
                        <Image
                          resizeMode="contain"
                          style={styles.NodataFoundImg}
                          source={require('../../../assets/images/empty.png')}
                        />
                        <Text style={styles.NodataFoundText}>
                          {constant.NoRecord}
                        </Text>
                      </View>
                    )
                  }
                  keyExtractor={(x, i) => i.toString()}
                  renderItem={({item, index}) => (
                    <View
                      style={[
                        styles.sendProjectConatiner,
                        {marginHorizontal: 15},
                      ]}>
                      <View
                        style={[
                          styles.sendProjectTax,
                          {paddingHorizontal: 20},
                        ]}>
                        {/* {item.status != 'requested' && item.status != '' && ( */}
                        <View
                          style={{
                            // backgroundColor: 'red',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}>
                          <Text style={styles.myProjectDetailsRoadeMapRate}>
                            {item.value.hasOwnProperty('price_format')
                              ? decode(item.value.price_format)
                              : decode(settings.price_format.symbol) +
                                parseInt(item.value.price).toFixed(2)}
                          </Text>
                          <View
                            style={{
                              backgroundColor:
                                userDetail.user_type == 'sellers'
                                  ? item.value.status == 'hired'
                                    ? '#F97316'
                                    : item.value.status == ''
                                    ? '#f7f7f7'
                                    : item.value.status == 'requested'
                                    ? '#64748B'
                                    : '#EF4444'
                                  : item.value.status == 'hired'
                                  ? '#F97316'
                                  : item.value.status == 'decline'
                                  ? '#EF4444'
                                  : null,
                              paddingHorizontal: 10,
                              // width: '30%',
                              alignItems: 'center',
                              marginVertical: 10,
                            }}>
                            <Text
                              style={[
                                styles.ProjectCardListStatus,
                                {
                                  color:
                                    item.value.project_status == 'Draft'
                                      ? '#0A0F26'
                                      : '#FFFFFF',
                                },
                              ]}>
                              {userDetail.user_type == 'sellers'
                                ? item.value.status == 'hired'
                                  ? constant.buyerProjectCardOngoing
                                  : item.value.status == 'requested'
                                  ? constant.projectActivityAwaitingApproval
                                  : item.value.status == 'decline'
                                  ? constant.projectActivityDeclined
                                  : ''
                                : item.value.status == 'hired'
                                ? constant.buyerProjectCardOngoing
                                : item.value.status == 'decline'
                                ? constant.projectActivityDeclined
                                : null}
                            </Text>
                          </View>
                        </View>
                        {/* )} */}

                        <Text style={styles.myProjectDetailsRoadeMapRate}>
                          {item.value.title}
                        </Text>
                        <Text style={styles.myProjectDetailsRoadeMapText}>
                          {item.value.detail}
                        </Text>
                        {item.value.status == 'decline' && (
                          <View style={styles.myProjectDetailsDeclinedView}>
                            <Feather
                              name={'alert-circle'}
                              size={24}
                              color={'#FF6167'}
                              style={styles.ProjectListingPropertyListIcon}
                            />
                            <Text style={styles.ProjectCardListDisputeComment}>
                              {constant.projectActivityReadCommentBelow}
                            </Text>
                            <View
                              style={styles.myProjectDetailsDeclinedDemoView}>
                              <Text
                                style={styles.myProjectDetailsDeclinedDemoText}>
                                {item.value.decline_reason}
                              </Text>
                            </View>
                          </View>
                        )}
                        {selectedItem[0].proposal_status != 'disputed' && (
                          <>
                            {userDetail.user_type == 'buyers' ? (
                              item.value.status == 'requested' ? (
                                <>
                                  <View style={{paddingTop: 10}}>
                                    <FormButton
                                      buttonTitle={
                                        constant.projectActivityApproved
                                      }
                                      backgroundColor={'#22C55E'}
                                      textColor={'#FFFFFF'}
                                      loader={
                                        selectedIndex == index ? loading : null
                                      }
                                      onPress={() =>
                                        updateMileStoneStatus(
                                          item,
                                          index,
                                          'completed',
                                        )
                                      }
                                    />
                                  </View>
                                  <TouchableOpacity
                                    style={{
                                      backgroundColor: '#ffffff',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      paddingVertical: 10,
                                      marginBottom: 10,
                                    }}
                                    onPress={() =>
                                      opneDeclinedRbSheet(item, index)
                                    }>
                                    <Text style={styles.ProjectCardListEidtBtn}>
                                      {constant.projectActivityDeclined}
                                    </Text>
                                  </TouchableOpacity>
                                </>
                              ) : (
                                item.value.status == '' && (
                                  <View style={{paddingTop: 10}}>
                                    <FormButton
                                      buttonTitle={
                                        constant.projectActivityEscrowMilestone
                                      }
                                      backgroundColor={'#295FCC'}
                                      textColor={'#FFFFFF'}
                                      loader={
                                        escrowKey == item.key ? loader : null
                                      }
                                      onPress={() => openWallet(item, index)}
                                    />
                                  </View>
                                )
                              )
                            ) : (
                              (item.value.status == 'hired' ||
                                item.value.status == 'decline') && (
                                <View style={{paddingTop: 10}}>
                                  <FormButton
                                    buttonTitle={
                                      constant.projectActivityMarkCompleted
                                    }
                                    backgroundColor={'#22C55E'}
                                    textColor={'#FFFFFF'}
                                    loader={
                                      selectedIndex == index ? loading : null
                                    }
                                    onPress={() =>
                                      updateMileStoneStatus(
                                        item,
                                        index,
                                        'requested',
                                      )
                                    }
                                  />
                                </View>
                              )
                            )}
                          </>
                        )}
                      </View>
                    </View>
                  )}
                />
                <>
                  {completedMileStone.length != 0 && (
                    <>
                      <View style={{paddingHorizontal: 15, paddingTop: 10}}>
                        <Text
                          style={{
                            fontFamily: 'Urbanist-Bold',
                            fontSize: 18,
                            lineHeight: 26,
                            letterSpacing: 0.5,
                            color: '#1C1C1C',
                          }}>
                          {constant.projectActivityCompletedMilestones}
                        </Text>
                      </View>

                      <FlatList
                        showsVerticalScrollIndicator={false}
                        data={completedMileStone}
                        keyExtractor={(x, i) => i.toString()}
                        extraData={refreshList}
                        renderItem={({item, index}) => (
                          <View
                            style={[
                              styles.sendProjectConatiner,
                              {marginHorizontal: 15},
                            ]}>
                            <View
                              style={[
                                styles.sendProjectTax,
                                {paddingHorizontal: 20},
                              ]}>
                              <View
                                style={{
                                  backgroundColor: '#22C55E',
                                  paddingHorizontal: 10,
                                  width: '30%',
                                  alignItems: 'center',
                                  marginVertical: 10,
                                }}>
                                <Text
                                  style={[
                                    styles.ProjectCardListStatus,
                                    {
                                      color:
                                        item.project_status == 'Draft'
                                          ? '#0A0F26'
                                          : '#FFFFFF',
                                    },
                                  ]}>
                                  {constant.projectActivityApproved}
                                </Text>
                              </View>

                              <Text style={styles.myProjectDetailsRoadeMapRate}>
                                {item.hasOwnProperty('price_format')
                                  ? decode(item.price_format)
                                  : decode(settings.price_format.symbol) +
                                    parseInt(item.price).toFixed(2)}
                              </Text>
                              <Text style={styles.myProjectDetailsRoadeMapRate}>
                                {item.title}
                              </Text>
                              <Text style={styles.myProjectDetailsRoadeMapText}>
                                {item.detail}
                              </Text>
                              {item.status == 'decline' && (
                                <View
                                  style={styles.myProjectDetailsDeclinedView}>
                                  <Feather
                                    name={'alert-circle'}
                                    size={24}
                                    color={'#FF6167'}
                                    style={
                                      styles.ProjectListingPropertyListIcon
                                    }
                                  />
                                  <Text
                                    style={
                                      styles.ProjectCardListDisputeComment
                                    }>
                                    {constant.projectActivityReadCommentBelow}
                                  </Text>
                                  <View
                                    style={
                                      styles.myProjectDetailsDeclinedDemoView
                                    }>
                                    <Text
                                      style={
                                        styles.myProjectDetailsDeclinedDemoText
                                      }>
                                      {item.decline_reason}
                                    </Text>
                                  </View>
                                </View>
                              )}
                            </View>
                          </View>
                        )}
                      />
                    </>
                  )}
                </>
              </>
            )}
          </>
        )}
        <>
          <TouchableOpacity
            onPress={() =>
              activeIndex == 3 ? setActiveIndex(0) : setActiveIndex(3)
            }
            style={styles.myProjectDetailsTimeCardProjectActivity}>
            <View style={styles.myProjectDetailsTimeCardActivityView}>
              <View style={{justifyContent: 'center', alignItems: 'center'}}>
                <Feather name={'folder'} size={20} color={'#1C1C1C'} />
              </View>

              <Text style={styles.myProjectDetailsTimeCardActivityTitle}>
                {constant.projectActivityHeading}
              </Text>
            </View>

            <Feather
              name={activeIndex == 3 ? 'minus' : 'plus'}
              size={20}
              color={'#1C1C1C'}
            />
          </TouchableOpacity>
          {activeIndex == 3 && (
            <>
              <FlatList
                showsVerticalScrollIndicator={false}
                data={commentProposalArray}
                inverted={true}
                extraData={refreshList}
                ListEmptyComponent={
                  // emptyTask && (
                  <View style={styles.NodataFoundContainer}>
                    <Image
                      resizeMode="contain"
                      style={[styles.NodataFoundImg, {marginTop: '5%'}]}
                      source={require('../../../assets/images/empty.png')}
                    />
                    <Text style={styles.NodataFoundText}>
                      {constant.NoRecord}
                    </Text>
                  </View>
                  // )
                }
                keyExtractor={(x, i) => i.toString()}
                renderItem={({item, index}) => (
                  <>
                    <View style={[{marginHorizontal: 15, paddingTop: 10}]}>
                      <View style={styles.myProjectDetailsUser}>
                        <Image
                          style={styles.myProjectDetailsUserPhoto}
                          source={{uri: item.avatar}}
                        />
                        <Text style={styles.myProjectDetailsUserName}>
                          {item.author_name}
                        </Text>
                      </View>
                      <View
                        style={{paddingVertical: 10, paddingHorizontal: 10}}>
                        <Text style={styles.myProjectDetailsUserHours}>
                          {item.date_formate}
                        </Text>
                        {/* <Text style={styles.myProjectDetailsUserHoursText}>
                        $1,250/hr
                      </Text>
                      <Text style={styles.myProjectDetailsUserHours}>
                        06 daily proposed hours{' '}
                      </Text> */}
                        <Text
                          style={[styles.myProjectDetailsTimeCardProjectText]}>
                          {item.message}
                        </Text>
                        {item.attachments.length != 0 && (
                          <View
                            style={[styles.myProjectDetailsrojectAttachment]}>
                            <View
                              style={
                                styles.myProjectDetailsProjectAttachmentView
                              }>
                              <Image
                                style={
                                  styles.myProjectDetailsrojectAttachmentImg
                                }
                                source={require('../../../assets/images/file.png')}
                              />
                              <Text
                                style={
                                  styles.myProjectDetailsrojectAttachmentText
                                }>
                                {item.attachments.length}{' '}
                                {constant.projectActivityAttachments}{' '}
                              </Text>
                            </View>
                            <View
                              style={{
                                borderTopWidth: 1,
                                borderColor: '#DDDDDD',
                              }}
                            />
                            <TouchableOpacity
                              style={styles.myProjectDetailsProjectDownlode}
                              onPress={() =>
                                getAttachmentLink(item.comments_id)
                              }>
                              <Text
                                style={
                                  styles.myProjectDetailsProjectDownlodeText
                                }>
                                {constant.projectActivityDownloadFile}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    </View>
                  </>
                )}
              />
              <View>
                <View style={{borderTopWidth: 1, borderColor: '#DDDDDD'}} />

                {selectedItem[0].proposal_status != 'disputed' && (
                  <>
                    <View style={[{marginHorizontal: 15, paddingVertical: 10}]}>
                      <Text style={styles.myProjectDetailsTimeCardHeading}>
                        {constant.projectActivityUploadTaskDocumentsFiles}
                      </Text>
                      <FlatList
                        data={docArray}
                        keyExtractor={(x, i) => i.toString()}
                        extraData={refreshList}
                        renderItem={({item, index}) => (
                          <View style={styles.sendProposalResumeImgView}>
                            <Text style={styles.sendProposalResumeImgText}>
                              {item.name}
                            </Text>
                            <Feather
                              name={'trash-2'}
                              size={22}
                              color={'#EF4444'}
                              onPress={() => removeDocument(index)}
                            />
                          </View>
                        )}
                      />
                      <View>
                        <Text
                          style={styles.myProjectDetailsProjectDownlodeInfo}>
                          {constant.projectActivityUploadJGP}
                        </Text>
                        <Text
                          style={styles.sendProposalResumeUplodeText}
                          onPress={() => pickDocumentfromDevice()}>
                          {constant.projectActivityClickHereUpload}
                        </Text>
                        <Text
                          style={[
                            styles.myProjectDetailsTimeCardHeading,
                            {paddingTop: 10},
                          ]}>
                          {constant.projectActivityAddComments}
                        </Text>
                        <View style={styles.disputeDetailsAddReply}>
                          <View style={styles.MultiLineTextFieldView}>
                            <TextInput
                              style={styles.sendProjectMultiLineTextField}
                              value={description}
                              onChangeText={body => setDescription(body)}
                              placeholder={constant.projectDetailsComments}
                              placeholderTextColor="#888888"
                              multiline={true}
                              underlineColorAndroid="transparent"
                            />
                          </View>
                        </View>
                        <Text style={styles.myProjectDetailsProjectSendInfo}>
                          {constant.projectActivityClick}{' '}
                          <Text style={{fontFamily: 'Urbanist-Bold'}}>
                            {' '}
                            “{constant.projectActivitySendNow}”{' '}
                          </Text>{' '}
                          {constant.projectActivitybuttonSendUploadedFile}
                        </Text>
                      </View>
                      <View>
                        <FormButton
                          buttonTitle={constant.myProjectDetailsSend}
                          backgroundColor={CONSTANT.primaryColor}
                          textColor={'#FFFFFF'}
                          // loader={loader}
                          onPress={() => addComment()}
                        />
                      </View>
                    </View>
                  </>
                )}
              </View>
            </>
          )}
        </>
        <>
          <TouchableOpacity
            onPress={() =>
              activeIndex == 4 ? setActiveIndex(0) : setActiveIndex(4)
            }
            style={styles.myProjectDetailsTimeCardProjectActivity}>
            <View style={styles.myProjectDetailsTimeCardActivityView}>
              <View style={{justifyContent: 'center', alignItems: 'center'}}>
                <Feather name={'file-text'} size={20} color={'#1C1C1C'} />
              </View>
              <Text style={styles.myProjectDetailsTimeCardActivityTitle}>
                {constant.projectActivityInvoices}
              </Text>
            </View>

            <Feather
              name={activeIndex == 4 ? 'minus' : 'plus'}
              size={20}
              color={'#1C1C1C'}
            />
          </TouchableOpacity>
          {activeIndex == 4 && (
            <>
              <View style={styles.myProjectDetailsInvoiceInfo}>
                <Text style={styles.myProjectDetailsInvoiceInfoText}>
                  {constant.projectActivityInvoiceViewDetail}
                </Text>
              </View>

              <FlatList
                showsVerticalScrollIndicator={false}
                data={invoiceListArray}
                ListEmptyComponent={
                  emptyTask && (
                    <View style={styles.NodataFoundContainer}>
                      <Image
                        resizeMode="contain"
                        style={styles.NodataFoundImg}
                        source={require('../../../assets/images/empty.png')}
                      />
                      <Text style={styles.NodataFoundText}>
                        {constant.NoRecord}
                      </Text>
                    </View>
                  )
                }
                keyExtractor={(x, i) => i.toString()}
                renderItem={({item, index}) => (
                  <>
                    <View
                      style={[
                        styles.sendProjectConatiner,
                        {marginHorizontal: 15},
                      ]}>
                      <View
                        style={[styles.sendProjectTax, {paddingVertical: 10}]}>
                        <View
                          style={{
                            backgroundColor:
                              item.invoice_status_title == 'Ongoing'
                                ? '#F97316'
                                : item.invoice_status_title == 'Draft'
                                ? '#F7F7F7'
                                : item.invoice_status_title == 'Pending'
                                ? '#64748B'
                                : item.invoice_status_title == 'Completed'
                                ? '#22C55E'
                                : '#EF4444',
                            paddingHorizontal: 10,
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: '30%',
                            marginHorizontal: 15,
                            marginBottom: 10,
                          }}>
                          <Text style={[styles.ProjectCardListStatus]}>
                            {item.invoice_status_title}
                          </Text>
                        </View>
                        <Text style={styles.myProjectDetailsTimeCardText}>
                          {constant.projectActivityDate}:
                        </Text>
                        <Text style={styles.myProjectDetailsStatusList}>
                          {item.data_created}
                        </Text>
                      </View>
                      <View style={styles.sendProjectDashedBorder} />
                      <View
                        style={[styles.sendProjectTax, {paddingVertical: 10}]}>
                        <Text style={styles.myProjectDetailsTimeCardText}>
                          {constant.projectActivityTitle}
                        </Text>
                        <Text style={styles.myProjectDetailsStatusList}>
                          {item.invoice_title}
                        </Text>
                      </View>
                      <View style={styles.sendProjectDashedBorder} />
                      <View style={[styles.sendProjectTax]}>
                        <Text style={styles.myProjectDetailsTimeCardText}>
                          {constant.projectActivityAmount}
                        </Text>
                        <Text style={styles.myProjectDetailsStatusList}>
                          {decode(item.buyer_price_format)}
                        </Text>
                        <View style={{paddingHorizontal: 15}}>
                          <FormButton
                            buttonTitle={constant.myProjectDetailsDownload}
                            backgroundColor={CONSTANT.primaryColor}
                            textColor={'#FFFFFF'}
                            iconName={'download'}
                            onPress={() => downloadInvoice(item)}
                            // loader={loader}
                          />
                        </View>
                      </View>
                    </View>
                  </>
                )}
              />
            </>
          )}
        </>
      </ScrollView>
      <Dialog
        onTouchOutside={() => {
          setVisible(false);
        }}
        dialogStyle={{
          overflow: 'hidden',
          width: Dimensions.get('window').width / 1.3,
        }}
        visible={visible}
        footer={
          userDetail.user_type == 'buyers' ? (
            <>
              {completeContract == true && (
                <DialogFooter
                  style={{alignItems: 'center', justifyContent: 'center'}}>
                  <TouchableOpacity
                    onPress={() => openCompeteContractSheet()}
                    style={{flexDirection: 'row', paddingVertical: 10}}>
                    <Text
                      style={{
                        color: '#1C1C1C',
                        fontSize: 16,
                        lineHeight: 26,
                        letterSpacing: 0.5,
                        fontFamily: 'Urbanist-Bold',
                      }}>
                      {constant.projectActivityCompletedContract}
                    </Text>
                  </TouchableOpacity>
                </DialogFooter>
              )}
              <DialogFooter
                style={{alignItems: 'center', justifyContent: 'center'}}>
                <TouchableOpacity
                  onPress={() => getDisputeIssues()}
                  style={{flexDirection: 'row', paddingVertical: 10}}>
                  <Text
                    style={{
                      color: '#1C1C1C',
                      fontSize: 16,
                      lineHeight: 26,
                      letterSpacing: 0.5,
                      fontFamily: 'Urbanist-Bold',
                    }}>
                    {constant.projectActivityCreateRefundRequest}
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
                    setVisible(false);
                  }}
                />
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogFooter
                style={{alignItems: 'center', justifyContent: 'center'}}>
                <TouchableOpacity
                  onPress={() => getDisputeIssues()}
                  style={{flexDirection: 'row', paddingVertical: 10}}>
                  <Text
                    style={{
                      color: '#1C1C1C',
                      fontSize: 16,
                      lineHeight: 26,
                      letterSpacing: 0.5,
                      fontFamily: 'Urbanist-Bold',
                    }}>
                    {constant.projectActivityRaiseDispute}
                  </Text>
                </TouchableOpacity>
              </DialogFooter>
              {selectedItem[0].proposal_type == 'milestone' && (
                <DialogFooter
                  style={{alignItems: 'center', justifyContent: 'center'}}>
                  <TouchableOpacity
                    onPress={() => openMileStone()}
                    style={{flexDirection: 'row', paddingVertical: 10}}>
                    <Text
                      style={{
                        color: '#1C1C1C',
                        fontSize: 16,
                        lineHeight: 26,
                        letterSpacing: 0.5,
                        fontFamily: 'Urbanist-Bold',
                      }}>
                      {constant.projectActivityCreateMilestone}
                    </Text>
                  </TouchableOpacity>
                </DialogFooter>
              )}

              <DialogFooter>
                <DialogButton
                  textStyle={{
                    fontSize: 15,
                    lineHeight: 24,
                    letterSpacing: 0.5,
                    fontFamily: 'Urbanist-Regular',
                    color: '#1C1C1C',
                  }}
                  text={constant.projectActivityCancel}
                  onPress={() => {
                    setVisible(false);
                  }}
                />
              </DialogFooter>
            </>
          )
        }
      />

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
                text={constant.projectActivityCancel}
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
              {constant.projectActivityCreateRefundRequest}
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
            <TouchableOpacity
              onPress={() => {
                setDisable(!disable);
              }}
              style={[styles.checkBoxMainView, {alignItems: 'flex-start'}]}>
              {disable ? (
                <View style={[styles.checkBoxCheck, {marginTop: 5}]}>
                  <FontAwesome
                    name="check"
                    type="check"
                    color={'#fff'}
                    size={14}
                  />
                </View>
              ) : (
                <View style={[styles.checkBoxUncheck, {marginTop: 5}]} />
              )}
              <View>
                <Text style={styles.signupTermsAndConditionText}>
                  {constant.signupAgree}{' '}
                  <Text style={styles.signupTermsAndConditionTextLast}>
                    {constant.signupTerms}
                  </Text>
                </Text>
              </View>
            </TouchableOpacity>
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
              {constant.projectActivityAddMilestone}
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
                  {constant.projectActivityHowMilestonesAdd}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={{
                marginBottom: 10,
                justifyContent: 'flex-end',
                alignItems: 'center',
                flexDirection: 'row',
              }}
              onPress={() => handelAddMilstone()}>
              <Text
                style={{
                  color: CONSTANT.primaryColor,
                  fontSize: 18,
                  lineHeight: 26,
                  fontFamily: 'Urbanist-SemiBold',
                  letterSpacing: 0.5,
                  paddingRight: 10,
                }}>
                {constant.projectActivityAddMileston}
              </Text>
              <Feather
                style={{}}
                name={'plus'}
                size={20}
                color={CONSTANT.primaryColor}
              />
            </TouchableOpacity>

            <FlatList
              showsVerticalScrollIndicator={false}
              data={addNewMilstone}
              inverted
              extraData={refreshList}
              keyExtractor={(x, i) => i.toString()}
              renderItem={({item, index}) => (
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
                      onChangeText={text => changePrice(text, index)}
                      value={item.price}
                      placeholder={constant.projectActivityAddPrice}
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
                      onChangeText={text => changeTitle(text, index)}
                      value={item.title}
                      placeholder={constant.projectActivityEnterMilestoneTitle}
                    />
                  </View>
                  <View
                    style={{height: 100, marginVertical: 10, width: '100%'}}>
                    <View style={[styles.MultiLineTextFieldView, {padding: 0}]}>
                      <TextInput
                        style={[
                          styles.MultiLineTextField,
                          {color: CONSTANT.fontColor},
                        ]}
                        value={item.description}
                        onChangeText={body => changeDecription(body, index)}
                        placeholder={constant.availableTaskDetailDisputeDetails}
                        placeholderTextColor="#888888"
                        multiline={true}
                        underlineColorAndroid="transparent"
                      />
                    </View>
                  </View>
                  <FormButton
                    onPress={() => removeMileStone(index)}
                    buttonTitle={constant.projectActivityDeleteMilestone}
                    backgroundColor={'#EF4444'}
                    textColor={'#fff'}
                    iconName={'trash-2'}
                  />
                </View>
              )}
            />
            <View style={{marginBottom: 10}}>
              <FormButton
                onPress={() => handelAddNewMileStone()}
                buttonTitle={constant.projectActivityAddMilestone}
                backgroundColor={'#22C55E'}
                textColor={'#fff'}
                loader={loading}
              />
            </View>
          </ScrollView>
        </View>
      </RBSheet>
      <RBSheet
        ref={RBSheetDeclineMilestone}
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
              {constant.projectActivityDecline}
            </Text>
            <Feather
              onPress={() => RBSheetDeclineMilestone.current.close()}
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
              {constant.projectActivityDeclineProposal}
            </Text>

            <View style={{height: 170, marginVertical: 10, width: '100%'}}>
              <Text style={styles.RBSheetReplyDeclineText}>
                {constant.projectActivityDeclineDetail}
              </Text>
              <View style={styles.MultiLineTextFieldView}>
                <TextInput
                  style={styles.MultiLineTextField}
                  value={declineResone}
                  onChangeText={body => setDeclineResone(body)}
                  placeholder={constant.projectActivityEnterDetail}
                  placeholderTextColor="#888888"
                  multiline={true}
                  underlineColorAndroid="transparent"
                />
              </View>
            </View>
            <View style={{marginTop: 20}}>
              <FormButton
                onPress={() =>
                  updateMileStoneStatus(
                    declineItem,
                    declineIndex,
                    'decline',
                    declineResone,
                  )
                }
                buttonTitle={constant.Submit}
                backgroundColor={'#EF4444'}
                loader={loading}
                textColor={'#fff'}
              />
            </View>
          </ScrollView>
        </View>
      </RBSheet>
      <RBSheet
        ref={RBSheetOrderStatus}
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
              {/* {data.task_title} */}
            </Text>
            <Feather
              onPress={() => RBSheetOrderStatus.current.close()}
              style={styles.RBSheetCloseIconStyle}
              name={'x'}
              size={20}
              color={'#1C1C1C'}
            />
          </View>

          <View
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
              onPress={() => completeProjectContract(false)}
              buttonTitle={constant.projectActivityCompleteWithoutReview}
              backgroundColor={'#F7F7F7'}
              textColor={'#999999'}
            />
            <FormButton
              onPress={() => completeProjectContract(true)}
              buttonTitle={constant.projectActivityCompleteContract}
              backgroundColor={'#295FCC'}
              textColor={'#fff'}
            />
          </View>
        </View>
      </RBSheet>
    </SafeAreaView>
  );
};

export default EmpProjectActivity;
