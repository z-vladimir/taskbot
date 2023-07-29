import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  Image,
  FlatList,
  Alert,
  Share,
  useWindowDimensions,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import React, {useState, useEffect} from 'react';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Carousel from 'react-native-snap-carousel';
import styles from '../../style/styles';
import FreelancerCard from '../home/homeCards/freelancerCard';
import FormButton from '../../components/FormButton';
import axios from 'axios';
import * as CONSTANT from '../../constants/globalConstants';
import {useSelector, useDispatch} from 'react-redux';
import HTML from 'react-native-render-html';
import SubTaskCard from './subTaskCard';
import {decode} from 'html-entities';
import {
  BallIndicator,
} from "react-native-indicators";
import constant from '../../constants/translation';

const TaskDetail = ({navigation, route}) => {
  const userDetail = useSelector(state => state.value.userInfo);
  const verify = useSelector(state => state.value.verified);
  const savedList = useSelector(state => state.saved.savedTasks);
  const token = useSelector(state => state.value.token);

  const {width} = useWindowDimensions();
  const data = route.params.data;
  const sliderWidth = Dimensions.get('window').width;
  const itemWidth = 300;

  const [selectedPlan, setSelectedPlan] = useState('basic');
  const [show, setShow] = useState(false);
  const [imagesArray, setImagesArray] = useState([]);
  const [tagArray, setTagArray] = useState([]);
  const [packageIndex, setPackageIndex] = useState(0);
  const [added, setAdded] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [refreshFlatList, setRefreshFlatList] = useState(false);
  const [loader, setLoader] = useState(false);
  var htmlCode = data.task_content;
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
    savedList.map(data => {
      if (route.params.data.task_id == data.id) {
        setAdded(true);
      }
    });
    Object.entries(data.tags).map(([key, value]) =>
      tagArray.push({
        key: key,
        value: value,
      }),
    );
    setRefreshFlatList(!refreshFlatList);
  }, []);

  const renderItem = ({item, index}) => {
    return (
      <View style={styles.imageCarouselView}>
        <Image style={styles.imageCarouselImage} source={{uri: item.url}} />
      </View>
    );
  };

  const AddToSaveList = value => {
     setLoader(true);
    axios
      .post(
        CONSTANT.BaseUrl + 'update-saveditem',
        {
          post_id: userDetail.profile_id,
          action: 'taskbot_saved_items',
          item_id: route.params.data.task_id,
          type: 'tasks',
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

  const onClickShare = () => {
    Share.share(
      {
        message: data.task_link,
        url: data.task_link,
        title: "Have a look",
      },
      {
        // Android only:
        dialogTitle: "Have a look",
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
          name="chevron-left"
          type="chevron-left"
          color={'#1C1C1C'}
          size={24}
        />
        <View style={{flexDirection: 'row'}}>
      
          {added ? (
            <TouchableOpacity onPress={() => AddToSaveList('')}>
              {loader == true ? (
                <View style={{ marginRight:10,marginTop:10}}>
                  <BallIndicator count={9} size={16} color={"#0A0F26"} />
                </View>
              ):
              <Feather
                style={{paddingHorizontal: 10}}
                name="heart"
                type="heart"
                color={'#EF4444'}
                size={22}
              />}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => AddToSaveList('saved')}>
               {loader == true ? (
                <View style={{ marginRight:10,marginTop:10}}>
                  <BallIndicator count={9} size={16} color={"#0A0F26"} />
                </View>
              ):
              <Feather
                style={{paddingHorizontal: 10}}
                name="heart"
                type="heart"
                color={'#999999'}
                size={22}
              />
               }
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
        <View style={{marginTop: 10}}>
          <Carousel
            loop={true}
            layout={'default'}
            data={route.params.gallery}
            renderItem={renderItem}
            sliderWidth={sliderWidth}
            itemWidth={itemWidth}
            autoplay={false}
          />
        </View>

        <View style={styles.freelancerCardParentStyle}>
          <View style={{flexDirection: 'row'}}>
            <View>
              <ImageBackground
                imageStyle={{borderRadius: 70 / 2}}
                style={styles.homefreelancerImageBackgroundStyle}
                source={{
                  uri: data.avatar,
                }}>
                <View style={styles.homefreelancerImageEditIconStyle} />
              </ImageBackground>
            </View>
            <View>
              <View style={styles.freelancerCardTitleParentStyle}>
                <Text style={styles.freelancerCardTitleStyle}>
                  {data.seller_name}
                </Text>
              </View>
              <View style={styles.cardRatingParent}>
                <FontAwesome name={'star'} size={18} color={'#FFD101'} />
                <Text style={styles.cardratingTextStyle}>
                  {data.user_rating}{' '}
                  <Text style={styles.cardRatingViewTextStyle}>
                    ({data.review_users})
                  </Text>
                </Text>
              </View>
            </View>
          </View>
          {/* <View style={{alignItems: 'center', justifyContent: 'center'}}>
            <Feather
              style={{marginHorizontal: 5}}
              name={'message-square'}
              size={24}
              color={'#1C1C1C'}
            />
          </View> */}
        </View>
        <View style={styles.taskDetailDataView}>
          {data.featured == true && (
            <Text style={styles.taskDetailFeatureTag}>{constant.Featured}</Text>
          )}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {Object.entries(data.categories).map((key, index) => (
              <>
                <Text style={styles.taskDetailSkillList}>
                  {decode(key[1])}{' '}
                  {Object.keys(data.categories).length - 1 == index ? '' : ','}{' '}
                </Text>
              </>
            ))}
          </ScrollView>

          <Text style={styles.taskDetailMainHeading}>{data.task_name}</Text>
          <View style={styles.taskDetailViewRating}>
            <FontAwesome name={'star'} size={18} color={'#FFD101'} />
            <Text style={styles.cardratingTextStyle}>
              {data.average_rating}
              <Text style={styles.cardRatingViewTextStyle}>
                {' '}
                ({data.review_users})
              </Text>
            </Text>
            <Feather
              //onPress={() => navigation.goBack()}
              style={styles.taskDetailEyeIcon}
              name="eye"
              type="eye"
              color={'#999999'}
              size={16}
            />
            <Text style={styles.cardRatingViewTextStyle}>
              {' '}
              {data.service_views}
            </Text>
          </View>
          <View style={{width: '100%'}}>
            <HTML
              tagsStyles={tagsStyles}
              source={{html: htmlCode}}
              baseFontStyle={styles.taskDetailDescriptionText}
            />
          </View>
        </View>
        <View style={styles.taskDetailPlansMainView}>
          {data.attributes.length == 1 ? (
            <TouchableOpacity
              onPress={() => {
                setSelectedPlan('basic'), setPackageIndex(0);
              }}
              style={[
                styles.taskDetailPlansSingleView,
                {
                  backgroundColor: selectedPlan == 'basic' ? '#fff' : '#F7F7F7',
                  borderBottomWidth: selectedPlan == 'basic' ? 0 : 1,
                  width: '100%',
                },
              ]}>
              <Text style={styles.taskDetailPlansSingleViewText}>
                {data.attributes[0].title}
              </Text>
            </TouchableOpacity>
          ) : data.attributes.length == 2 ? (
            <>
              <TouchableOpacity
                onPress={() => {
                  setSelectedPlan('basic'), setPackageIndex(0);
                }}
                style={[
                  styles.taskDetailPlansSingleView,
                  {
                    backgroundColor:
                      selectedPlan == 'basic' ? '#fff' : '#F7F7F7',
                    borderBottomWidth: selectedPlan == 'basic' ? 0 : 1,
                    width: '50%',
                  },
                ]}>
                <Text style={styles.taskDetailPlansSingleViewText}>
                  {data.attributes[0].title}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setSelectedPlan('popular'), setPackageIndex(1);
                }}
                style={[
                  styles.taskDetailPlansSingleView,
                  {
                    backgroundColor:
                      selectedPlan == 'popular' ? '#fff' : '#F7F7F7',
                    borderBottomWidth: selectedPlan == 'popular' ? 0 : 1,
                    width: '50%',
                  },
                ]}>
                <Text style={styles.taskDetailPlansSingleViewText}>
                  {data.attributes[1].title}
                </Text>
              </TouchableOpacity>
            </>
          ) : data.attributes.length == 3 ? (
            <>
              <TouchableOpacity
                onPress={() => {
                  setSelectedPlan('basic'), setPackageIndex(0);
                }}
                style={[
                  styles.taskDetailPlansSingleView,
                  {
                    backgroundColor:
                      selectedPlan == 'basic' ? '#fff' : '#F7F7F7',
                    borderBottomWidth: selectedPlan == 'basic' ? 0 : 1,
                  },
                ]}>
                <Text style={styles.taskDetailPlansSingleViewText}>
                  {data.attributes[0].title}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setSelectedPlan('popular'), setPackageIndex(1);
                }}
                style={[
                  styles.taskDetailPlansSingleView,
                  {
                    backgroundColor:
                      selectedPlan == 'popular' ? '#fff' : '#F7F7F7',
                    borderBottomWidth: selectedPlan == 'popular' ? 0 : 1,
                  },
                ]}>
                <Text style={styles.taskDetailPlansSingleViewText}>
                  {data.attributes[1].title}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setSelectedPlan('premium'), setPackageIndex(2);
                }}
                style={[
                  styles.taskDetailPlansSingleView,
                  {
                    backgroundColor:
                      selectedPlan == 'premium' ? '#fff' : '#F7F7F7',
                    borderBottomWidth: selectedPlan == 'premium' ? 0 : 1,
                  },
                ]}>
                <Text style={styles.taskDetailPlansSingleViewText}>
                  {data.attributes[2].title}
                </Text>
              </TouchableOpacity>
            </>
          ) : null}
        </View>
        <View style={styles.taskDetailPlansBodyView}>
          <View style={{flexDirection: 'row'}}>
            <ImageBackground
              // imageStyle={{borderRadius: 56 / 2}}
              style={styles.taskDetailPlansBodyImage}
              source={
                packageIndex == 0
                  ? require('../../../assets/images/plan.png')
                  : packageIndex == 1
                  ? require('../../../assets/images/premium.png')
                  : require('../../../assets/images/popular.png')
              }
            />
            <View style={styles.taskDetailPlansBodyNameView}>
              <Text style={styles.taskDetailPlansBodyNameText}>
                {data.attributes[packageIndex].title}
              </Text>
              <Text style={styles.taskDetailPlansBodyPriceText}>
                {decode(data.attributes[packageIndex].price)}
              </Text>
            </View>
          </View>
          <Text style={styles.taskDetailPlansBodyDesc}>
            {data.attributes[packageIndex].description}
          </Text>
          <Text style={styles.taskDetailsubHeading}>
            {constant.taskDetailsPackage}
          </Text>
          <FlatList
            showsVerticalScrollIndicator={false}
            data={data.attributes[packageIndex].fields}
            keyExtractor={(x, i) => i.toString()}
            renderItem={({item, index}) => (
              <View style={styles.taskDetailPlansPackageView}>
                <Feather
                  name="check"
                  type="check"
                  color={item.plan_value == 'yes' ? '#22C55E' : '#DDDDDD'}
                  size={24}
                />
                <Text style={styles.taskDetailPlansPackageText}>
                  {item.label}
                </Text>
              </View>
            )}
          />
          <FlatList
            showsVerticalScrollIndicator={false}
            data={data.custom_fields}
            keyExtractor={(x, i) => i.toString()}
            renderItem={({item, index}) => (
              <View style={styles.taskDetailPlansPackageView}>
                <Feather
                  name="check"
                  type="check"
                  color={'#22C55E'}
                  size={24}
                />
                <Text style={styles.taskDetailPlansPackageText}>
                  {item.title} (
                  {packageIndex == 0
                    ? item.basic
                    : packageIndex == 1
                    ? item.premium
                    : item.pro}
                  )
                </Text>
              </View>
            )}
          />
          {data.user_id !=  userDetail.user_id &&
            <FormButton
            onPress={() => {
              userDetail.user_type != 'buyers'
                ? Alert.alert(
                    constant.OopsText,
                    constant.taskDetailsBuyerAccess,
                  )
                : navigation.navigate('orderDetail', {data: data})
            }}
            buttonTitle={constant.taskDetailsBtnTitle}
            backgroundColor={CONSTANT.primaryColor}
            textColor={'#fff'}
            iconName={'arrow-right'}
          />}
          <View style={styles.taskDetailPlansPackageFeatureView}>
            <View style={styles.taskDetailPlansPackageFeature}>
              <View style={styles.taskDetailPlansPkgFeatureIconOne}>
                <Feather
                  name="clock"
                  type="clock"
                  color={'#6366F1'}
                  size={22}
                />
              </View>
              <Text style={styles.taskDetailPlansPkgFeatureText}>
                {data.product_sales}
              </Text>
              <Text style={styles.taskDetailPlansPkgFeatureTextTwo}>
                {constant.taskDetailsSales}
              </Text>
            </View>
            <View style={styles.taskDetailPlansPackageFeature}>
              <View style={styles.taskDetailPlansPkgFeatureIconTwo}>
                <Feather
                  name="trending-up"
                  type="trending-up"
                  color={'#F97316'}
                  size={22}
                />
              </View>
              <Text style={styles.taskDetailPlansPkgFeatureText}>
                {(data.average_rating * 100) / 5}
                {'%'}
              </Text>
              <Text style={styles.taskDetailPlansPkgFeatureTextTwo}>
                {constant.taskDetailsRating}
              </Text>
            </View>
            <View style={styles.taskDetailPlansPackageFeatureLast}>
              <View style={styles.taskDetailPlansPkgFeatureIconThree}>
                <Feather name="gift" type="gift" color={'#22C55E'} size={22} />
              </View>
              <Text style={styles.taskDetailPlansPkgFeatureText}>
                {data.attributes[packageIndex].delivery_title}
              </Text>
              <Text style={styles.taskDetailPlansPkgFeatureTextTwo}>
                {constant.taskDetailsDelivery}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.taskDetailDataView}>
          <Text style={styles.taskDetailsubHeading}>
            {constant.taskDetailsAdditional}
          </Text>
          <FlatList
           style={{width:'100%'}}
            data={data.sub_tasks}
            keyExtractor={(x, i) => i.toString()}
            renderItem={({item, index}) => (
              <TouchableOpacity activeOpacity={0.9}>
                <SubTaskCard
                  item={item}
                  index={index}
                  length={data.sub_tasks.length}
                />
              </TouchableOpacity>
            )}
          />
        </View>
        {tagArray.length >= 1 && (
          <View style={styles.taskDetailDataView}>
            <Text style={styles.taskDetailsubHeading}>
              {constant.taskDetailsTag}
            </Text>
            <FlatList
              style={{marginBottom:10}}
              columnWrapperStyle={{flexWrap: 'wrap'}}
              numColumns={tagArray.length <= 1 ? 2 : tagArray.length}
              extraData={refreshFlatList}
              data={tagArray}
              keyExtractor={(x, i) => i.toString()}
              renderItem={({item, index}) => {
                return (
                  <TouchableOpacity
                    activeOpacity={0.3}
                    style={styles.taskDetailNoItemList}>
                    <Text style={{color:'#1C1C1C' , fontFamily:'Urbanist-Regular' , fontSize:14}}>
                      {item.value}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        )}
        <View style={styles.taskDetailDataView}>
          <Text style={styles.taskDetailsubHeading}>
            {constant.taskDetailsFaq}
          </Text>

          <FlatList
            data={data.faqs}
            keyExtractor={(x, i) => i.toString()}
            renderItem={({item, index}) => (
              <TouchableOpacity onPress={() =>
                setSelectedIndex(selectedIndex == index ? null : index)
              } activeOpacity={0.9}>
                <View style={styles.taskDetailFAQView}>
                  <View style={styles.taskDetailFAQViewHeader}>
                    <Text style={styles.taskDetailFAQHeadingText}>
                      {item.question}
                    </Text>
                    <Feather
                      
                      style={{width: '10%', textAlign: 'right'}}
                      name={selectedIndex == index ? 'minus' : 'plus'}
                      type={selectedIndex == index ? 'minus' : 'plus'}
                      color={'#1C1C1C'}
                      size={18}
                    />
                  </View>
                  {selectedIndex == index && (
                    <Text style={styles.taskDetailFAQBodyText}>
                      {item.answer}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
        <View style={styles.taskDetailDataView}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={styles.taskDetailReviewHeading}>
              {data.task_commnets.totals_comments} {constant.taskDetailsReviews}
            </Text>
            <Text style={styles.taskDetailReviewHeadingValue}>
              ({data.average_rating} {constant.taskDetailsOverall})
            </Text>
          </View>
          <FlatList
            data={data.task_commnets.list}
            keyExtractor={(x, i) => i.toString()}
            renderItem={({item, index}) => (
              <TouchableOpacity activeOpacity={0.9}>
                <View style={styles.taskDetailReviewItemHeader}>
                  <View style={styles.taskDetailFAQViewHeader}>
                    <ImageBackground
                      imageStyle={{borderRadius: 40 / 2}}
                      style={styles.taskDetailReviewItemImage}
                      source={{uri: item.buyer_img}}
                    />
                    <View style={styles.taskDetailReviewItemHeading}>
                      <Text style={styles.taskDetailReviewItemHeadingText}>
                        {decode(item.title)}
                      </Text>
                      <View style={styles.taskDetailFAQViewHeader}>
                        <FontAwesome
                          name={'star'}
                          size={16}
                          color={'#FFD101'}
                        />
                        <Text style={styles.taskDetailReviewItemStarText}>
                          {item.rating}
                        </Text>
                        <Feather
                          style={{marginLeft: 30}}
                          name={'calendar'}
                          size={16}
                          color={'#999999'}
                        />
                        <Text style={styles.taskDetailReviewItemTimeText}>
                          {item.comment_date}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <Text style={styles.taskDetailServicesDesc}>
                    {item.content}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TaskDetail;
