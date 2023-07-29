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

const SellerProjectCard = ({item, selectedIndex}) => {
  const navigationforword = useNavigation();
  const userDetail = useSelector(state => state.value.userInfo);
  let mainItem = item;
  const getSingleProject = (value, type) => {
    axios
      .get(CONSTANT.BaseUrl + 'projects/get_projects', {
        params: {
          type: 'single',
          project_id: value,
          user_id: userDetail.user_id
        },
      })
      .then(async response => {
        if (response.status == 200) {
          if(type == "view")
          {
            navigationforword.navigate('projectDetails', {
              item: response.data.projects[0],
            });
          }
          if(type == "edit")
          {
            navigationforword.navigate('sendProposal',{data:response.data.projects[0],edit:true})
          }
          
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
  return (
    <>
      <View
        style={[
          styles.ProjectCardListParent,
          {
            borderBottomLeftRadius: item.proposal_status == 'Declined' ? 0 : 10,
            borderBottomRightRadius:
              item.proposal_status == 'Declined' ? 0 : 10,
          },
        ]}>
        <View style={styles.ProjectListingCardContainer}>
          <View style={{flexDirection: 'row'}}>
            <View
              style={{
                backgroundColor:
                  item.proposal_status == 'hired'
                    ? '#F97316'
                    : item.proposal_status == 'Draft'
                    ? '#F7F7F7'
                    : item.proposal_status == 'publish'
                    ? '#64748B'
                    : item.proposal_status == 'completed'
                    ? '#22C55E'
                    : item.proposal_status == 'disputed'
                    ? '#64748B'
                    : '#EF4444',
                paddingHorizontal: 10,
              }}>
              <Text
                style={[
                  styles.ProjectCardListStatus,
                  {
                    color:
                      item.proposal_status == 'Draft' ? '#0A0F26' : '#FFFFFF',
                  },
                ]}>
                {item.proposal_status == 'hired'
                  ? constant.buyerProjectCardOngoing
                  : item.proposal_status == 'publish'
                  ? constant.buyerProjectCardInQueue
                  : item.proposal_status == 'disputed'
                  ? constant.projectActivityDisputed
                  : constant.buyerProjectCardCompleted}
              </Text>
            </View>
            {item.project_detail.is_featured == 'yes' && (
              <View
                style={{
                  backgroundColor: '#FCCF14',
                  paddingHorizontal: 10,
                  marginLeft: 10,
                  //   marginBottom: 10,
                }}>
                <Text style={styles.ProjectListingCardStatus}>{constant.Featured}</Text>
              </View>
            )}
          </View>
          <View
            style={{
              //   paddingBottom: 10,
              paddingTop: 5,
              flexDirection: 'row',
            }}>
            <Text style={styles.ProjectListingCardName}>
              {item.project_detail.user_name}
            </Text>
            <Feather
              name={'check-circle'}
              size={13}
              color={'#22C55E'}
              style={styles.ProjectListingCardNameIcon}
            />
          </View>
          <View
            style={{
              flexDirection: 'row',
            }}>
            <Text style={styles.ProjectListingTitle}>
              {item.project_detail.title}
            </Text>
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
                {item.project_detail.posted_time}
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
                {item.project_detail.location_text}
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
                {item.project_detail.expertise_level[0].name}
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
                {item.freelancers == 1 ? 'freelancer' : 'freelancers'}
              </Text>
            </View>
          </View>
          <View style={styles.ProjectListingRateConatiner}>
            <Text style={styles.ProjectListingRateHourly}>
              {item.project_detail.type_text}
            </Text>
            <Text style={styles.ProjectListingRateHourlyPrice}>
              {decode(item.project_detail.project_price)}
            </Text>
          </View>
        </View>
        <View style={{paddingHorizontal: 10, paddingBottom: 10}}>
          <FormButton
            buttonTitle={
              item.proposal_status == 'hired' ||
              item.proposal_status == 'completed' ||
              item.proposal_status == 'disputed'
                ? constant.myProjectActivity
                : item.proposal_status == 'publish'
                ? constant.myProjectPorposal
                : item.proposal_status == 'Draft'
                ? constant.myProjectEdit
                : constant.myProjectSubmit
            }
            backgroundColor={
              item.proposal_status == 'Declined'
                ? '#EF4444'
                : CONSTANT.primaryColor
            }
            textColor={'#FFFFFF'}
            // loader={loader}
            onPress={() =>
              item.proposal_status == 'hired' ||
              item.proposal_status == 'disputed' ||
              item.proposal_status == 'completed'
                ? navigationforword.navigate('projectActivity', {
                    item: mainItem,
                    indexItem: mainItem,
                  })
                : item.proposal_status == 'publish'
                ? getSingleProject(mainItem.project_detail.project_id , "view")
                : null
            }
          />
          {item.proposal_status == 'publish' && (
            <TouchableOpacity
            onPress={() => getSingleProject(mainItem.project_detail.project_id , "edit")}
            style={{backgroundColor: '#F7F7F7', paddingVertical: 10}}>
              <Text style={styles.ProjectCardListEidtBtn}>{constant.projectDetailsEdit}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      {item.proposal_status == 'Declined' && (
        <View style={styles.ProjectCardListDisputeParent}>
          <Feather
            name={'alert-circle'}
            size={24}
            color={'#FF6167'}
            style={styles.ProjectListingPropertyListIcon}
          />

          <Text style={styles.ProjectCardListDisputeComment}>
            {item.status == 'cancele'
              ? constant.sellerProjectCardCancelledContract
              : constant.sellerProjectCardDeclinProposal}
          </Text>

          <FormButton
            buttonTitle={constant.myProjectDisputeRead}
            textColor={'#EF4444'}
            // loader={loader}
            iconName={'chevron-right'}
            //   onPress={() => navigationforword.navigate('projectDetails')}
          />
        </View>
      )}
    </>
  );
};

export default SellerProjectCard;
