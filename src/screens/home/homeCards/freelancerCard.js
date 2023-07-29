import {View, Text, ImageBackground, TouchableOpacity} from 'react-native';
import React from 'react';
import styles from '../../../style/styles';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FormButton from '../../../components/FormButton';
import {useNavigation} from '@react-navigation/native';
import {decode} from 'html-entities';
import constant from '../../../constants/translation';

const freelancerCard = ({chat, saved, item}) => {
  const navigationforword = useNavigation();
  return (
    <TouchableOpacity
    activeOpacity={1}
      onPress={() => navigationforword.navigate('profileDetail' , {data : item})}
      style={styles.freelancerCardParentStyle}>
      <View style={{flexDirection: 'row'}}>
        <View>
          <ImageBackground
            imageStyle={{borderRadius: 70 / 2}}
            style={styles.homefreelancerImageBackgroundStyle}
            source={{
              uri: item.avatar,
            }}>
            <View style={styles.homefreelancerImageEditIconStyle}></View>
          </ImageBackground>
        </View>
        <View>
          <View style={styles.freelancerCardTitleParentStyle}>
            <Text style={styles.freelancerCardTitleStyle}>
              {item.seller_name}
            </Text>
            {!chat ? (
              <>
                {item.identity_verified == '1' && (
                  <Feather
                    style={{marginLeft: 5}}
                    name={'zap'}
                    size={14}
                    color={'#22C55E'}
                  />
                )}

                {item.is_verified == 'yes' && (
                  <Feather style={{marginLeft: 5}} name={'check-circle'} size={14} color={'#1DA1F2'} />
                )}
              </>
            ) : null}
          </View>
          <View style={styles.cardRatingParent}>
            <FontAwesome name={'star'} size={18} color={'#FFD101'} />
            <Text style={styles.cardratingTextStyle}>
              {parseFloat(item.user_rating).toFixed(2)}
              {/* {item.user_rating} */}
              <Text style={styles.cardRatingViewTextStyle}>
                {' '}
                ({item.review_users})
              </Text>
            </Text>
            {saved ? (
              <>
                <Feather
                  //onPress={() => navigation.goBack()}
                  style={{paddingLeft: 10, paddingRight: 5}}
                  name="eye"
                  type="eye"
                  color={'#999999'}
                  size={16}
                />
                <Text style={styles.cardRatingViewTextStyle}>
                  {' '}
                  {item.profile_views}
                </Text>
              </>
            ) : null}
          </View>
        </View>
      </View>
      {chat ? (
        <View style={{alignItems: 'center', justifyContent: 'center'}}>
          <Feather
            style={{marginHorizontal: 5}}
            name={'message-square'}
            size={24}
            color={'#1C1C1C'}
          />
        </View>
      ) : (
        <View style={{alignItems: 'center'}}>
          <Text style={styles.freelancerStartingTextStyle}>{constant.StartFrom}</Text>
          <Text style={styles.freelancingCardPriceStyle}>
           {item.hourly_rate ? decode(item.hourly_rate)+" /hr" : "N/A"  }
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default freelancerCard;
