import React from 'react';
import {View, Image, Text, TouchableOpacity, I18nManager} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {useSelector, useDispatch} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import styles from '../style/styles';

const header = ({title, titleColor, img, backColor, iconColor, backIcon}) => {
  const userDetail = useSelector(state => state.value.userInfo);
  const profileImage = useSelector(state => state.value.profileImage);

  const navigationforword = useNavigation();
  function isObjectEmpty(object) {
    var isEmpty = true;
    for (keys in object) {
      isEmpty = false;
      break;
    }
    return isEmpty;
  }
  var isEmpty = isObjectEmpty(userDetail);
  return (
    <View style={[styles.headerMainView, {backgroundColor: backColor}]}>
      {!backIcon ? (
        <TouchableOpacity
          activeOpacity={0.2}
          onPress={() => navigationforword.openDrawer()}
          style={styles.headerDrawerIcon}>
          <Feather name="menu" type="menu" color={iconColor} size={25} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          activeOpacity={0.2}
          onPress={() => {
            navigationforword.goBack();
            // navigationforword.reset({
            //   index: 0,
            //   routes: [{name: 'home'}],
            // });
          }}
          style={styles.headerDrawerIcon}>
          <Feather
            name={I18nManager.isRTL ? 'chevron-right' : 'chevron-left'}
            type={I18nManager.isRTL ? 'chevron-right' : 'chevron-left'}
            color={iconColor}
            size={25}
          />
        </TouchableOpacity>
      )}
      <Text
        style={{
          color: titleColor,
          fontSize: 18,
          fontFamily: 'Urbanist-SemiBold',
        }}>
        {title}
      </Text>
      
      <TouchableOpacity
        onPress={() =>
          {
            isEmpty != true &&
            navigationforword.navigate('imagePreview', {
              imageData: profileImage,
            })
          }
        }>
        <Image
          style={styles.headerPhoto}
          // source={require('../../assets/images/header.jpg')}
          source={
            isEmpty == true
              ? require('../../assets/images/PlaceholderImage.png')
              : {uri: profileImage}
          }
        />
      </TouchableOpacity>
    </View>
  );
};

export default header;
