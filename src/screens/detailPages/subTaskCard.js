import {View, Text} from 'react-native';
import React from 'react';
import styles from '../../style/styles';
import {decode} from 'html-entities';
import HTML from 'react-native-render-html';

const subTaskCard = ({item, index, length}) => {
  var htmlCode = item.content;
  const tagsStyles = {
    body: {
      fontFamily: 'OpenSans-Regular',
      fontSize: 15,
      letterSpacing: 0.5,
      lineHeight: 24,
      color: '#0A0F26',
    },
  };
  return (
    <View
      style={[
        styles.taskDetailServicesView,
        {borderBottomColor: index == length - 1 ? '#f7f7f7' : '#DDDDDD'},
      ]}>
      <View style={styles.taskDetailFAQHeadingView}>
        <Text style={styles.taskDetailServicesNameText}>{item.title}</Text>
        <Text style={styles.taskDetailServicesPrice}>{decode(item.price)}</Text>
      </View>
      <View style={{width: '100%'}}>
        <HTML tagsStyles={tagsStyles} source={{html: htmlCode}} />
      </View>
    </View>
  );
};

export default subTaskCard;
