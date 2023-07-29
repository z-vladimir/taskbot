import {
  View,
  Text,
  TextInput,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import Feather from 'react-native-vector-icons/Feather';
import FormButton from '../../components/FormButton';
import * as CONSTANT from '../../constants/globalConstants';
import constant from '../../constants/translation';
import styles from '../../style/styles.js';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const postProjectStepThree = ({stepHandel}) => {
  const [text, setText] = useState('');
  const [show, setShow] = useState(true);
  const [comment, setComment] = useState('');
  return (
    <ScrollView>
      <View style={styles.postProjectView}>
        <Text style={[styles.postProjectMainHeading, {paddingTop: 10}]}>
          {constant.postProjectAskQuestion}
        </Text>

        <View style={{paddingVertical: 10}}>
          <FormButton
            buttonTitle={'Select single'}
            backgroundColor={CONSTANT.primaryColor}
            textColor={'#FFFFFF'}
            // loader={loader}
            iconName={'plus'}
          />
          <FormButton
            buttonTitle={'Multi select'}
            backgroundColor={'#F7F7F7'}
            textColor={'#999999'}
            iconName={'plus'}
          />

          <FormButton
            buttonTitle={'File upload'}
            backgroundColor={'#F7F7F7'}
            textColor={'#999999'}
            iconName={'plus'}
          />
        </View>
      </View>
      <View style={{borderColor: '#DDDDDD', borderWidth: 0.5}} />
      <>
        <View style={styles.myProjectDetailsTimeCardProjectActivity}>
          <View style={styles.myProjectDetailsTimeCardActivityView}>
            <View style={{justifyContent: 'center', alignItems: 'center'}}>
              <Feather name={'trash-2'} size={20} color={'#EF4444'} />
            </View>

            <Text style={styles.myProjectDetailsTimeCardActivityTitle}>
              Multi select question
            </Text>
          </View>
          <TouchableOpacity onPress={() => setShow(!show)}>
            <Feather
              name={show == false ? 'plus' : 'minus'}
              size={20}
              color={'#1C1C1C '}
            />
          </TouchableOpacity>
        </View>
        {show && (
          <View style={styles.postProjectView}>
            <>
              <Text style={[styles.postProjectHeading, {paddingTop: 20}]}>
                Add question title
              </Text>
              <View
                style={[
                  styles.homeSearchParentInputStyle,
                  {paddingHorizontal: 10, marginTop: 5},
                ]}>
                <TextInput
                  style={styles.empProjectSearchInputStyle}
                  placeholderTextColor={'#999999'}
                  onChangeText={text => setText(text)}
                  value={text}
                  placeholder={'Add question title here'}
                />
                <Feather
                  style={styles.homeSearchIconStyle}
                  name={'chevron-down'}
                  size={20}
                  color={'#999999'}
                />
              </View>
            </>
            <>
              <Text style={[styles.postProjectHeading, {paddingTop: 20}]}>
                Add question options
              </Text>
              <View
                style={[
                  styles.homeSearchParentInputStyle,
                  {paddingHorizontal: 10, marginTop: 5},
                ]}>
                <TextInput
                  style={styles.empProjectSearchInputStyle}
                  placeholderTextColor={'#999999'}
                  onChangeText={text => setText(text)}
                  value={text}
                  placeholder={'Add question option here'}
                />
                <Feather
                  style={styles.homeSearchIconStyle}
                  name={'chevron-down'}
                  size={20}
                  color={'#999999'}
                />
              </View>
            </>
          </View>
        )}
      </>
      <>
        <View style={styles.myProjectDetailsTimeCardProjectActivity}>
          <View style={styles.myProjectDetailsTimeCardActivityView}>
            <View style={{justifyContent: 'center', alignItems: 'center'}}>
              <Feather name={'trash-2'} size={20} color={'#EF4444'} />
            </View>

            <Text style={styles.myProjectDetailsTimeCardActivityTitle}>
              Single select question
            </Text>
          </View>
          <TouchableOpacity onPress={() => setShow(!show)}>
            <Feather
              name={show == false ? 'plus' : 'minus'}
              size={20}
              color={'#1C1C1C '}
            />
          </TouchableOpacity>
        </View>
        {show && (
          <View style={styles.postProjectView}>
            <>
              <Text style={[styles.postProjectHeading, {paddingTop: 20}]}>
                Add question title
              </Text>
              <View
                style={[
                  styles.homeSearchParentInputStyle,
                  {paddingHorizontal: 10, marginTop: 5},
                ]}>
                <TextInput
                  style={styles.empProjectSearchInputStyle}
                  placeholderTextColor={'#999999'}
                  onChangeText={text => setText(text)}
                  value={text}
                  placeholder={'Add question title here'}
                />
                <Feather
                  style={styles.homeSearchIconStyle}
                  name={'chevron-down'}
                  size={20}
                  color={'#999999'}
                />
              </View>
            </>
            <>
              <Text style={[styles.postProjectHeading, {paddingTop: 20}]}>
                Add question options
              </Text>
              <View
                style={[
                  styles.homeSearchParentInputStyle,
                  {paddingHorizontal: 10, marginTop: 5},
                ]}>
                <TextInput
                  style={styles.empProjectSearchInputStyle}
                  placeholderTextColor={'#999999'}
                  onChangeText={text => setText(text)}
                  value={text}
                  placeholder={'Add question option here'}
                />
                <Feather
                  style={styles.homeSearchIconStyle}
                  name={'chevron-down'}
                  size={20}
                  color={'#999999'}
                />
              </View>
            </>
            <>
              <Text style={[styles.postProjectHeading, {paddingTop: 20}]}>
                Skills required
              </Text>
              <View
                style={[
                  styles.homeSearchParentInputStyle,
                  {paddingHorizontal: 10, marginTop: 5},
                ]}>
                <TextInput
                  style={styles.empProjectSearchInputStyle}
                  placeholderTextColor={'#999999'}
                  onChangeText={text => setText(text)}
                  value={text}
                  placeholder={'Enter min price here'}
                />
                <Feather
                  style={styles.homeSearchIconStyle}
                  name={'chevron-down'}
                  size={20}
                  color={'#999999'}
                />
              </View>
            </>
          </View>
        )}
      </>
      <>
        <View style={styles.myProjectDetailsTimeCardProjectActivity}>
          <View style={styles.myProjectDetailsTimeCardActivityView}>
            <View style={{justifyContent: 'center', alignItems: 'center'}}>
              <Feather name={'trash-2'} size={20} color={'#EF4444'} />
            </View>

            <Text style={styles.myProjectDetailsTimeCardActivityTitle}>
            File upload question
            </Text>
          </View>
          <TouchableOpacity onPress={() => setShow(!show)}>
            <Feather
              name={show == false ? 'plus' : 'minus'}
              size={20}
              color={'#1C1C1C '}
            />
          </TouchableOpacity>
        </View>
        {show && (
          <View style={styles.postProjectView}>
            <>
              <Text style={[styles.postProjectHeading, {paddingTop: 20}]}>
                Add question title
              </Text>
              <View
                style={[
                  styles.homeSearchParentInputStyle,
                  {paddingHorizontal: 10, marginTop: 5},
                ]}>
                <TextInput
                  style={styles.empProjectSearchInputStyle}
                  placeholderTextColor={'#999999'}
                  onChangeText={text => setText(text)}
                  value={text}
                  placeholder={'Add question title here'}
                />
                <Feather
                  style={styles.homeSearchIconStyle}
                  name={'chevron-down'}
                  size={20}
                  color={'#999999'}
                />
              </View>
            </>
           
          </View>
        )}
      </>
      <View
        style={{borderColor: '#DDDDDD', borderWidth: 0.5, marginVertical: 20}}
      />
      <View style={{marginHorizontal: 15}}>
        <FormButton
          buttonTitle={'save to Draft'}
          backgroundColor={'#F7F7F7'}
          textColor={'#999999'}
        />
        <FormButton
          buttonTitle={'Post project'}
          backgroundColor={CONSTANT.primaryColor}
          textColor={'#FFFFFF'}
          // loader={loader}
        />
        <FormButton
          buttonTitle={'Go Back'}
          backgroundColor={'#F7F7F7'}
          textColor={'#1C1C1C'}
        />
      </View>
    </ScrollView>
  );
};

export default postProjectStepThree;
