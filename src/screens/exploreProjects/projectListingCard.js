import {
  View,
  Text,
  SafeAreaView,
  ImageBackground,
  ScrollView,
  Alert,
  TouchableOpacity,
  FlatList,
  Share,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Header from '../../components/Header';
import {useSelector, useDispatch} from 'react-redux';
import styles from '../../style/styles.js';
import {useNavigation} from '@react-navigation/native';
import {decode} from 'html-entities';
import constant from '../../constants/translation';
import FormButton from '../../components/FormButton';
import * as CONSTANT from '../../constants/globalConstants';
import {BallIndicator} from 'react-native-indicators';
import axios from 'axios';
import {useIsFocused} from '@react-navigation/native';
import {updateSavedProjects} from '../../Redux/SavedSlice';
import {useFocusEffect} from '@react-navigation/native';

const projectListingCard = ({
  item,
  showRemoveBtn,
  widthValue,
  showMoreDetails,
  showSkills,
  RemoveItem,
  handelAdded,
  // added,
}) => {
  const navigationforword = useNavigation();
  const settings = useSelector(state => state.setting.settings);
  const userDetail = useSelector(state => state.value.userInfo);
  const token = useSelector(state => state.value.token);
  const savedList = useSelector(state => state.saved.savedProjects);
  const [showMore, setShowMore] = useState(6);
  const [loader, setLoader] = useState(false);
  const [added, setAdded] = useState(false);
  const [refreshFlatlist, setRefreshFlatList] = useState(false);

  let decodeSkills = item.skills;
  const isFocused = useIsFocused();
  const dispatch = useDispatch();

  useEffect(() => {
    if (isFocused) {
      savedList.map(data => {
        if (item.project_id == data.id) {
          setAdded(true);
        } else {
          setAdded(false);
        }
      });

    }
  }, [isFocused]);
  const  AddToSaveList = value => {
    setLoader(true);
    axios
      .post(
        CONSTANT.BaseUrl + 'update-saveditem',
        {
          post_id: userDetail.profile_id,
          action: 'taskbot_saved_items',
          item_id: item.project_id,
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
              id: item.project_id,
            });
            dispatch(updateSavedProjects(updateSavedProjectslist));
            setAdded(true);
          } else {
            var updateSavedProjectslist = savedList.filter(x => {
              return x.id != item.project_id;
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
        message: item.project_url,
        url: item.project_url,
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
    <>
      <View style={[styles.ProjectListingCardParent, {width: widthValue}]}>
        <View style={styles.ProjectListingCardContainer}>
          {item.is_featured == 'yes' && (
            <View style={[styles.ProjectListingFeaturedView]}>
              {item.is_featured == 'yes' && (
                <View
                  style={{
                    backgroundColor: '#FCCF14',
                    paddingHorizontal: 10,
                    alignItems:"center",
                    justifyContent:"center"
                  }}>
                  <Text style={styles.ProjectListingCardStatus}>Featured</Text>
                </View>
              )}

              <Feather
                onPress={() => onClickShare()}
                name={'share-2'}
                size={18}
                color={'#999999'}
                style={styles.ProjectListingCardNameIcon}
              />
            </View>
          )}

          <View style={[styles.ProjectListingCardNameView]}>
            <View style={{flexDirection: 'row'}}>
              <Text style={styles.ProjectListingCardName}>
                {item.user_name}
              </Text>
              {item.is_verified == 'yes' && (
                <Feather
                  name={'check-circle'}
                  size={13}
                  color={'#22C55E'}
                  style={styles.ProjectListingCardNameIcon}
                />
              )}
            </View>
            {item.is_featured != 'yes' && (
              <Feather
                name={'share-2'}
                size={18}
                color={'#999999'}
                style={styles.ProjectListingCardNameIcon}
              />
            )}
          </View>
          <View
            style={{
              flexDirection: 'row',
            }}>
            <Text style={styles.ProjectListingTitle}>{item.title}</Text>
          </View>
          <View style={styles.ProjectListingPropertyContainer}>
            <View style={styles.ProjectListingPropertyList}>
              <Feather
                name={'calendar'}
                size={13}
                color={'#999999'}
                style={styles.ProjectListingPropertyListIcon}
              />
              <Text style={styles.ProjectListingPropertyListTitle}>
                {item.posted_time}
              </Text>
            </View>
            <View style={styles.ProjectListingPropertyList}>
              <Feather
                name={'map-pin'}
                size={13}
                color={'#999999'}
                style={styles.ProjectListingPropertyListIcon}
              />
              <Text style={styles.ProjectListingPropertyListTitle}>
                {item.location_text}
              </Text>
            </View>
            <View style={styles.ProjectListingPropertyList}>
              <Feather
                name={'briefcase'}
                size={13}
                color={'#999999'}
                style={styles.ProjectListingPropertyListIcon}
              />
              <Text style={styles.ProjectListingPropertyListTitle}>
                {item.expertise_level[0].name}
              </Text>
            </View>
            <View style={styles.ProjectListingPropertyList}>
              <Feather
                name={'users'}
                size={13}
                color={'#999999'}
                style={styles.ProjectListingPropertyListIcon}
              />
              <Text style={styles.ProjectListingPropertyListTitle}>
                {item.freelancers}{' '}
                {item.freelancers === 1 ? constant.projectDetailsFreelancer : constant.projectDetailsFreelancers}
              </Text>
            </View>
          </View>
          <View style={styles.ProjectListingRateConatiner}>
            <Text style={styles.ProjectListingRateHourly}>
              {item.type_text}
            </Text>
            <Text style={styles.ProjectListingRateHourlyPrice}>
              {item.project_meta.project_type === 'hourly' &&
                `${decode(settings.price_format.symbol)}`}
              {decode(item.project_price)}
            </Text>
          </View>
          {showSkills == true && (
            <>
              <FlatList
                style={{paddingTop: 15}}
                showsVerticalScrollIndicator={false}
                data={decodeSkills}
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
                              showMore == decodeSkills.length - 1
                                ? 6
                                : decodeSkills.length - 1,
                            )
                          }>
                          {showMore == 6
                            ? `+${decodeSkills.length - 7}more`
                            : 'show Less'}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              />
            </>
          )}
        </View>
        {showMoreDetails == true && (
          <View style={{paddingHorizontal: 10, paddingBottom: 10}}>
            <FormButton
              buttonTitle={constant.expolreProjectDetails}
              backgroundColor={CONSTANT.primaryColor}
              textColor={'#FFFFFF'}
              iconName={'chevron-right'}
              // loader={loader}
              onPress={() =>
                navigationforword.navigate('projectDetails', {item: item})
              }
            />
            {showRemoveBtn == true ? (
              <FormButton
                buttonTitle={constant.savedItemRemoveSavedItems}
                iconName={'trash-2'}
                backgroundColor={'#EF4444'}
                textColor={'#fff'}
                onPress={() => RemoveItem('projects', item.project_id)}
              />
            ) : (
              <>
                {added == true && (
                  <TouchableOpacity
                    onPress={() => AddToSaveList('')}
                    style={styles.profileSaveParentStyle}>
                    {loader == true ? (
                      <View style={{marginRight: 10}}>
                        <BallIndicator count={9} size={16} color={'#0A0F26'} />
                      </View>
                    ) : (
                      <FontAwesome name={'heart'} size={16} color={'#EF4444'} />
                    )}
                    <Text style={styles.profileSaveTextStyle}>
                      {constant.profileDetailRemove}
                    </Text>
                  </TouchableOpacity>
                )}
                {added == false && (
                  <TouchableOpacity
                    onPress={() => AddToSaveList('saved')}
                    style={styles.profileSaveParentStyle}>
                    {loader == true ? (
                      <View style={{marginRight: 10}}>
                        <BallIndicator count={9} size={16} color={'#0A0F26'} />
                      </View>
                    ) : (
                      <Feather name={'heart'} size={16} color={'#999999'} />
                    )}
                    <Text style={styles.profileSaveTextStyle}>
                      {constant.profileDetailAdd}
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        )}
      </View>
    </>
  );
};

export default projectListingCard;
