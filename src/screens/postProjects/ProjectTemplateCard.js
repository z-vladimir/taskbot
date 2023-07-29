import {
  View,
  Text,
  SafeAreaView,
  ImageBackground,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import Feather from 'react-native-vector-icons/Feather';
import Header from '../../components/Header';
import {useSelector, useDispatch} from 'react-redux';
import styles from '../../style/styles.js';
import {useNavigation} from '@react-navigation/native';
import {decode} from 'html-entities';
import constant from '../../constants/translation';
import FormButton from '../../components/FormButton';
import * as CONSTANT from '../../constants/globalConstants';
import {updateStep, updatePostedItemOne,updatePostedItemTwo} from '../../Redux/PostProjectSlice';

const ProjectTemplateCard = ({item}) => {
  const navigationforword = useNavigation();
  const dispatch = useDispatch();

  const useThisTemplate = () => {
    let stepOne = {
      title: item.title,
      project_type: item.project_meta.project_type,
      min_price: item.project_meta.min_price,
      max_price: item.project_meta.max_price,
      duration: item.duration.length != 0 ?  item.duration[0].term_id.toString(): "",
      categories: item.product_cat.length != 0 ?  item.product_cat[0].term_id.toString(): "",
      video_url: item.project_meta.video_url,
      location: item.selected_location,
      zipcode: item.project_meta.hasOwnProperty("zipcode") ?  item.project_meta.zipcode : "",
      country: item.project_meta.hasOwnProperty("country") ?  item.project_meta.country : "",
      is_milestone: item.project_meta.is_milestone,
      details: item.description,
      attachments: item.downloadable_docs,
    };
    dispatch(updatePostedItemOne(stepOne));
    dispatch(updateStep(0));
    let skillsId = []
    if( item.skills.length != 0){
      for(var i = 0 ; i < item.skills.length; i++)
    {
      skillsId.push(item.skills[i].term_id)
    }}
    let langId = []
    if( item.languages.length != 0){
      for(var i = 0 ; i < item.languages.length; i++)
    {
      langId.push(item.languages[i].term_id)
    }}
    let stepTwo= {
      freelancer:item.freelancers,
      expertise:item.expertise_level.length != 0 ?  item.expertise_level[0].term_id.toString(): "",
      skills:skillsId,
      languages:langId,
    }
    dispatch(updatePostedItemTwo(stepTwo))
    navigationforword.navigate('postProject')
  }

  return (
    <>
      <View
        style={[
          styles.ProjectCardListParent,
          {
            borderBottomLeftRadius: 10,
            borderBottomRightRadius: 10,
            marginHorizontal:15,
          },
        ]}>
        <View style={[styles.ProjectListingCardContainer, {paddingBottom: 0}]}>
          <View
            style={{
              backgroundColor: '#F97316',
              paddingHorizontal: 10,
              marginBottom: 10,
            }}>
            <Text style={[styles.ProjectCardListStatus, {color: '#FFFFFF'}]}>
              {item.type_text}
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
            }}>
            <Text style={styles.ProjectListingTitle}>{item.title}</Text>
          </View>
          <View style={styles.ProjectListingPropertyContainer}>
           {item.posted_time != "" &&
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
            </View>}
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
            {item.expertise_level.length != 0 &&
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
            </View>}
            {item.freelancers != "" &&
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
            </View>}
          </View>
        </View>
        <View style={{paddingHorizontal: 10, paddingBottom: 10}}>
          <FormButton
            buttonTitle={constant.postProjectUseTemplate}
            backgroundColor={
              item.project_status == 'Declined'
                ? '#EF4444'
                : CONSTANT.primaryColor
            }
            textColor={'#FFFFFF'}
            // loader={loader}
            onPress={() => useThisTemplate()
            }
          />
        </View>
      </View>
    </>
  );
};

export default ProjectTemplateCard;
