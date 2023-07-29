import {
  View,
  Text,
  SafeAreaView,
  Image,
  FlatList,
  ScrollView,
  I18nManager,
  Platform,
  PermissionsAndroid,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import React, {useState, useEffect} from 'react';
import Header from '../../components/Header';
// import Video from 'react-native-video';
import styles from '../../style/styles';
import FormButton from '../../components/FormButton';
import * as CONSTANT from '../../constants/globalConstants';
import constant from '../../constants/translation';
import {useNavigation} from '@react-navigation/native';
import {decode} from 'html-entities';
import RNFetchBlob from 'rn-fetch-blob';
import HTML from 'react-native-render-html';
import {WebView} from 'react-native-webview';
import {useSelector, useDispatch} from 'react-redux';
import Spinner from 'react-native-loading-spinner-overlay';
import {BallIndicator} from 'react-native-indicators';
import axios from 'axios';
import {useIsFocused} from '@react-navigation/native';
import {updateSavedProjects} from '../../Redux/SavedSlice';

const tagsStyles = {
  body: {
    fontFamily: 'OpenSans-Regular',
    fontSize: 15,
    letterSpacing: 0.5,
    lineHeight: 24,
    color: '#0A0F26',
  },
};

const ProjectDetails = ({navigation, route}) => {
  const navigationforword = useNavigation();
  const [showMore, setShowMore] = useState(6);
  const [loader, setLoader] = useState(false);
  const [showMoreLanguage, setShowMoreLanguage] = useState(2);
  const userDetail = useSelector(state => state.value.userInfo);
  const token = useSelector(state => state.value.token);
  const [added, setAdded] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [refreshFlatList, setRefreshFlatList] = useState(false);
  const isFocused = useIsFocused();
  const savedList = useSelector(state => state.saved.savedProjects);
  const dispatch = useDispatch();
  useEffect(() => {
    if (isFocused) {
      savedList.map(data => {
        if (route.params.item.project_id == data.id) {
          setAdded(true);
        }
      });
    }
  }, [isFocused]);

  const downloadAttachments = () => {
    setLoader(true);

    fetch(
      CONSTANT.BaseUrl +
        'get-attachments?post_id=' +
        userDetail.profile_id +
        '&comments_id=' +
        route.params.item.project_id +
        '&type=projects',

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

        setLoader(false);
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
          downloadMedia(link);
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
        removeInvoicePDF(path);

        if (Platform.OS === 'ios') {
          RNFetchBlob.ios.openDocument(res.data);
        }
      });
  };

  const removeInvoicePDF = path => {
   
    fetch(
      CONSTANT.BaseUrl +
        'remove-invoicepdf?post_id=' +
        userDetail.profile_id +
        '&file_path=' +
        path,
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
      .then(responseJson => {})
      .catch(error => {
        console.error(error);
      });
  };

  const AddToSaveList = value => {
    setLoader(true);
    axios
      .post(
        CONSTANT.BaseUrl + 'update-saveditem',
        {
          post_id: userDetail.profile_id,
          action: 'taskbot_saved_items',
          item_id: route.params.item.project_id,
          type: 'projects',
          option: value,
        },
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        },
      )
      .then(async response => {
        if (response.data.type == 'success') {
          if (value == 'saved') {
            let updateSavedProjectslist = JSON.parse(JSON.stringify(savedList));
            updateSavedProjectslist.push({
              id: route.params.item.project_id,
            });
            dispatch(updateSavedProjects(updateSavedProjectslist));
            setAdded(true);
          } else {
            var updateSavedProjectslist = savedList.filter(x => {
              return x.id != route.params.item.project_id;
            });

            dispatch(updateSavedProjects(updateSavedProjectslist));
            setAdded(false);
          }
          setLoader(false);
          Alert.alert(constant.SuccessText, response.data.message_desc);
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
  const onClickShare = () => {
    Share.share(
      {
        message: route.params.item.project_url,
        url: route.params.item.project_url,
        title: 'Have a look',
      },
      {
        // Android only:
        dialogTitle: 'Have a look',
        // iOS only:
        excludedActivityTypes: ['com.apple.UIKit.activity.PostToTwitter'],
      },
    );
  };
  return (
    <SafeAreaView style={styles.globalContainer}>
      <View style={styles.taskDetailHeaderView}>
        <Feather
          onPress={() => navigation.goBack()}
          name={I18nManager.isRTL ? 'chevron-right' : 'chevron-left'}
          type="chevron-left"
          color={'#1C1C1C'}
          size={24}
        />
        <View style={{flexDirection: 'row'}}>
          {added ? (
            <TouchableOpacity onPress={() => AddToSaveList('')}>
              {loader == true ? (
                <View style={{marginRight: 10, marginTop: 10}}>
                  <BallIndicator count={9} size={16} color={'#0A0F26'} />
                </View>
              ) : (
                <Feather
                  style={{paddingHorizontal: 10}}
                  name="heart"
                  type="heart"
                  color={'#EF4444'}
                  size={22}
                />
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => AddToSaveList('saved')}>
              {loader == true ? (
                <View style={{marginRight: 10, marginTop: 10}}>
                  <BallIndicator count={9} size={16} color={'#0A0F26'} />
                </View>
              ) : (
                <Feather
                  style={{paddingHorizontal: 10}}
                  name="heart"
                  type="heart"
                  color={'#999999'}
                  size={22}
                />
              )}
            </TouchableOpacity>
          )}
          <Feather
            onPress={() => onClickShare()}
            style={{paddingHorizontal: 10}}
            name="share-2"
            type="share-2"
            color={'#1C1C1C'}
            size={22}
          />
        </View>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.ProjectDetailsContainer}>
          <View style={{flexDirection: 'row'}}>
            {route.params.item.is_featured == 'yes' && (
              <View style={styles.ProjectDetailsFaetured}>
                <Text style={styles.ProjectDetailsFaeturedText}>{constant.Featured}</Text>
              </View>
            )}
            {route.params.item.project_meta.project_type == 'fixed' ? (
              <View style={styles.ProjectDetailsFixed}>
                <Text style={styles.ProjectDetailsFiexdText}>
                  {route.params.item.type_text}
                </Text>
              </View>
            ) : (
              <View style={styles.ProjectDetailsHourly}>
                <Text style={styles.ProjectDetailsHourlyText}>
                  {route.params.item.type_text}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.ProjectDetailsTitleConatainer}>
            <Text style={styles.ProjectDetailsTitle}>
              {decode(route.params.item.title)}
            </Text>
          </View>

          <View>
            <Text style={styles.ProjectDetailsBudget}>
              {decode(route.params.item.project_price)}
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
                {route.params.item.posted_time}
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
                {route.params.item.location_text}
              </Text>
            </View>
          </View>
        </View>
        {/* <WebView source={{uri: "https://youtu.be/M4hfP-mkL1g"}} /> */}
        {/* <Video
          source={reVideo}
          paused={true}
          fullscreen={true}
          controls={true}
          style={{
            // position: 'absolute',
            // top: 0,
            // left: 0,
            // bottom: 0,
            // right: 0,
            width: '100%',
            height: 300,
          }}
         
        /> */}
       
        <View style={styles.ProjectDetailsJobContainer}>
          <Text style={styles.ProjectDetailsJobText}>{constant.projectDetailsJobDescription}:</Text>
          <HTML
            tagsStyles={tagsStyles}
            source={{html: route.params.item.description}}
          />

          <Text style={[styles.ProjectDetailsJobText, {paddingBottom: 10}]}>
            {constant.projectDetailsSkillRequired}:
          </Text>

          <FlatList
            showsVerticalScrollIndicator={false}
            data={route.params.item.skills}
            columnWrapperStyle={{flexWrap: 'wrap'}}
            numColumns={4}
            keyExtractor={(x, i) => i.toString()}
            renderItem={({item, index}) => (
              <View style={{flexDirection: 'row'}}>
                {index <= showMore && (
                  <View style={styles.ProjectDetailsDevelopment}>
                    <Text style={styles.ProjectDetailsDevelopmentText}>
                      {decode(item.name)}
                    </Text>
                  </View>
                )}
                {index == showMore && (
                  <View style={styles.ProjectDetailsMoreBtn}>
                    <Text
                      style={styles.ProjectDetailsMoreBtnText}
                      onPress={() =>
                        setShowMore(
                          showMore == route.params.item.skills.length - 1
                            ? 6
                            : route.params.item.skills.length - 1,
                        )
                      }>
                      {showMore == 6
                        ? `+${route.params.item.skills.length - 7}${constant.projectDetailsMore}`
                        : constant.projectDetailsShowLess}
                    </Text>
                  </View>
                )}
              </View>
            )}
          />
          {route.params.item.downloadable_files == 'yes' && (
            <View style={styles.ProjectDetailsAttachmentConatiner}>
              <View style={{paddingHorizontal: 10}}>
                <Text style={styles.ProjectDetailsAttachmentHeader}>
                  {constant.projectDetailsAttachmentsAvailableDownload}
                </Text>
                <Text style={styles.ProjectDetailsAttachmentText}>
                  {constant.projectDetailsDownloadProjectProvided} “
                  {route.params.item.user_name}”
                </Text>
              </View>

              <View style={{paddingHorizontal: 10, paddingBottom: 10}}>
                <FormButton
                  buttonTitle={constant.projectDetailsDownloade}
                  backgroundColor={CONSTANT.primaryColor}
                  textColor={'#FFFFFF'}
                  iconName={loader != true && 'download'}
                  loader={loader}
                  onPress={() =>
                    downloadAttachments(route.params.item.project_id)
                  }
                />
              </View>
            </View>
          )}

          <Text style={styles.ProjectDetailsJobText}>{constant.projectDetailsProjectRequirements}</Text>
          <View>
            <View style={styles.ProjectDetailsIconList}>
              <View style={styles.ProjectDetailsIconContainer}>
                <Feather
                  name={'users'}
                  size={18}
                  color={'#2196F3'}
                  style={styles.ProjectDetailsIcon}
                />
              </View>
              <View style={styles.ProjectDetailsRequirementList}>
                <Text style={styles.ProjectDetailsRequirementText}>
                  {constant.projectDetailsHiringCapacity}
                </Text>
                <Text style={styles.ProjectDetailsRequirementHeadingText}>
                  {route.params.item.freelancers} {constant.projectDetailsFreelancers}
                </Text>
              </View>
            </View>
            <View style={styles.ProjectDetailsIconList}>
              <View style={styles.ProjectDetailsIconExpertise}>
                <Feather
                  name={'briefcase'}
                  size={18}
                  color={'#F44336'}
                  style={styles.ProjectDetailsIcon}
                />
              </View>
              <View style={styles.ProjectDetailsRequirementList}>
                <Text style={styles.ProjectDetailsRequirementText}>
                  {constant.projectDetailsExpertise}
                </Text>
                <Text style={styles.ProjectDetailsRequirementHeadingText}>
                  {route.params.item.expertise_level[0].name}
                </Text>
              </View>
            </View>
            <View style={styles.ProjectDetailsIconList}>
              <View style={styles.ProjectDetailsIconLanguages}>
                <Feather
                  name={'book-open'}
                  size={18}
                  color={'#FFC107'}
                  style={styles.ProjectDetailsIcon}
                />
              </View>
              {/* <View style={styles.ProjectDetailsRequirementList}>
                <Text style={styles.ProjectDetailsRequirementText}>
                  Languages
                </Text>
                <FlatList
                  // style={{borderColor:"#000",backgroundColor:"red",borderWidth:1}}
                  showsVerticalScrollIndicator={false}
                  data={route.params.item.languages}
                  columnWrapperStyle={{flexWrap: 'wrap'}}
                  numColumns={4}
                  keyExtractor={(x, i) => i.toString()}
                  renderItem={({item, index}) => (
                    <View style={{flexDirection: 'row'}}>
                      {index <= showMoreLanguage && (
                        <Text
                          style={styles.ProjectDetailsRequirementHeadingText}>
                          {item.name}{' '}
                          {index + 1 == route.params.item.languages.length
                            ? ''
                            : ','}
                        </Text>
                      )}
                      {(index == lang.length-1 && lang.length > 3) && (
                        // <View style={styles.ProjectDetailsMoreBtn}>
                        <Text
                          style={styles.ProjectDetailslanguageMoreBtnText}
                          onPress={() =>
                            setShowMoreLanguage(
                              showMoreLanguage ==
                                route.params.item.skills.length - 1
                                ? 2
                                : route.params.item.skills.length - 1,
                            )
                          }>
                          {showMoreLanguage == 2
                            ? `+${route.params.item.skills.length - 3}more`
                            : 'show Less'}
                        </Text>
                        // </View>
                      )}
                    </View>
                  )}
                />
              </View> */}

              <View style={styles.ProjectDetailsRequirementList}>
                <Text style={styles.ProjectDetailsRequirementText}>
                  {constant.projectDetailsLanguages}
                </Text>
                <FlatList
                  showsVerticalScrollIndicator={false}
                  data={route.params.item.languages}
                  columnWrapperStyle={{flexWrap: 'wrap'}}
                  numColumns={3}
                  keyExtractor={(x, i) => i.toString()}
                  renderItem={({item, index}) => (
                    <View style={{flexDirection: 'row'}}>
                      {index <= showMoreLanguage && (
                        <Text
                          style={styles.ProjectDetailsRequirementHeadingText}>
                          {item.name} {index + 1 == route.params.item.languages.length ? '' : ','}
                        </Text>
                      )}
                      
                      {(index == route.params.item.languages.length-1 && route.params.item.languages.length > 3) && (
                        <Text
                          style={styles.ProjectDetailslanguageMoreBtnText}
                          onPress={() =>
                            setShowMoreLanguage(
                              showMoreLanguage ==
                              route.params.item.languages.length - 1
                                ? 2
                                : route.params.item.languages.length - 1,
                            )
                          }>
                          {showMoreLanguage == 2
                            ? `+${route.params.item.languages.length - 3}${constant.projectDetailsMore}`
                            : constant.projectDetailsShowLess}
                        </Text>
                      )}
                      
                    </View>
                  )}
                />
              </View>
            </View>
            <View style={styles.ProjectDetailsIconList}>
              <View style={styles.ProjectDetailsIconDuration}>
                <Feather
                  name={'calendar'}
                  size={18}
                  color={'#4CAF50'}
                  style={styles.ProjectDetailsIcon}
                />
              </View>
              <View style={styles.ProjectDetailsRequirementList}>
                <Text style={styles.ProjectDetailsRequirementText}>
                  {constant.projectDetailsProjectDuration}
                </Text>
                <Text style={styles.ProjectDetailsRequirementHeadingText}>
                  {route.params.item.duration[0].name}
                </Text>
              </View>
            </View>
          </View>
          <View style={{paddingTop: 15}}>
            <View
              style={[
                styles.ProjectDetailsAuthorDetails,
                {
                  borderBottomWidth: showDetails == false ? 1 : 0,
                  borderBottomLeftRadius: showDetails == false ? 10 : 0,
                  borderBottomRightRadius: showDetails == false ? 10 : 0,
                },
              ]}>
              <View style={{width: '20%'}}>
                <Image
                  style={styles.ProjectDetailsAuthorPhoto}
                  source={{uri: route.params.item.avatar}}
                />
              </View>

              <View style={styles.ProjectDetailsAuthorContainer}>
                <View style={{flexDirection: 'row'}}>
                  <Text style={styles.ProjectDetailsAuthorTitle}>
                    {route.params.item.user_name}
                  </Text>
                  <Feather
                    name={'check-circle'}
                    size={16}
                    color={'#22C55E'}
                    style={styles.ProjectDetailsAuthorTitleIcon}
                  />
                </View>
                <Text style={styles.ProjectDetailsAuthorSince}>
                  {constant.projectDetailsMemberSince} {route.params.item.buyer_registered_date}
                </Text>
              </View>
              <TouchableOpacity
                style={{width: '10%'}}
                onPress={() => setShowDetails(!showDetails)}>
                <Feather
                  name={showDetails == false ? I18nManager.isRTL ? 'chevron-left' : 'chevron-right': 'chevron-down'}
                  size={20}
                  color={'#999999'}
                  style={[styles.ProjectDetailsIcon,{paddingHorizontal:I18nManager.isRTL ? 0 : 15,paddingVertical:15}]}
                />
              </TouchableOpacity>
            </View>
            {showDetails == true && (
              <View style={styles.ProjectDetailsAuthorAbout}>
                <Text style={styles.ProjectDetailsAuthorText}>
                 {constant.projectDetailsDetail}
                </Text>
                <View style={styles.ProjectDetailsAuthorDecView}>
                  <View style={styles.ProjectDetailsAuthorloc}>
                    <Feather name={'map-pin'} size={20} color={'#999999'} />
                    <Text style={styles.ProjectDetailsAuthorlocText}>
                      {constant.projectDetailsLocatedIn}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.ProjectDetailsAuthorDecText}>
                      {route.params.item.buyer_address}
                    </Text>
                  </View>
                </View>
                <View style={styles.ProjectDetailsAuthorDecView}>
                  <View style={styles.ProjectDetailsAuthorloc}>
                    <Feather name={'bookmark'} size={20} color={'#999999'} />
                    <Text style={styles.ProjectDetailsAuthorlocText}>
                      {constant.projectDetailsTotalPostedProjects}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.ProjectDetailsAuthorDecText}>
                      {route.params.item.buyer_posted_project}
                    </Text>
                  </View>
                </View>
                <View style={styles.ProjectDetailsAuthorDecView}>
                  <View style={styles.ProjectDetailsAuthorloc}>
                    <Feather name={'clock'} size={20} color={'#999999'} />
                    <Text style={styles.ProjectDetailsAuthorlocText}>
                      {constant.projectDetailsOngoingProjects}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.ProjectDetailsAuthorDecText}>
                      {route.params.item.buyer_hired_project}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>
        {userDetail.user_type != 'buyers' && (
          <View>
            {!route.params.item.porposal_edit ? (
              <FormButton
                buttonTitle={constant.projectDetailsApply}
                backgroundColor={CONSTANT.primaryColor}
                textColor={'#FFFFFF'}
                // iconName={'chevron-right'}
                // loader={loader}
                onPress={() =>
                  navigationforword.navigate('sendProposal', {
                    data: route.params.item,
                  })
                }
              />
            ) : (
              <FormButton
                buttonTitle={constant.projectDetailsEdit}
                backgroundColor={CONSTANT.primaryColor}
                textColor={'#FFFFFF'}
                // iconName={'chevron-right'}
                // loader={loader}
                onPress={() =>
                  navigationforword.navigate('sendProposal', {
                    data: route.params.item,
                    edit: true,
                  })
                }
              />
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProjectDetails;
