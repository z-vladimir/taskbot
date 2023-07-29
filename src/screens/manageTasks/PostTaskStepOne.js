import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Switch,
  KeyboardAvoidingView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import Feather from 'react-native-vector-icons/Feather';
import FormButton from '../../components/FormButton';
import * as CONSTANT from '../../constants/globalConstants';
import {decode} from 'html-entities';
import MultiSelect from 'react-native-multiple-select';
import axios from 'axios';
import {useIsFocused} from '@react-navigation/native';
import DocumentPicker from 'react-native-document-picker';
import constant from '../../constants/translation';
import styles from '../../style/styles.js';
import {useSelector, useDispatch} from 'react-redux';
import {updateStep, updatePostedTaskId} from '../../Redux/PostTaskSlice';
import FormInput from '../../components/FormInput';

const PostTaskStepOne = ({item}) => {
  const token = useSelector(state => state.value.token);
  const userDetail = useSelector(state => state.value.userInfo);
  const categoriesTaxonomy = useSelector(
    state => state.setting.categoriesTaxonomy,
  );
  const step = useSelector(state => state.postedTask.step);
  const taskId = useSelector(state => state.postedTask.taskId);

  const durationTaxonomy = useSelector(state => state.setting.durationTaxonomy);
  const settings = useSelector(state => state.setting.settings);
  const tagsTaxonomy = useSelector(state => state.setting.tagsTaxonomy);
  const countriesTaxonomy = useSelector(
    state => state.setting.countriesTaxonomy,
  );
  const dispatch = useDispatch();
  const isFocused = useIsFocused();

  const [title, setTitle] = useState('');
  const [zipcode, setZipcode] = useState('');
  const [show, setShow] = useState(false);

  const [subCategory, setSubCategory] = useState([]);
  const [taskType, setTaskType] = useState([]);
  const [selectedTaskType, setSelectedTaskType] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [comment, setComment] = useState('');
  const [refreshList, setRefreshList] = useState(false);
  const [tagTextFiled, setTagTextFiled] = useState(false);
  const [tagText, setTagText] = useState('');
  const [loader, setLoader] = useState(false);
  const [spinner, setSpinner] = useState(false);
  const [subSpinner, setSubSpinner] = useState(false);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  let categories = [];
  let loactions = [];
  for (var i = 0; i < categoriesTaxonomy.length; i++) {
    if (categoriesTaxonomy[i].parent == 0) {
      categories.push({
        id: categoriesTaxonomy[i].term_id,
        name: decode(categoriesTaxonomy[i].name),
      });
    }
  }
  Object.entries(settings.location_type).map(([key, value]) =>
    loactions.push({
      slug: key,
      name: value,
    }),
  );
  useEffect(() => {
    if (isFocused) {
      if (item != null) {
        setTitle(item.task_name);
        let parentId = null;
        let childId = null;
        let typeArray = [];
        for (let i = 0; i < item.category_arr.length; i++) {
          if (item.category_arr[i].parent == 0) {
            parentId = item.category_arr[i].term_id;
            setSelectedCategory([item.category_arr[i].term_id]);
            getSubCatAndTaskType(item.category_arr[i].term_id, 'sub');
            setSpinner(true);
            setSelectedTaskType('');
            setSelectedSubCategory('');
          }
        }
        for (let i = 0; i < item.category_arr.length; i++) {
          if (item.category_arr[i].parent == parentId) {
            childId = item.category_arr[i].term_id;
            setSelectedSubCategory([item.category_arr[i].term_id]);
            getSubCatAndTaskType(item.category_arr[i].term_id, 'task');
            setSubSpinner(true);
          }
        }
        for (let i = 0; i < item.category_arr.length; i++) {
          if (item.category_arr[i].parent == childId) {
            typeArray.push(item.category_arr[i].term_id);
            setSubSpinner(true);
          }
        }
        setSelectedTaskType(typeArray);
        setSelectedCountry([item.country]);
        setZipcode(item.zipcode);
        setComment(item.task_content);
        let arr = [];
        for (let i = 0; i < item.tags_arr.length; i++) {
          arr.push(item.tags_arr.id);
        }
        setSelectedTags(arr);
        setTags(item.tags_arr);
        // setSelectedTags()
      } else {
        setTitle('');
        setSelectedCategory('');
        setSelectedTaskType('');
        setSelectedSubCategory('');
        setSelectedSubCategory();
        setSelectedTaskType('');
        setSelectedCountry('');
        setZipcode('');
        setComment('');
        setSelectedTags([]);
        setTags([]);
      }
    }
  }, [isFocused]);

  const chooseCategory = value => {
    setSelectedCategory(value);
    getSubCatAndTaskType(value, 'sub');
    setSpinner(true);
    setSelectedTaskType('');
    setSelectedSubCategory('');
  };
  const chooseSubCategory = value => {
    // setSubCategory("")
    setSelectedSubCategory(value);
    getSubCatAndTaskType(value, 'task');
    setSubSpinner(true);
  };
  const addTagText = () => {
    setTagTextFiled(false);
    if (tagText != '') {
      selectedTags.push(tagText);
      let obj = {
        name: tagText,
      };
      tags.push(obj);
    }
  };
  const getSubCatAndTaskType = async (id, type) => {
    return fetch(
      CONSTANT.BaseUrl +
        'settings/get_options?type=taxonomy&taxonomy_name=product_cat&parent_cat=' +
        id,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      },
    )
      .then(response => response.json())
      .then(responseJson => {
        let array = [];
        for (var i = 0; i < responseJson.length; i++) {
          array.push({
            id: responseJson[i].term_id,
            name: decode(responseJson[i].name),
          });
        }
        if (type == 'task') {
          setTaskType(array);
        }
        if (type == 'sub') {
          setSubCategory(array);
        }
        setSpinner(false);
        setSubSpinner(false);
        // setSubCategories(responseJson);
        // setSearchSubCategories(responseJson);
        // setRefreshList(!refreshList);
      })
      .catch(error => {
        setSpinner(false);
        setSubSpinner(false);
        console.error(error);
      });
  };
  const selectAndAddTags = value => {
    setSelectedTags(value);
    let arr = [];
    for (let i = 0; i < value.length; i++) {
      for (let j = 0; j < tagsTaxonomy.length; j++) {
        if (value[i] == tagsTaxonomy[j].id) {
          arr.push(tagsTaxonomy[j]);
        }
      }
    }
    setTags(arr);
    setRefreshList(!refreshList);
  };
  const deleteTags = index => {
    tags.splice(index, 1);
    selectedTags.splice(index, 1);
    setRefreshList(!refreshList);
  };

  const saveUpdateStepOne = () => {
    setLoader(true);
    let taskbot_service = {};
    let tagFinalArray = [];
    for (let i = 0; i < tags.length; i++) {
      tagFinalArray.push({
        value: tags[i].name,
      });
    }
    taskbot_service.post_title = title;
    taskbot_service.category = selectedCategory.toString();
    taskbot_service.category_level2 = selectedSubCategory.toString();
    taskbot_service.category_level3 = selectedTaskType;
    taskbot_service.locations = selectedCountry.toString();
    taskbot_service.zipcode = parseInt(zipcode);
    taskbot_service.post_content = comment;
    taskbot_service.product_tag = [JSON.stringify(tagFinalArray)];

    axios
      .post(
        CONSTANT.BaseUrl + 'create-task',
        {
          post_id: userDetail.profile_id,
          user_id: userDetail.user_id,
          action: 'taskbot_add_service_inroduction_save',
          task_id: taskId,
          taskbot_service: taskbot_service,
        },
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        },
      )
      .then(async response => {
        setLoader(false);
        console.log('ResponseSecond', response);
        if (response.data.type == 'success') {
          dispatch(updatePostedTaskId(response.data.task_id));
          dispatch(updateStep(1));
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
        <Text style={[styles.postProjectHeading, {paddingTop: 20}]}>
          {constant.postTaskAddTitle}
        </Text>
        <FormInput
          labelValue={title}
          onChangeText={text => setTitle(text)}
          placeholderText={constant.postTaskEnterTaskTitle}
          autoCorrect={false}
        />
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Text style={[styles.postProjectHeading, {paddingTop: 20}]}>
            {constant.postTaskChooseCategory}
          </Text>
          {spinner && (
            <View>
              <ActivityIndicator
                style={{marginLeft: 15, marginTop: 20}}
                size="small"
                color={CONSTANT.primaryColor}
              />
            </View>
          )}
        </View>
        <View
          style={{
            marginVertical: 10,
            borderBottomColor: '#DDDDDD',
            borderBottomWidth: 1,
            width: '100%',
          }}>
          <MultiSelect
            fontSize={16}
            onSelectedItemsChange={value => chooseCategory(value)}
            uniqueKey="id"
            items={categories}
            selectedItems={selectedCategory}
            borderBottomWidth={0}
            single={true}
            searchInputPlaceholderText={constant.postTaskSelectCategory}
            selectText={constant.postTaskSelectCategory}
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
        {selectedCategory != '' && !spinner && (
          <>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={[styles.postProjectHeading, {paddingTop: 20}]}>
                {constant.postTaskSubCategory}
              </Text>
              {subSpinner && (
                <View>
                  <ActivityIndicator
                    style={{marginLeft: 15, marginTop: 20}}
                    size="small"
                    color={CONSTANT.primaryColor}
                  />
                </View>
              )}
            </View>
            <View
              style={{
                marginVertical: 10,
                borderBottomColor: '#DDDDDD',
                borderBottomWidth: 1,
                width: '100%',
              }}>
              <MultiSelect
                fontSize={16}
                onSelectedItemsChange={value => chooseSubCategory(value)}
                uniqueKey="id"
                items={subCategory}
                selectedItems={selectedSubCategory}
                borderBottomWidth={0}
                single={true}
                searchInputPlaceholderText={constant.postTaskSelectsubCategory}
                selectText={constant.postTaskSelectsubCategory}
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
        )}
        {selectedSubCategory != '' && (
          <>
            <Text style={[styles.postProjectHeading, {paddingTop: 20}]}>
              {constant.postTaskType}
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
                onSelectedItemsChange={value => setSelectedTaskType(value)}
                uniqueKey="id"
                items={taskType}
                selectedItems={selectedTaskType}
                borderBottomWidth={0}
                // single={true}
                searchInputPlaceholderText={constant.postTaskSelectTaskType}
                selectText={constant.postTaskSelectTaskType}
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
        )}

        <Text style={[styles.postProjectHeading, {paddingTop: 20}]}>
          {constant.postTaskCountry}
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
            onSelectedItemsChange={value => setSelectedCountry(value)}
            uniqueKey="slug"
            items={countriesTaxonomy}
            selectedItems={selectedCountry}
            borderBottomWidth={0}
            single={true}
            searchInputPlaceholderText={constant.postTaskChooseCountry}
            selectText={constant.postTaskChooseCountry}
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
        <Text style={[styles.postProjectHeading, {paddingTop: 20}]}>
          {constant.postTaskZipcode}
        </Text>
        <FormInput
          labelValue={zipcode}
          onChangeText={text => setZipcode(text)}
          placeholderText={constant.postTaskZipcode}
          autoCorrect={false}
        />

        <>
          <View style={styles.disputeDetailsAddReply}>
            <Text style={[styles.postProjectHeading, {paddingTop: 10}]}>
              {constant.postTaskIntroduction}
            </Text>
            <View style={styles.MultiLineTextFieldView}>
              <TextInput
                style={styles.sendProjectMultiLineTextField}
                value={comment}
                onChangeText={body => setComment(body)}
                placeholder={constant.postTaskEnterDetailsHere}
                placeholderTextColor="#888888"
                multiline={true}
                underlineColorAndroid="transparent"
              />
            </View>
          </View>
        </>
        {/* <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.LoginKeyboardAvoid}> */}
        <Text style={[styles.postProjectHeading, {marginTop: 40}]}>
          {constant.postTaskTags}
        </Text>

        {/* </KeyboardAvoidingView> */}
        <View
          style={{
            // borderBottomColor: CONSTANT.borderColor,
            // borderBottomWidth: 1,
            marginTop: 10,
            width: '100%',
            paddingVertical: 5,
            marginBottom: 10,

            flexDirection: 'row',
          }}>
          <View style={{width: '85%'}}>
            {tagTextFiled ? (
              <View style={{marginTop: -12}}>
                <FormInput
                  labelValue={tagText}
                  onChangeText={text => setTagText(text)}
                  placeholderText={constant.postTaskAddTags}
                  autoCorrect={false}
                />
              </View>
            ) : (
              <MultiSelect
                fontSize={16}
                onSelectedItemsChange={value => selectAndAddTags(value)}
                uniqueKey="id"
                items={tagsTaxonomy}
                // canAddItems={true}
                selectedItems={selectedTags}
                borderBottomWidth={0}
                single={false}
                // onAddItem={value => console.log(object)}
                // searchInputPlaceholderText={'Tags'}
                selectText={constant.postTaskTagstext}
                hideTags={true}
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
                onChangeInput={text => console.log(text)}
                displayKey="name"
                submitButtonText={constant.Submit}
              />
            )}
          </View>
          {tagTextFiled ? (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => addTagText()}
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                width: '17%',
                backgroundColor: CONSTANT.whiteColor,
                height: 50,
              }}>
              <Feather
                style={{backgroundColor: CONSTANT.primaryColor, padding: 10}}
                name={'check'}
                type={'check'}
                color={'#fff'}
                size={19}
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => {
                setTagTextFiled(true);
                setTagText('');
              }}
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                width: '17%',
                backgroundColor: CONSTANT.whiteColor,
                height: 50,
              }}>
              <Feather
                style={{backgroundColor: '#22C55E', padding: 10}}
                name={'plus'}
                type={'plus'}
                color={'#fff'}
                size={19}
              />
            </TouchableOpacity>
          )}
        </View>
        <FlatList
          // style={{marginTop: 10}}
          data={tags}
          columnWrapperStyle={{flexWrap: 'wrap'}}
          numColumns={50}
          keyExtractor={(x, i) => i.toString()}
          extraData={refreshList}
          renderItem={({item, index}) => (
            <View
              style={{
                backgroundColor: '#f7f7f7',
                paddingHorizontal: 10,
                paddingVertical: 5,
                marginHorizontal: 5,
                marginBottom: 5,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  fontFamily: 'Urbanist-Regular',
                  fontSize: 15,
                  lineHeight: 26,
                  letterSpacing: 0.5,
                  color: '#1C1C1C',
                  textAlign: 'center',
                }}>
                {item.name}
              </Text>
              {/* <TouchableOpacity
                style={{
                  padding: 6,
                  borderRadius: 50,
                  backgroundColor: '#888888',
                  marginLeft: 15,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}> */}
              <Feather
                style={{
                  marginLeft: 15,
                }}
                onPress={() => deleteTags(index)}
                name={'x-circle'}
                type={'x-circle'}
                color={'#EF4444'}
                size={20}
              />
              {/* </TouchableOpacity> */}
            </View>
          )}
        />
        <Text
          style={{
            fontFamily: 'Urbanist-Regular',
            fontSize: 15,
            lineHeight: 26,
            letterSpacing: 0.5,
            color: '#1C1C1C',
            textAlign: 'center',
          }}>
          {constant.postTaskClickSaveUpdate}
        </Text>
        <FormButton
          onPress={() => saveUpdateStepOne()}
          buttonTitle={constant.Save}
          backgroundColor={CONSTANT.primaryColor}
          textColor={'#fff'}
          loader={loader}
        />
      </View>
    </ScrollView>
  );
};

export default PostTaskStepOne;
