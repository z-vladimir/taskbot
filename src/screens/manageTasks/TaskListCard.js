import {
  View,
  Text,
  Alert,
  ImageBackground,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Switch,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Header from '../../components/Header';
import {useSelector, useDispatch} from 'react-redux';
import * as CONSTANT from '../../constants/globalConstants';
import styles from '../../style/styles.js';
import axios from 'axios';
import {decode} from 'html-entities';
import {useNavigation} from '@react-navigation/native';
import constant from '../../constants/translation';
import FormButton from '../../components/FormButton';
import {updateStep, updatePostedTaskId} from '../../Redux/PostTaskSlice';

const TaskListCard = ({item, index, deleteItem}) => {
  const userDetail = useSelector(state => state.value.userInfo);
  const token = useSelector(state => state.value.token);
  const navigationforword = useNavigation();
  const dispatch = useDispatch();
  const [loader, setLoader] = useState(false);
  const [spinner, setSpinner] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [refreshList, setRefreshList] = useState(false);

  useEffect(() => {
    if (userDetail.user_type == 'sellers') {
    } else if (userDetail.user_type == 'buyers') {
    }
  }, []);
 
  const editTask = item => {
    dispatch(updateStep(0));
    dispatch(updatePostedTaskId(item.task_id));
    navigationforword.navigate('postTask', {data: item});
  };

  const deleteTask = id => {
    setSelectedId(id);
    setLoader(true);
    axios
      .post(
        CONSTANT.BaseUrl + 'delete-task',
        {
          post_id: userDetail.profile_id,
          user_id: userDetail.user_id,
          task_id: id,
        },
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        },
      )
      .then(async response => {
        setLoader(false);
        setSelectedId(null);
        if (response.data.type == 'success') {
          deleteItem(index);
          Alert.alert('Success', response.data.message_desc);
        } else if (response.data.type == 'error') {
          Alert.alert('Oops', response.data.message_desc);
        }
      })
      .catch(error => {
        setLoader(false);
        console.log(error);
      });
  };
  const changeTaskDesiplay = id => {
    setSelectedId(id);
    setSpinner(true);
    axios
      .post(
        CONSTANT.BaseUrl + 'task-status-change',
        {
          post_id: userDetail.profile_id,
          user_id: userDetail.user_id,
          task_enable: item.task_status ? 'disable' : 'enable',
          task_id: id,
        },
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        },
      )
      .then(async response => {
        setSpinner(false);
        if (response.data.type == 'success') {
          if (item.task_status) {
            item.task_status = false;
          } else {
            item.task_status = true;
          }
          setRefreshList(!refreshList);
          Alert.alert('Success', response.data.message_desc);
        } else if (response.data.type == 'error') {
          Alert.alert('Oops', response.data.message_desc);
        }
      })
      .catch(error => {
        setSpinner(false);
        console.log(error);
      });
  };

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.4}
        onPress={() =>
          navigationforword.navigate('taskDetail', {
            data: item,
            gallery: item.gallery,
          })
        }
        style={{margin: 10}}>
        <ImageBackground
          style={styles.hometaskImageBackgroundStyle}
          source={
            item.featured_image != ''
              ? {
                  uri: item.featured_image,
                }
              : require('../../../assets/images/PlaceholderImage.png')
          }>
          {item.featured == true && (
            <View style={styles.taskFeaturedBadgeParent}>
              <Text style={styles.taskFeaturedTextStyle}>
                {constant.Featured}
              </Text>
            </View>
          )}
        </ImageBackground>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {Object.entries(item.categories).map((key, index) => (
            <>
              <Text style={styles.taskDetailSkillList}>
                {decode(key[1])}
                {Object.keys(item.categories).length - 1 == index ? '' : ', '}
              </Text>
            </>
          ))}
        </ScrollView>
        <Text numberOfLines={3} style={styles.taskTitleStyle}>
          {item.post_status == 'New' ? 'Private: ' : ''}
          {decode(item.task_name)}
        </Text>
        <View style={styles.taskPriceParentStyle}>
          <Text style={styles.taskPriceStartignStyle}>{constant.From}: </Text>
          <Text style={styles.taskPriceStyle}>
            {decode(item.total_price_format)}
          </Text>
        </View>
        <View
          style={[styles.taskRatingMainStyle, {justifyContent: 'flex-start'}]}>
          <View style={styles.taskRatignParentStyle}>
            <FontAwesome name={'star'} size={18} color={'#FFD101'} />
            <Text style={styles.cardratingTextStyle}>
              {item.average_rating}
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
              marginLeft: 20,
            }}>
            <Feather name={'eye'} size={16} color={'#999999'} />
            <Text style={styles.cardRatingViewTextStyle}>
              {' '}
              {item.service_views}
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginLeft: 20,
            }}>
            <Feather name={'shopping-bag'} size={16} color={'#999999'} />
            <Text style={styles.cardRatingViewTextStyle}>
              {' '}
              {item.product_sales}
              {' Sales'}
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginLeft: 20,
            }}>
            <Feather name={'clock'} size={16} color={'#999999'} />
            <Text style={styles.cardRatingViewTextStyle}>
              {' '}
              {item.post_status}
            </Text>
          </View>
        </View>

        {(item.post_status == 'Published' || item.post_status == 'New') && (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginVertical: 15,
            }}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text
                style={[
                  [styles.postProjectHeading, {fontSize: 16}],
                  {paddingTop: 0},
                ]}>
                Task on / off
              </Text>
              {spinner && (
                <View>
                  <ActivityIndicator
                    style={{marginLeft: 20}}
                    size="small"
                    color={CONSTANT.primaryColor}
                  />
                </View>
              )}
            </View>

            <Switch
              style={{
                transform: [{scaleX: 0.8}, {scaleY: 0.8}],
              }}
              trackColor={{
                false: '#DDDDDD',
                true: '#22C55E',
              }}
              thumbColor={'#fff'}
              ios_backgroundColor={'#FFFFFF'}
              onValueChange={() => changeTaskDesiplay(item.task_id)}
              value={item.task_status}
            />
          </View>
        )}
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <View style={{width: '48%'}}>
            <FormButton
              onPress={() => editTask(item)}
              buttonTitle={constant.profileSettingEdit}
              backgroundColor={CONSTANT.primaryColor}
              textColor={'#fff'}
              iconName={'edit-3'}
            />
          </View>
          <View style={{width: '48%'}}>
            <FormButton
              onPress={() => deleteTask(item.task_id)}
              buttonTitle={constant.postTaskDelete}
              backgroundColor={'#EF4444'}
              textColor={'#fff'}
              iconName={'trash-2'}
              loader={selectedId == item.task_id ? loader : null}
            />
          </View>
        </View>
      </TouchableOpacity>
    </>
  );
};

export default TaskListCard;
