import React, {useState} from 'react';
import {View, TextInput, StyleSheet, TouchableOpacity,Dimensions} from 'react-native';
import styles from '../style/styles';

const FormInput = ({
  labelValue,
  placeholderText,
  inputType,
  iconType,
  editable,
  iconclick,
  secure,
  ...rest
}) => {
  const [secureP, setSecureP] = useState(secure);
  return (
    <View style={styles.FormInputContainer}>
      <TextInput
        placeholder={placeholderText}
        value={labelValue}
        placeholderTextColor="#767676"
        style={styles.FormInput}
        autoCorrect={true}
        autoCompleteType="email"
        textContentType="emailAddress"
        keyboardType={inputType}
        editable={editable}
        secureTextEntry={secureP}
        {...rest}
      />

    </View>
  );
};

export default FormInput;

