import {View, Text, Image , TouchableOpacity} from 'react-native';
import React from 'react';
import styles from '../../../style/styles';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FormButton from '../../../components/FormButton';
import {decode} from 'html-entities';
import {useNavigation} from '@react-navigation/native';

const categoryCard = ({item}) => {
  const navigationforword = useNavigation();
  return (
    <TouchableOpacity onPress={() =>
      navigationforword.navigate('searchResultTask', {
        text: '',
        location: '',
        category: item.slug,
        sub_category: '',
        services: [],
        max: '',
        min: '',
      })
    } style={styles.catCardParentStyle}>
      <Image
        // resizeMode="contain"
        style={styles.catCardImageStyle}
        source={{uri : item.image}}
      />
      <Text style={[styles.homeCatExploreTextStyle, {color: '#1C1C1C'}]}>
        {decode(item.name)}
      </Text>
    </TouchableOpacity>
  );
};

export default categoryCard;
