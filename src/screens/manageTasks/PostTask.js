import {View, Text, SafeAreaView, TextInput, FlatList, TouchableOpacity} from 'react-native';
import React, {useState, useEffect} from 'react';
import Feather from 'react-native-vector-icons/Feather';
import Header from '../../components/Header';
import styles from '../../style/styles.js';
import * as CONSTANT from '../../constants/globalConstants';
import constant from '../../constants/translation';
import {useSelector, useDispatch} from 'react-redux';
import PostTaskStepOne from './PostTaskStepOne';
import {useIsFocused} from '@react-navigation/native';
import PostTaskStepTwo from './PostTaskStepTwo';
import PostTaskStepThree from './PostTaskStepThree';
import PostTaskStepFour from './PostTaskStepFour';
import {
  updateStep,
  updatePostedTaskId,
} from '../../Redux/PostTaskSlice';

const PostTask = ({navigation,route}) => {
  const step = useSelector(state => state.postedTask.step);
  const [data, setData] = useState(null)
  const isFocused = useIsFocused();
  const dispatch = useDispatch();
  const [emptyTask, setEmptyTask] = useState(false);
  const [steps, setSteps] = useState([
    {one: 'one'},
    {two: 'two'},
    {three: 'three'},
    {four: 'four'},
  ]);

  const handelSelectedStep = index => {
    dispatch(updateStep(index));
  };
  useEffect(() => {
    if (isFocused) {
      setData(route.params.data)
    }
  }, [isFocused]);
  return (
    <SafeAreaView style={styles.globalContainer}>
      <Header
        title={step == 0 ? constant.postTaskIntroduction : step == 1 ? constant.postTaskPricing : step == 2 ? constant.postTaskMediaAttachments :step == 3 ? constant.postTaskCommonFAQs : ""}
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
                <TouchableOpacity
                  onPress={() => route.params.data != null ? handelSelectedStep(index) : null}
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
                </TouchableOpacity>
                {index == steps.length - 1 ? null : (
                  <View style={[styles.postProjectStepsBoxDashed,{width: '13%',}]} />
                )}
              </>
            );
          })}
        </View>
        
      </View>
      <View style={{borderColor: '#DDDDDD', borderWidth: 0.5}} />
      {step == 0 && <PostTaskStepOne item={route.params.data} />}
      {step == 1 && <PostTaskStepTwo item={route.params.data} />}
      {step == 2 && <PostTaskStepThree item={route.params.data}/>}
      {step == 3 && <PostTaskStepFour item={route.params.data}/>}
    </SafeAreaView>
  );
};

export default PostTask;
