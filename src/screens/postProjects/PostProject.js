import {View, Text, SafeAreaView, TextInput, FlatList} from 'react-native';
import React, {useState, useEffect} from 'react';
import Feather from 'react-native-vector-icons/Feather';
import Header from '../../components/Header';
import styles from '../../style/styles.js';
import * as CONSTANT from '../../constants/globalConstants';
import constant from '../../constants/translation';
import {useSelector, useDispatch} from 'react-redux';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {useNavigation} from '@react-navigation/native';
import PostProjectStepOne from './PostProjectStepOne';
import PostProjectStepTwo from './PostProjectStepTwo';
import PostProjectStepThree from './postProjectStepThree';
import PostProjectStepFour from './PostProjectStepFour';
import {
  updateStep,
  updatePostedItemOne,
  updatePostedItemTwo,
} from '../../Redux/PostProjectSlice';

const PostProject = () => {
  const step = useSelector(state => state.postedProject.step);
  const dispatch = useDispatch();
  const navigationforword = useNavigation();
  const [emptyTask, setEmptyTask] = useState(false);
  const [steps, setSteps] = useState([
    {one: 'one'},
    {two: 'two'},
    // {three: 'three'},
    {four: 'four'},
  ]);

  const handelSelectedStep = index => {
    dispatch(updateStep(index));
  };
  return (
    <SafeAreaView style={styles.globalContainer}>
      <Header
        title={constant.postProjectHeading}
        titleColor={'#1C1C1C'}
        backColor={'#F7F7F7'}
        iconColor={'#1C1C1C'}
        backIcon={true}
      />
      <View style={styles.postProjectStepsBox}>
        <View style={styles.postProjectStepsBoxCirlces}>
          {steps.map((item, index) => {
            return (
              <>
                <View
                  // onPress={() => handelSelectedStep(index)}
                  style={[
                    styles.postProjectStepsCirlceView,
                    {
                      borderColor: index == step ? '#22C55E' : '#F7F7F790',
                      backgroundColor:
                        index == step
                          ? '#FFFFFF'
                          : step > index
                          ? '#22C55E'
                          : '#DDDDDD',
                      zIndex: 10,
                    },
                  ]}>
                  <Feather
                    name={
                      index == step ? 'check' : step > index ? 'check' : 'x'
                    }
                    size={20}
                    color={
                      index == step
                        ? '#22C55E'
                        : index > step
                        ? '#999999'
                        : '#fff'
                    }
                  />
                </View>
                {index == steps.length - 1 ? null : (
                  <View style={styles.postProjectStepsBoxDashed} />
                )}
              </>
            );
          })}
        </View>
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: 20,
          }}>
          {step == 0 && (
            <Text style={styles.postProjectStepsText}>
              {constant.postProjectAddProjectFreealncers}
            </Text>
          )}
          {step == 1 && (
            <Text style={styles.postProjectStepsText}>
              {constant.postProjectSelectSkillsFreelancer}
            </Text>
          )}
          {step == 2 && (
            <Text style={styles.postProjectStepsText}>
              {constant.postProjectHireBestProject}
            </Text>
          )}
          {/* {step == 3 && (
            <Text style={styles.postProjectStepsText}>
              Ask your questions direct to your freelancer before hiring
            </Text>
          )} */}
        </View>
      </View>
      <View style={{borderColor: '#DDDDDD', borderWidth: 0.5}} />
      {step == 0 && <PostProjectStepOne />}
      {step == 1 && <PostProjectStepTwo />}
      {/* {step == 2 && <PostProjectStepThree />} */}
      {step == 2 && <PostProjectStepFour />}
    </SafeAreaView>
  );
};

export default PostProject;
