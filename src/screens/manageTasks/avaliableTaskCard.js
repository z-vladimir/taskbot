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
import {decode} from 'html-entities';
import {useNavigation} from '@react-navigation/native';
import constant from '../../constants/translation';

const avaliableTaskCard = ({item}) => {
  const userDetail = useSelector(state => state.value.userInfo);
  const navigationforword = useNavigation();

  useEffect(() => {
    if (userDetail.user_type == 'sellers') {
    } else if (userDetail.user_type == 'buyers') {
    }
  }, []);

  return (
    <>
      <View style={styles.avaliableTaskCardParent}>
        <View style={styles.avaliableTaskCardContainer}>
          <View
            style={{
              backgroundColor:
                item.task_status == 'cancelled'
                  ? '#EF4444'
                  : item.task_status == 'completed'
                  ? '#22C55E'
                  : '#F97316',
              paddingHorizontal: 10,
            }}>
            <Text style={styles.avaliableTaskCardStatusText}>
              {item.order_label}
            </Text>
          </View>
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
          <Text style={styles.avaliableTaskCardTagLine}>{item.task_title}</Text>

          <View style={styles.avaliableTaskCardProcessConatiner}>
            <View>
              <Text style={styles.avaliableTaskCardProcessText}>
                {constant.avaliableTaskCardBudget}
              </Text>
              <Text style={styles.avaliableTaskCardProcessText2}>
                {userDetail.user_type == 'sellers'
                  ? decode(item.seller_shares_fromat)
                  : decode(item.order_price_format)}
              </Text>
            </View>
            <View>
              <Text style={styles.avaliableTaskCardProcessText}>
                {constant.avaliableTaskCardDeadline}
              </Text>
              <Text style={styles.avaliableTaskCardProcessText2}>
                {item.delivery_time}
              </Text>
            </View>
            <View>
              {item.order_details.subtasks.length != 0 && (
                <>
                  <Text style={styles.avaliableTaskCardProcessText}>
                   {constant.avaliableTaskCardAdd}
                  </Text>
                  <Text style={styles.avaliableTaskCardProcessText2}>
                    {item.order_details.subtasks.length} {constant.avaliableTaskCardRequested}
                  </Text>
                </>
              )}
            </View>
          </View>
        </View>
        <TouchableOpacity
          onPress={() =>
            navigationforword.navigate('availableTaskDetail', {data: item})
          }
        style={styles.avaliableTaskCardUserInfoMain}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginLeft: 10,
            }}>
            <ImageBackground
              imageStyle={{borderRadius: 70 / 2}}
              style={styles.homefreelancerImageBackgroundStyle}
              source={{
                uri:
                  userDetail.user_type == 'sellers'
                    ? item.buyer_image
                    : item.seller_image,
              }}
            />
            <View style={styles.avaliableTaskCardUserInfoName}>
              <Text style={styles.avaliableTaskCardUserInfoNameText1}>
                {userDetail.user_type == 'sellers' ? constant.avaliableTaskCardBy : constant.avaliableTaskCardFrom}
              </Text>
              <Text style={styles.avaliableTaskCardUserInfoNameText2}>
                {userDetail.user_type == 'sellers'
                  ? item.buyer_name
                  : item.seller_name}
              </Text>
            </View>
          </View>
          <View style={{marginRight: 10}}>
            <Feather
            
              name={'chevron-right'}
              size={18}
              color={'#888888'}
              style={{justifyContent: 'flex-end'}}
            />
          </View>
        </TouchableOpacity>
      </View>
    </>
  );
};

export default avaliableTaskCard;
