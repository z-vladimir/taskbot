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
  Dimensions,
} from 'react-native';
import React, {useState, useEffect, useRef} from 'react';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Header from '../../components/Header';
import {useSelector, useDispatch} from 'react-redux';
import styles from '../../style/styles.js';
import {decode} from 'html-entities';
import constant from '../../constants/translation';
import FormButton from '../../components/FormButton';
import * as CONSTANT from '../../constants/globalConstants';
import RBSheet from 'react-native-raw-bottom-sheet';

const ProposalListing = ({route,navigation}) => {
  const [show, setShow] = useState(false);
  const [emptyTask, setEmptyTask] = useState(false);
  const [text, setText] = useState('');
  const RBSheetSortProject = useRef();
  const handelSortBy = value => {
    console.log('value', value);
  };
  let mainItem = route.params.item;
  return (
    <SafeAreaView style={styles.globalContainer}>
      <Header
        title={constant.empProjectDetailsHeader}
        titleColor={'#1C1C1C'}
        backColor={'#F7F7F7'}
        iconColor={'#1C1C1C'}
        backIcon={true}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <>
          <View style={styles.ProjectDetailsContainer}>
            <View
              style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <View style={{flexDirection: 'row'}}>
                {route.params.item.type_text == 'hourly' ? (
                  <View style={styles.empProjectDetailsHourly}>
                    <Text style={styles.ProjectDetailsHourlyText}>
                      {constant.projectActivityHourlyProject}
                    </Text>
                  </View>
                ) : (
                  <View style={[styles.ProjectDetailsFixed, {marginLeft: 0,justifyContent:"center"}]}>
                    <Text style={styles.ProjectDetailsFiexdText}>
                      {constant.projectActivityFixedPriceProject}
                    </Text>
                  </View>
                )}
                {route.params.item.is_featured == 'yes' && (
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
                {route.params.item.title}
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
                      {route.params.item.posted_time}
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
                      {route.params.item.location_text}
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
                      {route.params.item.expertise_level[0].name}
                    </Text>
                  </View>
                </View>
                <View style={{paddingVertical: 10}}>
                  <FormButton
                    buttonTitle={constant.ProposalListingGoProjectListing}
                    backgroundColor={CONSTANT.primaryColor}
                    textColor={'#FFFFFF'}
                    // loader={loader}
                    onPress={() => navigation.navigate('myProjectListing')}
                  />
                  {/* <View
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
        <View style={styles.empProjectActivityContainer}>
          <View style={styles.empProjectActivityView}>
            <View style={styles.empAllProjectsView}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                <Text style={styles.empAllProjectsHeading}>
                  {constant.ProposalListingAllProposal}
                  <Text style={styles.empAllProjectsNo}>
                    {'  '} ({route.params.item.proposals.length})
                  </Text>
                </Text>

                <View>
                  {/* <Feather
                    name={'chevron-down'}
                    size={18}
                    color={'#999999'}
                    style={styles.ProjectDetailsPropertyListIcon}
                    onPress={() => RBSheetSortProject.current.open()}
                  /> */}
                </View>
              </View>

              <FlatList
                // style={{marginBottom: 10}}
                showsVerticalScrollIndicator={false}
                data={route.params.item.proposals}
                keyExtractor={(x, i) => i.toString()}
                renderItem={({item, index}) => (
                  <>
                    <View style={styles.empProjectCardFreelancerListView}>
                      <View>
                        <View
                          style={{
                            flexDirection: 'row',
                            paddingHorizontal: 15,
                            alignItems: 'center',
                            // backgroundColor: 'red',
                            paddingVertical: 15,
                          }}>
                          <Image
                            style={styles.empProjectCardFreelancerImg}
                            source={{uri: item.seller_detail.avatar}}
                          />

                          <View
                            style={{
                              paddingHorizontal: 15,
                              alignItems: 'center',
                            }}>
                            <View>
                              <Text style={styles.empProjectFreelancerName}>
                                {item.seller_detail.user_name}
                              </Text>
                              {item.rating_details.length != 0 && (
                                <View
                                  style={{
                                    flexDirection: 'row',
                                    paddingTop: 5,
                                    alignItems: 'center',
                                  }}>
                                  <FontAwesome
                                    name={'star'}
                                    size={13}
                                    color={'#FCCF14'}
                                  />
                                  <Text
                                    style={styles.empProjectFreelancerRating}>
                                    4.5
                                  </Text>
                                </View>
                              )}
                            </View>
                          </View>
                        </View>
                        <View style={styles.sendProjectDashedBorder} />
                        <View style={styles.empProjectDetailsPorposals}>
                          <Text
                            style={styles.empProjectDetailsPorposalsHeading}>
                            {constant.ProposalListingBidPrice}
                          </Text>
                          <Text style={styles.empProjectDetailsPorposalsData}>
                            {decode(item.proposal_price_formate)}
                          </Text>
                        </View>
                        <View style={styles.sendProjectDashedBorder} />
                        <View style={styles.empProjectDetailsPorposals}>
                          <Text
                            style={styles.empProjectDetailsPorposalsHeading}>
                            {constant.ProposalListingDate}
                          </Text>
                          <Text style={styles.empProjectDetailsPorposalsData}>
                            {item.proposal_meta.post_modified_gmt}
                          </Text>
                        </View>
                        <View style={styles.sendProjectDashedBorder} />
                        <View style={styles.empProjectDetailslsStatusView}>
                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                            }}>
                            <Text
                              style={styles.empProjectDetailsPorposalsHeading}>
                              {constant.ProposalListingStatus}
                            </Text>
                            <View
                              style={[
                                styles.empProjectDetailslsStatus,
                                {
                                  backgroundColor:
                                    item.proposal_status == 'hired'
                                      ? '#F97316'
                                      : item.proposal_status == 'New'
                                      ? '#FFFFFF'
                                      : item.proposal_status == 'completed'
                                      ? '#22C55E'
                                      : item.proposal_status == 'publish'
                                      ? '#64748B'
                                      : item.proposal_status == 'disputed'
                                      ? '#64748B'
                                      : '#EF4444',
                                },
                              ]}>
                              <Text
                                style={[
                                  styles.empProjectDetailsStatusText,
                                  {
                                    color:
                                      item.status == 'New'
                                        ? '#1C1C1C'
                                        : '#ffffff',
                                  },
                                ]}>
                                {item.proposal_status == 'publish'
                                  ? constant.buyerProjectCardInQueue
                                  : item.proposal_status == 'completed'
                                  ? constant.buyerProjectCardCompleted
                                  : item.proposal_status == 'hired'
                                  ? constant.buyerProjectCardOngoing
                                  : item.proposal_status == 'disputed'
                                  ? constant.projectActivityDisputed
                                  : constant.projectActivityDeclined}
                              </Text>
                            </View>
                          </View>
                          <View style={{paddingTop: 10}}>
                            <FormButton
                              buttonTitle={
                                item.proposal_status == 'publish'
                                  ? constant.ProposalActivityHeading
                                  : constant.ProposalListingViewActivity
                              }
                              backgroundColor={CONSTANT.primaryColor}
                              textColor={'#FFFFFF'}
                              // loader={loader}
                              onPress={() =>
                                item.proposal_meta.post_status == 'publish'
                                  ? navigation.navigate(
                                      'proposalActivity',
                                      {
                                        item: item,
                                        mainItem: mainItem,
                                      },
                                    )
                                  : navigation.navigate(
                                      'projectActivity',
                                      {
                                        item: mainItem,
                                        indexItem: item,
                                      },
                                    )
                              }
                            />
                          </View>
                        </View>
                      </View>
                    </View>
                  </>
                )}
              />
            </View>
          </View>
        </View>
      </ScrollView>
      <RBSheet
        ref={RBSheetSortProject}
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
            <Text style={styles.RBSheetHeaderTextStyle}>{constant.ProposalListingSortBy}</Text>
            <Feather
              onPress={() => RBSheetSortProject.current.close()}
              style={styles.RBSheetCloseIconStyle}
              name={'x'}
              size={20}
              color={'#1C1C1C'}
            />
          </View>
          <TouchableOpacity
            style={styles.RBSheetSortView}
            onPress={() => handelSortBy('LowToHeigh')}>
            <View style={styles.RBSheetSortValue}>
              <Text style={styles.RBSheetSortText}>{constant.ProposalListingAllProject}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.RBSheetSortView, {backgroundColor: '#F7F7F7'}]}
            onPress={() => handelSortBy('HeighToLow')}>
            <View style={styles.RBSheetSortValue}>
              <Text style={styles.RBSheetSortText}>{constant.ProposalListingPublished}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.RBSheetSortView}
            onPress={() => handelSortBy('NewToOld')}>
            <View style={styles.RBSheetSortValue}>
              <Text style={styles.RBSheetSortText}>{constant.projectActivityDisputed}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.RBSheetSortView}
            onPress={() => handelSortBy('OldToNew')}>
            <View style={styles.RBSheetSortValue}>
              <Text style={styles.RBSheetSortText}>{constant.buyerProjectCardOngoing}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </RBSheet>
    </SafeAreaView>
  );
};

export default ProposalListing;
