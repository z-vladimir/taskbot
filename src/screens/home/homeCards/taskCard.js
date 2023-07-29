import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  Alert,
} from 'react-native';
import React, {useState} from 'react';
import styles from '../../../style/styles';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FormButton from '../../../components/FormButton';
import {useNavigation} from '@react-navigation/native';
import {decode} from 'html-entities';
import constant from '../../../constants/translation';

const taskCard = ({widthValue, imageWidth, showRemoveBtn, item,RemoveItem}) => {
  const navigationforword = useNavigation();
  const [imagesArray, setImagesArray] = useState([]);
  for(let i = 0; i < item.gallery.length; i++){
    imagesArray.push({
      url : item.gallery[i]
    })
  }
  return (
    <TouchableOpacity
      activeOpacity={0.4}
      onPress={() => navigationforword.navigate('taskDetail' , { data : item , gallery:imagesArray })}
      style={{margin: 10, width: widthValue}}>
      <ImageBackground
        style={[styles.hometaskImageBackgroundStyle, {width: imageWidth}]}
        source={{
          uri: item.featured_image,
        }}>
        {item.featured == true && (
          <View style={styles.taskFeaturedBadgeParent}>
            <Text style={styles.taskFeaturedTextStyle}>{constant.Featured}</Text>
          </View>
        )}
      </ImageBackground>
      <Text style={styles.taskNameStyle}>{item.seller_name}</Text>
      <Text numberOfLines={3} style={styles.taskTitleStyle}>{decode(item.task_name)}</Text>
      <View style={styles.taskRatingMainStyle}>
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
          }}>
          <Feather name={'eye'} size={16} color={'#999999'} />
          <Text style={styles.cardRatingViewTextStyle}>
            {' '}
            {item.service_views}
          </Text>
        </View>
      </View>
      <View style={styles.taskPriceParentStyle}>
        <Text style={styles.taskPriceStartignStyle}> {constant.From}:</Text>
        <Text style={styles.taskPriceStyle}>{decode(item.total_price_format)}</Text>
      </View>
      {showRemoveBtn == true && (
        <View style={{marginVertical: 10}}>
          <FormButton
            buttonTitle={constant.savedItemRemoveSavedItems}
            iconName={'trash-2'}
            backgroundColor={'#EF4444'}
            textColor={'#fff'}
            onPress={() => RemoveItem('tasks',item.task_id)}
          />
        </View>
      )}
    </TouchableOpacity>
  );
};

export default taskCard;
