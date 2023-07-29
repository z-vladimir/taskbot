import { View, Text } from 'react-native';
import {decode} from 'html-entities';
import React from 'react';
import styles from "../../style/styles.js";
import constant from '../../constants/translation';
import Feather from "react-native-vector-icons/Feather";

const historyCard = ({item}) => {
  return (
   
      <View style={styles.invoiceParentStyle}>
          
          <Text style={styles.disputesStatusText}>{item.status}</Text>

        <View style={styles.invoiceRowParentStyle}>
          <Text style={styles.invoiceLableTextStyle}>{constant.historyCardReference}</Text>

          <Text style={styles.invoiceValueTextStyle}>{item.unique_key}</Text>
        </View>

        <View style={styles.invoicePayoutSeparatorStyle} />

        <View style={styles.invoiceRowParentStyle}>
          <Text style={styles.invoiceLableTextStyle}>{constant.historyCardMethod}</Text>

          <Text style={styles.invoiceClientNameValueTextStyle}>{item.payment_method}</Text>
        </View>

        <View style={styles.invoicePayoutSeparatorStyle} />

        <View style={styles.invoiceRowParentStyle}>
          <Text style={styles.invoiceLableTextStyle}>{constant.historyCardDate}</Text>

          <Text style={styles.invoiceValueTextStyle}>{item.post_date}</Text>
        </View>

        <View style={styles.invoicePayoutSeparatorStyle} />

        <View style={styles.invoiceRowParentStyle}>
          <Text style={styles.invoiceLableTextStyle}>{constant.historyCardAmount}</Text>

          <Text style={styles.invoiceValueTextStyle}>{decode(item.withdraw_amount)}</Text>
        </View>
        {/* <View style={styles.invoicePayoutSeparatorStyle} /> */}

      
  </View>
  );
};

export default historyCard;
