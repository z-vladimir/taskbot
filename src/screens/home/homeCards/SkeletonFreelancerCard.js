import {View} from 'react-native';
import React from 'react';
import styles from '../../../style/styles';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

const SkeletonFreelancerCard = () => {
  return (
    <View style={styles.freelancerCardParentStyle}>
      <View style={{flexDirection: 'row'}}>
        <SkeletonPlaceholder>
          <View style={[styles.homefreelancerImageBackgroundStyle,{borderRadius:50}]} />
        </SkeletonPlaceholder>
        <View>
          <SkeletonPlaceholder>
          
            <View style={styles.freelancerCardTitleParentStyle}>
                <View style={{height:10,width:100,alignItems:"center",marginTop:10}}/>
            </View>
          </SkeletonPlaceholder>
          <SkeletonPlaceholder>
            <View style={styles.cardRatingParent}>
            <View style={{height:10,width:70,marginVertical:10}} />
            </View>
          </SkeletonPlaceholder>
        </View>
      </View>
       <SkeletonPlaceholder>
        <View style={{alignItems: 'center'}}>
          <View style={{height:12,width:100,alignItems:"center",marginTop:10}}/>
          <View style={{height:8,width:60,alignItems:'flex-end',marginTop:10}}/>
            
        </View>
         </SkeletonPlaceholder>
    </View>
  );
};

export default SkeletonFreelancerCard;
