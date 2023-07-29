import {
  View,
  Text,
  SafeAreaView,
  ImageBackground,
  ScrollView,
  Image,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import React, {useState, useEffect, useRef} from 'react';
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
import RBSheet from 'react-native-raw-bottom-sheet';
import StarRating from 'react-native-star-rating';
import axios from 'axios';

const BuyerProjectCard = ({item}) => {
  let mainItem = item;
  const navigationforword = useNavigation();
  const [emptyTask, setEmptyTask] = useState(false);
  const [reviewItem, setReviewItem] = useState({});
  const [projectDetails, setProjectDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const RBSheetReview = useRef();
  const userDetail = useSelector(state => state.value.userInfo);
  const newProposalData = item.proposals.filter(item => {
    return item.proposal_status != 'publish';
  });
  const handelRviewState = item => {
    setReviewItem(item);
    RBSheetReview.current.open();
  };

  const getSingleProject = value => {
    setLoading(true);
    axios
      .get(CONSTANT.BaseUrl + 'projects/get_projects', {
        params: {
          type: 'single',
          project_id: value,
        },
      })
      .then(async response => {
        if (response.status == 200) {
          setLoading(false);
          navigationforword.navigate('projectDetails', {
            item: response.data.projects[0],
          });
        } else if (response.data.type == 'error') {
          setLoading(false);
          Alert.alert(constant.OopsText, response.data.message_desc);
        }
      })
      .catch(error => {
        setLoading(false);
        console.log(error);
      });
  };

  return (
    <>
      <View style={[styles.empProjectCardListParent]}>
        <View style={styles.ProjectListingCardContainer}>
          <View style={{flexDirection: 'row'}}>
            <View
              style={{
                backgroundColor:
                  item.post_project_status == 'hired'
                    ? '#F97316'
                    : item.post_project_status == 'publish'
                    ? '#64748B'
                    : item.post_project_status == 'draft' ||
                      item.post_project_status == ''
                    ? '#f7f7f7'
                    : '#22C55E',

                paddingHorizontal: 10,
                marginBottom: 10,
              }}>
              <Text
                style={[
                  styles.ProjectCardListStatus,
                  {
                    color:
                      item.post_project_status == 'draft' ||
                      item.post_project_status == ''
                        ? '#0A0F26'
                        : '#FFFFFF',
                  },
                ]}>
                {item.post_project_status == 'hired'
                  ? constant.buyerProjectCardOngoing
                  : item.post_project_status == 'publish'
                  ? constant.buyerProjectCardInQueue
                  : item.post_project_status == 'draft'
                  ? constant.buyerProjectCardDrafted
                  : item.post_project_status == 'completed'
                  ? constant.buyerProjectCardCompleted
                  : constant.buyerProjectCardNew}
              </Text>
            </View>
            {item.is_featured == 'yes' && (
              <View
                style={{
                  backgroundColor: '#FCCF14',
                  paddingHorizontal: 10,
                  marginLeft: 10,
                  marginBottom: 10,
                }}>
                <Text style={styles.ProjectListingCardStatus}>{constant.buyerProjectCardFeatured}</Text>
              </View>
            )}
          </View>
          <View
            style={{
              flexDirection: 'row',
            }}>
            <Text style={styles.ProjectListingTitle}>{item.title}</Text>
          </View>
          <View style={styles.ProjectListingPropertyContainer}>
            {item.posted_time != '' && (
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
            )}
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
            {item.expertise_level.length != 0 && (
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
            )}
            {item.freelancers != '' && (
              <View style={styles.ProjectListingPropertyList}>
                <Feather
                  name={'users'}
                  size={13}
                  color={'#999999'}
                  style={styles.ProjectListingPropertyListIcon}
                />
                <Text style={styles.ProjectListingPropertyListTitle}>
                  {item.freelancers}{' '}
                  {item.freelancers == 1 ? 'freelancer' : 'freelancers'}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.ProjectListingRateConatiner}>
            <Text style={styles.ProjectListingRateHourly}>
              {item.type_text}
            </Text>
            <Text
              style={[
                styles.ProjectListingRateHourlyPrice,
                {color: '#1DA1F2'},
              ]}>
              {decode(item.project_price)}
            </Text>
          </View>
          {userDetail.user_type == 'buyers' && (
            <View style={{width: '100%'}}>
              {newProposalData.length != 0 && (
                <Text style={styles.empProjectCardFreelancerHeading}>
                  {constant.buyerProjectCardHiredFreelancers}
                </Text>
              )}
              <>
                <View style={styles.empProjectCardFreelancerListView}>
                  <FlatList
                    // style={{marginBottom: 10}}
                    showsVerticalScrollIndicator={false}
                    data={newProposalData}
                    listKey={(item, index) => `_key${index.toString()}`}
                    keyExtractor={(x, i) => i.toString()}
                    renderItem={({item, index}) => (
                      <>
                        {/* {item.proposal_status != 'publish' && ( */}
                        <>
                          <View
                            style={{
                              paddingHorizontal: 15,
                              paddingVertical: 10,
                              alignItems: 'flex-start',
                            }}>
                            <View
                              style={[
                                styles.empProjectStatus,
                                {
                                  backgroundColor:
                                    item.proposal_status == 'hired'
                                      ? '#F97316'
                                      : item.proposal_status == 'disputed'
                                      ? '#64748B'
                                      : '#22C55E',
                                },
                              ]}>
                              <Text style={[styles.empProjectStatusText]}>
                                {item.proposal_status == 'hired'
                                  ? 'Ongoing'
                                  : item.proposal_status == 'disputed'
                                  ? 'Disputed'
                                  : 'Completed'}
                              </Text>
                            </View>
                            <View style={{flexDirection: 'row'}}>
                              <Image
                                style={styles.empProjectCardFreelancerImg}
                                source={{uri: item.seller_detail.avatar}}
                              />
                              <View
                                style={{
                                  justifyContent: 'space-between',
                                  paddingHorizontal: 15,
                                }}>
                                <View
                                  style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                  }}>
                                  <Text style={styles.empProjectFreelancerName}>
                                    {item.seller_detail.user_name}
                                  </Text>
                                  {item.proposal_status == 'completed' && (
                                    <>
                                      <FontAwesome
                                        name={'star'}
                                        size={14}
                                        color={'#FCCF14'}
                                        style={{paddingHorizontal: 10}}
                                      />
                                      <Text
                                        style={styles.empProjectFreelancerName}>
                                        {item.rating_details.rating}
                                      </Text>
                                    </>
                                  )}
                                </View>
                                {/* <Text style={styles.empProjectCardActivity}>
                       Add review
                     </Text> */}
                                {item.proposal_status == 'hired' ||
                                item.proposal_status == 'disputed' ? (
                                  <Text
                                    style={styles.empProjectCardActivity}
                                    onPress={() =>
                                      navigationforword.navigate(
                                        'projectActivity',
                                        {
                                          item: mainItem,
                                          indexItem: item,
                                        },
                                      )
                                    }>
                                    {constant.buyerProjectCardViewActivity}
                                  </Text>
                                ) : (
                                  <Text
                                    style={styles.empProjectCardActivity}
                                    onPress={() => {
                                      handelRviewState(item);
                                    }}>
                                    {constant.buyerProjectCardReadReview}
                                  </Text>
                                )}
                              </View>
                            </View>
                          </View>
                          {index === newProposalData.length - 1 ? null : (
                            <View
                              style={{
                                borderTopWidth: 1,
                                borderColor: '#DDDDDD',
                                width: '100%',
                              }}
                            />
                          )}
                        </>
                        {/* )} */}
                      </>
                    )}
                  />
                </View>
              </>
              <View style={styles.empProjectCardProposalView}>
                <View style={{width: '50%'}}>
                  <FlatList
                    style={{flexDirection: 'row'}}
                    showsVerticalScrollIndicator={false}
                    data={mainItem.proposals.slice(0, 4)}
                    keyExtractor={(x, i) => i.toString()}
                    listKey={(item, index) => `_key${index.toString()}`}
                    ListEmptyComponent={
                      <Text style={styles.empProjectFreelancerName}>
                       {constant.buyerProjectCardNoProposals}
                      </Text>
                    }
                    renderItem={({item, index}) => (
                      <View
                        style={{
                          backgroundColor: '#fff',
                          height: 45,
                          width: 45,
                          borderRadius: 45 / 2,
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginLeft: index == 0 ? 0 : -15,
                        }}>
                        <Image
                          style={styles.empProjectCardProposalImg}
                          source={{uri: item.seller_detail.avatar}}
                        />
                      </View>
                    )}
                  />
                </View>
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '50%',
                  }}
                  onPress={() =>
                    navigationforword.navigate('proposalListing', {
                      item: mainItem,
                      indexItem: item,
                    })
                  }>
                  <Text style={styles.empProjectCardProposalText}>
                    {constant.buyerProjectCardViewAllProposals}
                  </Text>
                  <Feather name={'chevron-down'} size={20} color={'#999999'} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
        <View style={{paddingHorizontal: 10, paddingBottom: 10}}>
          <FormButton
            buttonTitle={'View project'}
            backgroundColor={
              item.project_status == 'Declined'
                ? '#EF4444'
                : CONSTANT.primaryColor
            }
            textColor={'#FFFFFF'}
            loader={loading}
            onPress={() => getSingleProject(mainItem.project_id)}
          />
          {(item.post_project_status == 'draft' ||
            item.post_project_status == '') && (
            <View
              style={{
                backgroundColor: '#F7F7F7',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 10,
              }}>
              <Text style={styles.ProjectCardListEidtBtn}>{constant.buyerProjectCardEditProject}</Text>
            </View>
          )}
        </View>
      </View>
      <RBSheet
        ref={RBSheetReview}
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
              {mainItem.title}
            </Text>
            <Feather
              onPress={() => RBSheetReview.current.close()}
              style={styles.RBSheetCloseIconStyle}
              name={'x'}
              size={20}
              color={'#1C1C1C'}
            />
          </View>
          <View style={{paddingHorizontal: 15, paddingVertical: 10}}>
            {Object.keys(reviewItem).length != 0 && (
              <View
                style={{
                  paddingHorizontal: 15,
                  paddingVertical: 10,
                  alignItems: 'flex-start',
                }}>
                <View style={{flexDirection: 'row'}}>
                  <Image
                    style={styles.empProjectCardFreelancerImg}
                    source={{uri: reviewItem.seller_detail.avatar}}
                  />
                  <View
                    style={{
                      justifyContent: 'space-between',
                      paddingHorizontal: 15,
                    }}>
                    <View
                      style={
                        {
                          // flexDirection: 'row',
                          // alignItems: 'center',
                        }
                      }>
                      <Text style={styles.empProjectFreelancerName}>
                        {reviewItem.seller_detail.user_name}
                      </Text>

                      <View style={{flexDirection: 'row', paddingTop: 5}}>
                        <Text style={styles.empProjectFreelancerName}>
                          {reviewItem.rating_details.rating}
                        </Text>
                        {/* <FontAwesome
                          name={'star'}
                          size={14}
                          color={'#FCCF14'}
                          
                        /> */}
                        <View style={{paddingLeft: 5}}>
                          <StarRating
                            disabled={false}
                            maxStars={5}
                            starSize={16}
                            fullStarColor={'#fecb02'}
                            emptyStarColor={'#fecb02'}
                            rating={reviewItem.rating_details.rating}
                            // style={{paddingLeft: 10}}
                            // selectedStar={rating => setRatings(rating)}
                          />
                        </View>
                      </View>
                    </View>
                    {/* <Text style={styles.empProjectCardActivity}>
                     Add review
                   </Text> */}
                  </View>
                </View>
                <Text
                  style={[
                    styles.empProjectCardActivity,
                    {color: '#1C1C1C', paddingTop: 10},
                  ]}>
                  {reviewItem.rating_details.content}
                </Text>
              </View>
            )}
          </View>
        </View>
      </RBSheet>
    </>
  );
};

export default BuyerProjectCard;
