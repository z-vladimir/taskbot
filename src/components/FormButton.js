import React from "react";
import { Text, TouchableOpacity,ActivityIndicator } from "react-native";
import Feather from "react-native-vector-icons/Feather";
import styles from "../style/styles";

const FormButton = ({ buttonTitle,iconName , textColor ,loader, backgroundColor , ...rest }) => {
  return (
    <TouchableOpacity style={[styles.buttonContainer , { backgroundColor: backgroundColor }]} {...rest}>
      <Text style={[styles.buttonText , { color : textColor }]}>{buttonTitle}</Text>
      <Feather style={{marginHorizontal:7}} name={iconName} size={22} color={textColor} />
      {loader &&
        <ActivityIndicator size="small" color={textColor} />}
    </TouchableOpacity>
  );
};

export default FormButton;
