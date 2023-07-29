import {View, Text, SafeAreaView} from 'react-native';
import React, {useState, useEffect} from 'react';
import Feather from 'react-native-vector-icons/Feather';
import Header from '../../components/Header';
import styles from '../../style/styles.js';
import constant from '../../constants/translation';
import {useSelector, useDispatch} from 'react-redux';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {useNavigation} from '@react-navigation/native';
import {updateStep,updatePostedItemOne,updatePostedItemTwo} from "../../Redux/PostProjectSlice"

const PostType = () => {
  const navigationforword = useNavigation();
  const dispatch = useDispatch();

const startNewProject = () => {
  dispatch(updatePostedItemOne({}));
  dispatch(updatePostedItemTwo({}));
  dispatch(updateStep(0));
  navigationforword.navigate('postProject')
}
  return (
    <SafeAreaView style={styles.globalContainer}>
      <Header
        title={constant.postProjectHeading}
        titleColor={'#1C1C1C'}
        backColor={'#F7F7F7'}
        iconColor={'#1C1C1C'}
      />
      <View style={styles.postProjectView}>
        <Text style={styles.postProjectHeading}>
         {constant.postProjectChooseStartProject}
        </Text>
        <Text style={styles.postProjectText}>
          {constant.postProjectStartProjectDesc}
        </Text>
      </View>
      <View style={{borderColor: '#DDDDDD', borderWidth: 0.5}} />
      <View style={{backgroundColor:"#F7F7F7",height:"100%"}}>
      <View style={styles.postProjectTemplateView}>
        <TouchableOpacity
          style={styles.myProjectDetailsEarnigs}
          onPress={() => startNewProject()}>
          <View style={styles.myProjectDetailsEarnigsView}>
            <View style={styles.myProjectDetailsEarnigsViewIcon}>
              <Feather name={'file-text'} size={20} color={'#6366F1'} />
            </View>
            <View style={styles.myProjectDetailsEarnigsViewDetails}>
              <Text style={styles.myProjectDetailsEarnigsAmount}>
                {constant.postProjectStartNewProject}
              </Text>
              <Text style={styles.myProjectDetailsEarnigsTitle}>
                {constant.postProjectStartNewProjectDesc}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => navigationforword.navigate('templateListing')}
        style={styles.myProjectDetailsEarnigsThird}>
          <View style={styles.myProjectDetailsEarnigsView}>
            <View
              style={[
                styles.myProjectDetailsEarnigsViewIconThird,
                {backgroundColor: '#F4433610'},
              ]}>
              <Feather name={'copy'} size={20} color={'#F44336'} />
            </View>
            <View style={styles.myProjectDetailsEarnigsViewDetails}>
              <Text style={styles.myProjectDetailsEarnigsAmount}>
                {constant.postProjectUseTemplate}
              </Text>
              <Text style={styles.myProjectDetailsEarnigsTitle}>
                {constant.postProjectUseTemplateDesc}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
      </View>
    </SafeAreaView>
  );
};

export default PostType;
