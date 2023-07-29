import {
  View,
  Text,
  TextInput,
  FlatList,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import Feather from 'react-native-vector-icons/Feather';
import FormButton from '../../components/FormButton';
import * as CONSTANT from '../../constants/globalConstants';
import axios from 'axios';
import MultiSelect from 'react-native-multiple-select';
import constant from '../../constants/translation';
import {decode} from 'html-entities';
import {
  updateStep,
  updatePostedItemOne,
  updatePostedItemTwo,
} from '../../Redux/PostProjectSlice';
import {useSelector, useDispatch} from 'react-redux';
import styles from '../../style/styles.js';

const PostProjectStepTwo = ({stepHandel}) => {
  const token = useSelector(state => state.value.token);
  const userDetail = useSelector(state => state.value.userInfo);
  const skillsTaxonomy = useSelector(state => state.setting.skillsTaxonomy);
  const postedItemTwo = useSelector(state => state.postedProject.postedItemTwo);
  const postedItemOne = useSelector(state => state.postedProject.postedItemOne);
  const settings = useSelector(state => state.setting.settings);
  const languagesTaxonomy = useSelector(
    state => state.setting.languagesTaxonomy,
  );
  const expertiseTaxonomy = useSelector(
    state => state.setting.expertiseTaxonomy,
  );
  const dispatch = useDispatch();
  const [text, setText] = useState('');
  const [loader, setLoader] = useState(false);
  const [show, setShow] = useState(true);
  const [comment, setComment] = useState('');
  const [selectedFreelancerNo, setSelectedFreelancerNo] = useState('');
  const [selectedExpertise, setSelectedExpertise] = useState('');
  const [selectedSkills, setSelectedSkills] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState('');

  let skills = [];
  let freelancer = [];

  for (var i = 0; i < skillsTaxonomy.length; i++) {
    if (skillsTaxonomy[i].parent == 0) {
      skills.push({
        id: skillsTaxonomy[i].term_id,
        name: decode(skillsTaxonomy[i].name),
      });
    }
  }
  Object.entries(settings.num_of_freelancers).map(([key, value]) =>
    freelancer.push({
      slug: key,
      name: value,
    }),
  );
  useEffect(() => {
    if (Object.keys(postedItemTwo).length != 0) {
      setSelectedFreelancerNo([postedItemTwo.freelancer]);
      setSelectedExpertise([postedItemTwo.expertise]);
      setSelectedSkills(postedItemTwo.skills);
      setSelectedLanguages(postedItemTwo.languages);
    }
  }, []);

  const saveAndContinue = () => {
    setLoader(true);

    axios
      .post(
        CONSTANT.BaseUrl + 'update-job',
        {
          post_id: userDetail.profile_id,
          user_id: userDetail.user_id,
          project_id:
            Object.keys(postedItemOne).length != 0 ? postedItemOne.ID : null,
          step_id: 3,
          no_of_freelancers: selectedFreelancerNo.toString(),
          skills: selectedSkills,
          languages: selectedLanguages,
          expertise_level: selectedExpertise.toString(),
        },
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        },
      )
      .then(async response => {
        setLoader(false);
        if (response.data.type == 'success') {
          let obj = {
            freelancer: selectedFreelancerNo.toString(),
            expertise: selectedExpertise.toString(),
            skills: selectedSkills,
            languages: selectedLanguages,
          };
          dispatch(updatePostedItemTwo(obj));
          dispatch(updateStep(2));

          console.log('object', obj);
        } else if (response.data.type == 'error') {
          Alert.alert('Oops', response.data.message_desc);
        }
      })
      .catch(error => {
        setLoader(false);
        console.log(error);
      });
  };
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.postProjectView}>
        <Text style={[styles.postProjectMainHeading, {paddingTop: 10}]}>
          {constant.postProjectSkillsFreelancer}
        </Text>

        <>
          <Text style={[styles.postProjectHeading, {paddingTop: 20}]}>
            {constant.postProjectNoFreelancers}
          </Text>
          <View
            style={{
              marginVertical: 10,
              borderBottomColor: '#DDDDDD',
              borderBottomWidth: 1,
              width: '100%',
            }}>
            <MultiSelect
              fontSize={16}
              onSelectedItemsChange={value => setSelectedFreelancerNo(value)}
              uniqueKey="slug"
              items={freelancer}
              selectedItems={selectedFreelancerNo}
              borderBottomWidth={0}
              single={true}
              searchInputPlaceholderText={constant.postProjectSelectFreelancers}
              selectText={constant.postProjectSelectFreelancers}
              styleMainWrapper={styles.multiSlectstyleMainWrapper}
              styleDropdownMenuSubsection={
                styles.multiSlectstyleDropdownMenuSubsection
              }
              styleListContainer={{
                maxHeight: 150,
              }}
              onChangeInput={text => console.log(text)}
              displayKey="name"
              submitButtonText={constant.Submit}
            />
          </View>
        </>
        <>
          <Text style={[styles.postProjectHeading, {paddingTop: 20}]}>
            {constant.postProjectExpertiseLevel}
          </Text>
          <View
            style={{
              marginVertical: 10,
              borderBottomColor: '#DDDDDD',
              borderBottomWidth: 1,
              width: '100%',
            }}>
            <MultiSelect
              fontSize={16}
              onSelectedItemsChange={value => setSelectedExpertise(value)}
              uniqueKey="term_id"
              items={expertiseTaxonomy}
              selectedItems={selectedExpertise}
              borderBottomWidth={0}
              single={true}
              searchInputPlaceholderText={constant.postProjectSelectExpertiseLevel}
              selectText={constant.postProjectSelectExpertiseLevel}
              styleMainWrapper={styles.multiSlectstyleMainWrapper}
              styleDropdownMenuSubsection={
                styles.multiSlectstyleDropdownMenuSubsection
              }
              styleListContainer={{
                maxHeight: 150,
              }}
              onChangeInput={text => console.log(text)}
              displayKey="name"
              submitButtonText={constant.Submit}
            />
          </View>
        </>
        <>
          <Text style={[styles.postProjectHeading, {paddingTop: 20}]}>
            {constant.postProjectSkillsRequired}
          </Text>
          <View
            style={{
              marginVertical: 10,
              borderBottomColor: '#DDDDDD',
              borderBottomWidth: 1,
              width: '100%',
            }}>
            <MultiSelect
              fontSize={16}
              onSelectedItemsChange={value => setSelectedSkills(value)}
              uniqueKey="id"
              items={skills}
              selectedItems={selectedSkills}
              borderBottomWidth={0}
              single={false}
              searchInputPlaceholderText={constant.postProjectSelectSkillList}
              selectText={constant.postProjectSelectSkillList}
              styleMainWrapper={styles.multiSlectstyleMainWrapper}
              styleDropdownMenuSubsection={[
                styles.multiSlectstyleDropdownMenuSubsection,
                {marginBottom: 10},
              ]}
              styleListContainer={{
                maxHeight: 150,
              }}
              tagRemoveIconColor={'#999999'}
              tagContainerStyle={{
                borderColor: CONSTANT.whiteColor,
                borderRadius: 0,
                backgroundColor: '#F7F7F7',
              }}
              tagTextColor="#999999"
              onChangeInput={text => console.log(text)}
              displayKey="name"
              submitButtonText={constant.Submit}
            />
          </View>
        </>
        <>
          <Text style={[styles.postProjectHeading, {paddingTop: 20}]}>
            {constant.postProjectLanguages}
          </Text>
          <View
            style={{
              marginVertical: 10,
              borderBottomColor: '#DDDDDD',
              borderBottomWidth: 1,
              width: '100%',
            }}>
            <MultiSelect
              fontSize={16}
              onSelectedItemsChange={value => setSelectedLanguages(value)}
              uniqueKey="term_id"
              items={languagesTaxonomy}
              selectedItems={selectedLanguages}
              borderBottomWidth={0}
              single={false}
              searchInputPlaceholderText={constant.postProjectSelectLanguagesList}
              selectText={constant.postProjectSelectLanguagesList}
              styleMainWrapper={styles.multiSlectstyleMainWrapper}
              styleDropdownMenuSubsection={[
                styles.multiSlectstyleDropdownMenuSubsection,
                {marginBottom: 10},
              ]}
              styleListContainer={{
                maxHeight: 150,
              }}
              tagRemoveIconColor={'#999999'}
              tagContainerStyle={{
                borderColor: CONSTANT.whiteColor,
                borderRadius: 0,
                backgroundColor: '#F7F7F7',
              }}
              tagTextColor="#999999"
              onChangeInput={text => console.log(text)}
              displayKey="name"
              submitButtonText={constant.Submit}
            />
          </View>
        </>
      </View>
      <View
        style={{borderColor: '#DDDDDD', borderWidth: 0.5, marginVertical: 20}}
      />
      <View style={{marginHorizontal: 15}}>
        <FormButton
          buttonTitle={constant.SaveCont}
          backgroundColor={CONSTANT.primaryColor}
          textColor={'#FFFFFF'}
          onPress={() => saveAndContinue()}
          loader={loader}
        />
        <FormButton
          buttonTitle={constant.postProjectGoBack}
          backgroundColor={'#F7F7F7'}
          textColor={'#1C1C1C'}
          onPress={() => dispatch(updateStep(0))}
        />
      </View>
    </ScrollView>
  );
};

export default PostProjectStepTwo;
