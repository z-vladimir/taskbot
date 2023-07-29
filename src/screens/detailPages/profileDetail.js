import {
  View,
  Text,
  SafeAreaView,
  ImageBackground,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import {ScrollView} from 'react-native-gesture-handler';
import Header from '../../components/Header';
import styles from '../../style/styles';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import FormButton from '../../components/FormButton';
import {useSelector, useDispatch} from 'react-redux';
import axios from 'axios';
import * as CONSTANT from '../../constants/globalConstants';
import QualificationCard from './qualificationCard';
import ProgressBarAnimated from 'react-native-progress-bar-animated';
import {decode} from 'html-entities';
import {BallIndicator} from 'react-native-indicators';
import constant from '../../constants/translation';

const ProfileDetail = ({route, navigation}) => {
  const userDetail = useSelector(state => state.value.userInfo);
  const savedList = useSelector(state => state.saved.savedSellers);
  const token = useSelector(state => state.value.token);
  const [loader, setLoader] = useState(false);
  const [added, setAdded] = useState(false);
  const [emptyOfferedTask, setEmptyOfferedTask] = useState(false);

  const [imagesArray, setImagesArray] = useState([]);
  if (route.params.data.tasks.length != 0) {
    for (let i = 0; i < route.params.data.tasks.length; i++) {
      for (let j = 0; j < route.params.data.tasks[i].gallery.length; j++) {
        imagesArray.push({
          url: route.params.data.tasks[i].gallery[j],
        });
      }
    }
  }
  useEffect(() => {
    savedList.map(data => {
      if (route.params.data.profile_id == data.id) {
        setAdded(true);
      }
    });
  }, []);
  const AddToSaveList = value => {
    setLoader(true);
    axios
      .post(
        CONSTANT.BaseUrl + 'update-saveditem',
        {
          post_id: userDetail.profile_id,
          action: 'taskbot_saved_items',
          item_id: route.params.data.profile_id,
          type: 'sellers',
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
            setAdded(true);
          } else {
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

  return (
    <SafeAreaView style={styles.globalContainer}>
      <Header
        title={constant.profileDetailTitle}
        titleColor={'#1C1C1C'}
        backColor={'#F7F7F7'}
        iconColor={'#1C1C1C'}
        backIcon={true}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileMainViewStyle}>
          <View>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('imagePreview', {
                  imageData: route.params.data.avatar,
                })
              }
              style={{
                marginTop: -40,
              }}>
              <ImageBackground
                imageStyle={{borderRadius: 80 / 2}}
                style={styles.profileImageBackgrounfStyle}
                source={{uri: route.params.data.avatar}}>
                <View style={styles.profileOnlineStatusStyle} />
              </ImageBackground>
            </TouchableOpacity>

            <Text style={styles.profileNameStyle}>
              {route.params.data.seller_name}
            </Text>
            <Text style={styles.profileTitleStyle}>
              {route.params.data.tagline}
            </Text>
            <View
              style={[styles.taskRatingMainStyle, {justifyContent: 'center'}]}>
              <View style={styles.taskRatignParentStyle}>
                <FontAwesome name={'star'} size={18} color={'#FFD101'} />
                <Text style={styles.cardratingTextStyle}>
                  {route.params.data.user_rating}
                  <Text style={styles.cardRatingViewTextStyle}>
                    {' '}
                    ({route.params.data.review_users})
                  </Text>
                </Text>
              </View>
              <View style={styles.profileViewsParentStyle}>
                <Feather name={'eye'} size={16} color={'#999999'} />
                <Text style={styles.cardRatingViewTextStyle}>
                  {' '}
                  {route.params.data.profile_views}
                </Text>
              </View>
            </View>
            {route.params.data.address != '' && (
              <>
                <Text style={styles.profileTopHeadingStyle}>
                  {constant.profileDetailLocation}
                </Text>
                <Text style={styles.profileHeadingValueStyle}>
                  {route.params.data.address}
                </Text>
              </>
            )}
            <Text style={styles.profileTopHeadingStyle}>
              {constant.profileDetailSuccessRate}
            </Text>
            <Text style={styles.profileHeadingValueStyle}>
              {route.params.data.success_rate == ''
                ? 0
                : route.params.data.success_rate}
              {constant.profileDetailCompleted}
            </Text>
            <View style={{alignItems: 'center', paddingTop: 15}}>
              <ProgressBarAnimated
                backgroundColor={'#22C55E'}
                borderRadius={4}
                borderColor={'#ddd'}
                width={Dimensions.get('screen').width - 85}
                height={7}
                value={route.params.data.success_rate}
                backgroundColorOnComplete="#6CC644"
                barAnimationDuration={3000}
              />
            </View>
            <View style={{marginVertical: 10, marginHorizontal: 25}}>
              {/* <FormButton
                buttonTitle={constant.profileDetailContactSeller}
                backgroundColor={CONSTANT.primaryColor}
                textColor={'#fff'}
                iconName={'message-square'}
                onPress={() => navigation.navigate('searchResult')}
              /> */}
            </View>

            {added ? (
              <TouchableOpacity
                onPress={() => AddToSaveList('')}
                style={styles.profileSaveParentStyle}>
                {loader == true ? (
                  <View style={{marginRight: 10}}>
                    <BallIndicator count={9} size={16} color={'#0A0F26'} />
                  </View>
                ) : (
                  <Feather name={'heart'} size={16} color={'#EF4444'} />
                )}
                <Text style={styles.profileSaveTextStyle}>
                  {constant.profileDetailRemove}
                </Text>
              </TouchableOpacity>
            ) : (
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
            <View style={styles.drawerSeparatorStyle} />
            {route.params.data.education.length == 0 ? null : (
              <>
                <Text style={styles.profileSectionHeadingStyle}>
                  {constant.profileDetailQualification}
                </Text>

                <FlatList
                  data={route.params.data.education}
                  keyExtractor={(x, i) => i.toString()}
                  renderItem={({item, index}) => (
                    <TouchableOpacity activeOpacity={0.9}>
                      <QualificationCard item={item} />
                    </TouchableOpacity>
                  )}
                />
              </>
            )}

            {route.params.data.tasks.length == 0 ? null : (
              <>
                <View style={styles.drawerSeparatorStyle} />
                <Text style={styles.profileSectionHeadingStyle}>
                  {constant.profileDetailOfferedTasks}
                </Text>
                <FlatList
                  data={route.params.data.tasks}
                  keyExtractor={(x, i) => i.toString()}
                  renderItem={({item, index}) => (
                    <TouchableOpacity
                      onPress={() =>
                        navigation.navigate('taskDetail', {
                          data: item,
                          gallery: imagesArray,
                        })
                      }
                      activeOpacity={0.9}>
                      <View style={styles.profileTaskCardParentStyle}>
                        <ImageBackground
                          style={[
                            styles.hometaskImageBackgroundStyle,
                            {width: '100%'},
                          ]}
                          source={{uri: item.gallery[0]}}>
                          {item.featured == true && (
                            <View style={styles.taskFeaturedBadgeParent}>
                              <Text style={styles.taskFeaturedTextStyle}>
                                {constant.Featured}
                              </Text>
                            </View>
                          )}
                        </ImageBackground>
                        <View
                          style={[
                            styles.freelancerCardParentStyle,
                            {paddingHorizontal: 0, paddingVertical: 0},
                          ]}>
                          <View style={{flexDirection: 'row', marginTop: 10,width:"80%" }}>
                            <View style={{width:"100%"}}>
                              <View
                                style={[
                                  styles.freelancerCardTitleParentStyle,
                                  {marginLeft: 0},
                                ]}>
                                  <Text >
                                {Object.entries(item.tags).map(
                                  ([key, value]) => (
                                    <>
                                      <Text style={styles.taskDetailSkillList}>
                                        {value} ,{' '}
                                      </Text>
                                    </>
                                  ),
                                )}
                                </Text>
                              </View>
                              <View
                                style={[
                                  styles.cardRatingParent,
                                  {marginLeft: 0},
                                ]}>
                                <Text style={styles.freelancerCardTitleStyle}>
                                  {item.task_name}
                                </Text>
                              </View>
                            </View>
                          </View>
                          <View style={{alignItems: 'center', marginTop: 10}}>
                            <Text style={styles.freelancerStartingTextStyle}>
                              {constant.profileDetailfrom}
                            </Text>
                            <Text style={styles.freelancingCardPriceStyle}>
                              {decode(item.total_price_format)}
                            </Text>
                          </View>
                        </View>
                        <View
                          style={[
                            styles.taskRatingMainStyle,
                            {justifyContent: 'flex-start'},
                          ]}>
                          <View style={styles.taskRatignParentStyle}>
                            <FontAwesome
                              name={'star'}
                              size={18}
                              color={'#FFD101'}
                            />
                            <Text style={styles.cardratingTextStyle}>
                              {item.user_rating}
                              <Text style={styles.cardRatingViewTextStyle}>
                                {' '}
                                ({item.rating_count})
                              </Text>
                            </Text>
                          </View>
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              marginLeft: 10,
                            }}>
                            <Feather name={'eye'} size={16} color={'#999999'} />
                            <Text style={styles.cardRatingViewTextStyle}>
                              {' '}
                              {item.service_views}
                            </Text>
                          </View>
                        </View>
                        <View
                          style={styles.profiletaskCardBottomRowParentStyle}>
                          <View style={{flexDirection: 'row'}}>
                            <View
                              style={
                                styles.profileTaskCardSalesIconParentStyle
                              }>
                              <Feather
                                name={'archive'}
                                size={16}
                                color={'#9B59B6'}
                              />
                            </View>
                            <View>
                              <Text
                                style={styles.profileTaskCardIconMainTextStyle}>
                                {item.product_sales}
                              </Text>
                              <Text
                                style={styles.profileBottomRowIcontitleStyle}>
                                {constant.profileDetailSales}
                              </Text>
                            </View>
                          </View>

                          <View style={{flexDirection: 'row'}}>
                            <View style={styles.profiledeliveryIconStyle}>
                              <Feather
                                name={'archive'}
                                size={16}
                                color={'#1ABC9C'}
                              />
                            </View>
                            <View>
                              <Text
                                style={styles.profileTaskCardIconMainTextStyle}>
                                7 Days
                              </Text>
                              <Text
                                style={styles.profileBottomRowIcontitleStyle}>
                                {constant.profileDetailDelivery}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  )}
                />
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileDetail;
