import {View, Text, Alert} from 'react-native';
import React from 'react';
import styles from '../../style/styles';

const qualificationCard = ({item}) => {
  return (
    <View style={styles.profileQualificationCardParentStyle}>
      <Text style={styles.profileQualificationCardInstituteTitleStyle}>
        {item.institute}
      </Text>
      <Text style={styles.profileQualificationCardTitleStyle}>
        {item.degree_title}
      </Text>
      <Text style={styles.profileQualificationCardDateStyle}>
        {item.end_date_format}
      </Text>
    </View>
  );
};

export default qualificationCard;
