import {View,} from 'react-native';
import React from 'react';
import styles from '../../../style/styles';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

const SkelectonCategoryCard = () => {
  return (
    <View style={styles.catCardParentStyle}>
      <SkeletonPlaceholder>
        <View style={{alignItems: 'center', justifyContent: 'center'}}>
          <View style={styles.catCardImageStyle} />
          <View style={{width: 60, height: 8, marginVertical: 10}} />
          <View style={{width: 30, height: 8, alignSelf: 'center'}} />
        </View>
      </SkeletonPlaceholder>
    </View>
  );
};

export default SkelectonCategoryCard;
