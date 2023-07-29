import {View} from 'react-native';
import React, {useState} from 'react';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

const SkeletonTaskCard = ({widthval,mainWidth}) => {
  return (
    <View style={{margin: 10 ,width:mainWidth}}>
      <SkeletonPlaceholder>
        <View style={{width: widthval, height: 160}} />
      </SkeletonPlaceholder>
      <SkeletonPlaceholder>
        <View style={{height: 10, width: 50, marginVertical: 10}} />
      </SkeletonPlaceholder>
      <SkeletonPlaceholder>
        <View style={{height: 10, width: 100, marginVertical: 10}} />
      </SkeletonPlaceholder>

      <SkeletonPlaceholder>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <View style={{height: 10, width: 70}} />
          <View style={{height: 10, width: 40}} />
        </View>
      </SkeletonPlaceholder>
      <SkeletonPlaceholder>
        <View style={{height: 10, width: 100, marginVertical: 10}} />
      </SkeletonPlaceholder>
    </View>
  );
};

export default SkeletonTaskCard;
