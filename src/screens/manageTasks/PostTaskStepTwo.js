import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Switch,
  Alert,
} from 'react-native';
import React, {useState, useEffect, useRef} from 'react';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FormButton from '../../components/FormButton';
import * as CONSTANT from '../../constants/globalConstants';
import {decode} from 'html-entities';
import MultiSelect from 'react-native-multiple-select';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import axios from 'axios';
import DocumentPicker from 'react-native-document-picker';
import constant from '../../constants/translation';
import styles from '../../style/styles.js';
import RBSheet from 'react-native-raw-bottom-sheet';
import {useSelector, useDispatch} from 'react-redux';
import {updateStep, updatePostedTaskId} from '../../Redux/PostTaskSlice';
import FormInput from '../../components/FormInput';

const PostTaskStepTwo = ({item}) => {
  const deliveryTaxonomy = useSelector(state => state.setting.deliveryTaxonomy);
  const settings = useSelector(state => state.setting.settings);
  const userDetail = useSelector(state => state.value.userInfo);
  const savedList = useSelector(state => state.saved.savedSellers);
  const step = useSelector(state => state.postedTask.step);
  const taskId = useSelector(state => state.postedTask.taskId);
  const token = useSelector(state => state.value.token);
  const dispatch = useDispatch();
  const RBSheetTaskAddOn = useRef();
  const [showPackage, setShowPackage] = useState(null);
  const [titleOne, setTitleOne] = useState('');

  const [featured, setFeatured] = useState('');
  const [refresh, setRefresh] = useState(false);
  const [reload, setReload] = useState(false);
  const [loader, setLoader] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customFields, setCustomFields] = useState([]);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [addOns, setAddOns] = useState([]);
  const [addOnsTitle, setAddOnsTitle] = useState('');
  const [addOnsPrice, setAddOnsPrice] = useState('');
  const [selectedAddonId, setSelectedAddonId] = useState(null);
  const [addOnDescription, setAddOnDescription] = useState('');
  const [packages, setPackages] = useState([]);
  const [extraFields, setExtraFields] = useState([]);
  useEffect(() => {
    getaddons();
    getpackagesData();
  }, []);
  useEffect(() => {
    if (item != null) {
      if (packages.length != 0) {
        for (let i = 0; i < item.attributes.length; i++) {
          for (let j = 0; j < packages.length; j++) {
            if (item.attributes[i].key == packages[j].name) {
              packages[j].fields[0].field.value = item.attributes[i].title;
              packages[j].fields[1].field.value =
                item.attributes[i].description;
              packages[j].fields[2].field.value = item.attributes[i].reg_price;
              packages[j].fields[3].field.value = [item.attributes[i].delivery_time_id]
              packages[j].fields[4].field.value =
                item.attributes[i].featured_package;
              if (item.attributes[i].featured_package == 'yes') {
                setFeatured(packages[j].name);
              }
              for (let k = 0; k < item.attributes[i].fields.length; k++) {
                for (let l = 0; l < packages[j].subFields.length; l++) {
                  if (
                    item.attributes[i].fields[k].key ==
                    packages[j].subFields[l].key
                  ) {
                    packages[j].subFields[l].value =
                      item.attributes[i].fields[k].plan_value;
                  }
                }
              }
            }
          }
        }
      }

      let arrCustom = [];
      for (let i = 0; i < item.custom_fields.length; i++) {
        arrCustom.push({
          title: item.custom_fields[i].title,
          valOne: item.custom_fields[i].basic,
          valTwo: item.custom_fields[i].premium,
          valThree: item.custom_fields[i].pro,
        });
      }
      setCustomFields(arrCustom);
      let arr = [];
      for (let i = 0; i < item.sub_tasks.length; i++) {
        arr.push(item.sub_tasks[i].ID);
      }
      setSelectedAddons(arr);
      // setSelectedTags()
    }
  }, [reload]);

  const getpackagesData = async () => {
    setLoader(true);
    return fetch(CONSTANT.BaseUrl + 'get-task-data?post_id=' + taskId, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
      .then(response => response.json())
      .then(responseJson => {
        setLoader(false);

        let subFields = [];
        for (let h = 0; h < responseJson.field_array.length; h++) {
          for (
            let i = 0;
            i < responseJson.field_array[h][0].sub_fields.length;
            i++
          ) {
            let array = [];
            if (responseJson.field_array[h][0].sub_fields[i].type == 'select') {
              Object.entries(
                responseJson.field_array[h][0].sub_fields[i].choices,
              ).map(([key, value]) =>
                array.push({
                  name: value,
                  slug: key,
                }),
              );
              responseJson.field_array[h][0].sub_fields[i].choices = array;
            }
            subFields.push(responseJson.field_array[h][0].sub_fields[i]);
          }
        }
        let packageDefault = [];
        Object.entries(responseJson.service_plans).map(([key, value]) =>
          packageDefault.push({
            name: key,
            subFields: subFields,
            fields: Object.entries(value).map(([key, value]) => ({
              name: key,
              field: value,
            })),
          }),
        );
        setPackages(JSON.parse(JSON.stringify(packageDefault)));
        setReload(!reload);
      })
      .catch(error => {
        setLoader(false);
        console.error(error);
      });
  };

  const getaddons = async () => {
    axios
      .post(
        CONSTANT.BaseUrl + 'get-all-addons',
        {
          post_id: userDetail.profile_id,
          user_id: userDetail.user_id,
          type: 'all',
        },
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        },
      )
      .then(async response => {
        // setLoader(false);
        setAddOns(response.data);
      })
      .catch(error => {
        // setLoader(false);
        console.log(error);
      });
  };

  const setFeaturedPackage = (item, index, mainItem) => {
    setFeatured(mainItem.name);
    for (let i = 0; i < packages.length; i++) {
      packages[i].fields[index].field.value = 'no';
    }
    item.field.value = 'yes';
    setRefresh(!refresh);
  };

  const toggleSwitch = (item, index, mainIndex) => {
    if (packages[mainIndex].subFields[index].value == 'yes') {
      packages[mainIndex].subFields[index].value = 'no';
    } else {
      packages[mainIndex].subFields[index].value = 'yes';
    }
    setRefresh(!refresh);
    // setEnableMileston(previousState => !previousState);
  };
  const addCustomField = () => {
    customFields.push({
      title: '',
      valOne: '',
      valTwo: '',
      valThree: '',
    });
    setRefresh(!refresh);
  };
  const deleteCustomField = index => {
    customFields.splice(index, 1);
    setRefresh(!refresh);
  };
  const editAddons = (index, item) => {
    RBSheetTaskAddOn.current.open();
    // setSelectedAddOns(index);
    setSelectedAddonId(item.id);
    setAddOnsTitle(item.name);
    setAddOnsPrice(item.price);
    setAddOnDescription(item.desc);
    setRefresh(!refresh);
  };
  const saveUpdateAddOn = async () => {
   
    setLoading(true);
    axios
      .post(
        CONSTANT.BaseUrl + 'create-sub-task',
        {
          user_id: userDetail.user_id,
          task_id: taskId,
          subtask_id: selectedAddonId != null ? selectedAddonId : '',
          title: addOnsTitle,
          content: addOnDescription,
          price: addOnsPrice,
        },
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        },
      )
      .then(async response => {
        // setLoader(false);
        setLoading(false);
        if (response.data.type == 'success') {
          getaddons();
          setRefresh(!refresh);
          RBSheetTaskAddOn.current.close();
          setAddOnsTitle('');
          setAddOnsPrice('');
          setAddOnDescription('');
        } else if (response.data.type == 'error') {
          Alert.alert('Oops', response.data.message_desc);
        }
      })
      .catch(error => {
        setLoading(false);
        console.log(error);
      });
  };
  const PushInArray = (item, index) => {
    if (selectedAddons.includes(item.id)) {
      const index = selectedAddons.indexOf(item.id);
      if (index > -1) {
        selectedAddons.splice(index, 1);
      }
      setRefresh(!refresh);
    } else {
      selectedAddons.push(item.id);
      setRefresh(!refresh);
    }
  };

  const saveUpdateSecondStep = () => {
    setLoading(true);
    let plans = {};
    let custom_fields = [];

    for (let i = 0; i < packages.length; i++) {
      let fields = {};
      for (let j = 0; j < packages[i].fields.length; j++) {
        fields[packages[i].fields[j].name] = packages[i].fields[j].field.value;
      }
      for (let k = 0; k < packages[i].subFields.length; k++) {
        fields[packages[i].subFields[k].key] = packages[i].subFields[k].value;
      }
      plans[packages[i].name] = fields;
    }
    for (let i = 0; i < customFields.length; i++) {
      const string = Math.floor(100000 + Math.random() * 900000);
      let obj = {
        title: customFields[i].title,
        basic: customFields[i].valOne,
        premium: customFields[i].valTwo,
        pro: customFields[i].valThree,
      };
      custom_fields.push(obj);
    }
    if (plans.basic.title != '' && plans.basic.price != '') {
      axios
        .post(
          CONSTANT.BaseUrl + 'create-task',
          {
            post_id: userDetail.profile_id,
            user_id: userDetail.user_id,
            action: 2,
            step_id: 2,
            task_id: taskId,
            featured_package: featured,
            // subtasks_ids:"taskbot_add_service_inroduction_save",
            plans: plans,
            custom_fields: custom_fields,
            subtasks_selected_ids: selectedAddons.toString(),
          },
          {
            headers: {
              Authorization: 'Bearer ' + token,
            },
          },
        )
        .then(async response => {
          setLoading(false);
          if (response.data.type == 'success') {
            dispatch(updateStep(2));
          } else if (response.data.type == 'error') {
            Alert.alert('Oops', response.data.message_desc);
          }
        })
        .catch(error => {
          setLoading(false);
          console.log(error);
        });
    } else {
      Alert.alert('Oops', 'Please enter complete first package details');
    }
  };
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View
        style={{
          marginHorizontal: 15,
          marginVertical: 10,
        }}>
        {loader ? (
          <>
            <View
              style={{
                width: '100%',
                height: 60,
                marginTop: 7,
                borderRadius: 10,
                marginBottom: 10,
              }}>
              <SkeletonPlaceholder>
                <View
                  style={{
                    width: '100%',
                    height: 60,
                    borderRadius: 10,
                  }}
                />
              </SkeletonPlaceholder>
            </View>
            <View
              style={{
                width: '100%',
                height: 60,
                marginTop: 7,
                borderRadius: 10,
                marginBottom: 10,
              }}>
              <SkeletonPlaceholder>
                <View
                  style={{
                    width: '100%',
                    height: 60,
                    borderRadius: 10,
                  }}
                />
              </SkeletonPlaceholder>
            </View>
            <View
              style={{
                width: '100%',
                height: 60,
                marginTop: 7,
                borderRadius: 10,
                marginBottom: 10,
              }}>
              <SkeletonPlaceholder>
                <View
                  style={{
                    width: '100%',
                    height: 60,
                    borderRadius: 10,
                  }}
                />
              </SkeletonPlaceholder>
            </View>
          </>
        ) : (
          <FlatList
            data={packages}
            keyExtractor={(x, i) => i.toString()}
            extraData={refresh}
            renderItem={({item, index}) => {
              let mainItem = item;
              let mainIndex = index;
              return (
                <View
                  style={{
                    borderRadius: 6,
                    borderColor: CONSTANT.borderColor,
                    borderWidth: 1,
                    marginBottom: 10,
                  }}>
                  <TouchableOpacity
                    onPress={() =>
                      setShowPackage(showPackage == index ? null : index)
                    }
                    style={{
                      paddingVertical: 10,
                      borderRadius: 6,
                      paddingHorizontal: 15,
                      paddingVertical: 20,
                      backgroundColor: '#f7f7f7',
                      justifyContent: 'space-between',
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <Text style={[styles.postProjectHeading, {fontSize: 18}]}>
                      {item.fields[0].field.value != ''
                        ? item.fields[0].field.value
                        : item.name.charAt(0).toUpperCase() +
                          item.name.slice(1)}
                    </Text>

                    <Feather
                      // style={styles.homeSearchIconStyle}
                      name={
                        showPackage == index ? 'chevron-up' : 'chevron-down'
                      }
                      size={20}
                      color={'#999999'}
                    />
                  </TouchableOpacity>
                  {showPackage == index && (
                    <View
                      style={{
                        paddingVertical: 10,
                        borderRadius: 6,
                        paddingHorizontal: 15,
                      }}>
                      <FlatList
                        data={item.fields}
                        keyExtractor={(x, i) => i.toString()}
                        extraData={refresh}
                        renderItem={({item, index}) => (
                          <>
                            {item.field.type == 'text' && (
                              <>
                                <Text
                                  style={[
                                    [styles.postProjectHeading, {fontSize: 16}],
                                    {paddingTop: 10},
                                  ]}>
                                  {item.field.label}
                                </Text>
                                <FormInput
                                  labelValue={item.field.value}
                                  placeholderText={item.field.placeholder}
                                  onChangeText={val => {
                                    item.field.value = val;
                                    setRefresh(!refresh);
                                  }}
                                />
                              </>
                            )}
                            {item.field.type == 'number' && (
                              <>
                                <Text
                                  style={[
                                    [styles.postProjectHeading, {fontSize: 16}],
                                    {paddingTop: 20},
                                  ]}>
                                  {item.field.label}
                                </Text>
                                <FormInput
                                  labelValue={item.field.value}
                                  placeholderText={item.field.placeholder}
                                  inputType={'number-pad'}
                                  onChangeText={val => {
                                    item.field.value = val;
                                    setRefresh(!refresh);
                                  }}
                                />
                              </>
                            )}
                            {item.field.type == 'textarea' && (
                              <>
                                <Text
                                  style={[
                                    [styles.postProjectHeading, {fontSize: 16}],
                                    {paddingTop: 10},
                                  ]}>
                                  {item.field.label}
                                </Text>
                                <View
                                  style={{
                                    borderBottomColor: '#E1E1E1',
                                    borderBottomWidth: 1,
                                    // backgroundColor:"red",
                                    padding: 12,
                                    height: 200,
                                  }}>
                                  <TextInput
                                    style={{
                                      height: 180,
                                      borderRadius: 5,
                                      lineHeight: 26,
                                      letterSpacing: 0.5,
                                      fontSize: 16,
                                      color: '#062347',
                                      fontFamily: 'Urbanist-SemiBold',
                                      textAlignVertical: 'top',
                                    }}
                                    value={item.field.value}
                                    onChangeText={val => {
                                      item.field.value = val;
                                      setRefresh(!refresh);
                                    }}
                                    placeholder={item.field.placeholder}
                                    placeholderTextColor="#888888"
                                    multiline={true}
                                    underlineColorAndroid="transparent"
                                  />
                                </View>
                              </>
                            )}
                            {(item.field.type == 'switch' ||
                              item.field.type == 'checkbox') && (
                              <View
                                style={{
                                  flexDirection: 'row',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  marginVertical: 15,
                                }}>
                                <Text
                                  style={[
                                    [styles.postProjectHeading, {fontSize: 16}],
                                    {paddingTop: 0},
                                  ]}>
                                  {item.field.label}
                                </Text>
                                <Switch
                                  style={{
                                    transform: [{scaleX: 0.8}, {scaleY: 0.8}],
                                  }}
                                  trackColor={{
                                    false: '#DDDDDD',
                                    true: '#22C55E',
                                  }}
                                  thumbColor={'#fff'}
                                  ios_backgroundColor={'#FFFFFF'}
                                  onValueChange={() => toggleSwitch(item)}
                                  value={item.field.value}
                                />
                              </View>
                            )}
                            {item.field.type == 'terms_dropdwon' && (
                              <>
                                <Text
                                  style={[
                                    [styles.postProjectHeading, {fontSize: 16}],
                                    {paddingTop: 20},
                                  ]}>
                                  {item.field.label}
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
                                    onSelectedItemsChange={value => {
                                      // item.field.value = value.toString();
                                      item.field.value = value;
                                      setRefresh(!refresh);
                                    }}
                                    uniqueKey="term_id"
                                    items={deliveryTaxonomy}
                                    selectedItems={item.field.value}
                                    borderBottomWidth={0}
                                    single={true}
                                    searchInputPlaceholderText={
                                      item.field.placeholder
                                    }
                                    selectText={item.field.placeholder}
                                    styleMainWrapper={
                                      styles.multiSlectstyleMainWrapper
                                    }
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
                            {item.field.type == 'featured_package' && (
                              <TouchableOpacity
                                onPress={() => {
                                  setFeaturedPackage(item, index, mainItem);
                                }}
                                style={[styles.sendProposalEmpolyerView]}>
                                <View style={styles.sendProposalEmpolyerMain}>
                                  <View
                                    style={[
                                      styles.orderDetailSelectPlanCheckCircle,
                                      {
                                        backgroundColor:
                                          item.field.value == 'yes'
                                            ? '#22C55E'
                                            : '#fff',
                                      },
                                    ]}>
                                    <View
                                      style={
                                        styles.orderDetailSelectPlanCheckInnerCircle
                                      }
                                    />
                                  </View>
                                  <Text
                                    style={
                                      styles.sendProposalEmpolyerCheckText
                                    }>
                                    {item.field.label}
                                  </Text>
                                </View>
                              </TouchableOpacity>
                            )}
                          </>
                        )}
                      />
                      <FlatList
                        data={item.subFields}
                        keyExtractor={(x, i) => i.toString()}
                        extraData={refresh}
                        renderItem={({item, index}) => (
                          <>
                            {(item.type == 'text' || item.type == 'url') && (
                              <>
                                <Text
                                  style={[
                                    [styles.postProjectHeading, {fontSize: 16}],
                                    {paddingTop: 20},
                                  ]}>
                                  {item.label}
                                </Text>
                                <FormInput
                                  labelValue={item.value}
                                  placeholderText={
                                    item.placeholder != ''
                                      ? item.placeholder
                                      : 'Type here'
                                  }
                                  onChangeText={val => {
                                    item.value = val;
                                    setRefresh(!refresh);
                                  }}
                                />
                              </>
                            )}
                            {item.type == 'number' && (
                              <>
                                <Text
                                  style={[
                                    [styles.postProjectHeading, {fontSize: 16}],
                                    {paddingTop: 20},
                                  ]}>
                                  {item.label}
                                </Text>
                                <FormInput
                                  labelValue={item.value}
                                  placeholderText={
                                    item.placeholder != ''
                                      ? item.placeholder
                                      : 'Type here'
                                  }
                                  inputType={'number-pad'}
                                  onChangeText={val => {
                                    item.value = val;
                                    setRefresh(!refresh);
                                  }}
                                />
                              </>
                            )}
                            {item.type == 'textarea' && (
                              <>
                                <Text
                                  style={[
                                    [styles.postProjectHeading, {fontSize: 16}],
                                    {paddingTop: 10},
                                  ]}>
                                  {item.label}
                                </Text>
                                <View
                                  style={{
                                    borderBottomColor: '#E1E1E1',
                                    borderBottomWidth: 1,
                                    // backgroundColor:"red",
                                    padding: 12,
                                    height: 200,
                                  }}>
                                  <TextInput
                                    style={{
                                      height: 180,
                                      borderRadius: 5,
                                      lineHeight: 26,
                                      letterSpacing: 0.5,
                                      fontSize: 16,
                                      color: '#062347',
                                      fontFamily: 'Urbanist-SemiBold',
                                      textAlignVertical: 'top',
                                    }}
                                    value={item.value}
                                    onChangeText={body => {
                                      item.value = body;
                                      setRefresh(!refresh);
                                    }}
                                    placeholder={
                                      item.placeholder != ''
                                        ? item.placeholder
                                        : 'Type here'
                                    }
                                    placeholderTextColor="#888888"
                                    multiline={true}
                                    underlineColorAndroid="transparent"
                                  />
                                </View>
                              </>
                            )}
                            {(item.type == 'switch' ||
                              item.type == 'checkbox') && (
                              <View
                                style={{
                                  flexDirection: 'row',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  marginVertical: 15,
                                }}>
                                <Text
                                  style={[
                                    [styles.postProjectHeading, {fontSize: 16}],
                                    {paddingTop: 0},
                                  ]}>
                                  {item.label}
                                </Text>
                                <Switch
                                  style={{
                                    transform: [{scaleX: 0.8}, {scaleY: 0.8}],
                                  }}
                                  trackColor={{
                                    false: '#DDDDDD',
                                    true: '#22C55E',
                                  }}
                                  thumbColor={'#fff'}
                                  ios_backgroundColor={'#FFFFFF'}
                                  onValueChange={() =>
                                    toggleSwitch(item, index, mainIndex)
                                  }
                                  value={item.value == 'yes' ? true : false}
                                />
                              </View>
                            )}
                            {item.type == 'select' && (
                              <>
                                <Text
                                  style={[
                                    [styles.postProjectHeading, {fontSize: 16}],
                                    {paddingTop: 20},
                                  ]}>
                                  {item.label}
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
                                    onSelectedItemsChange={value => {
                                      item.value =
                                        item.multiple == 0
                                          ? value.toString()
                                          : value;
                                      setRefresh(!refresh);
                                    }}
                                    uniqueKey="slug"
                                    items={item.choices}
                                    selectedItems={
                                      item.value != null ? item.value : ''
                                    }
                                    borderBottomWidth={0}
                                    single={item.multiple == 0 ? true : false}
                                    searchInputPlaceholderText={
                                      item.placeholder != ''
                                        ? item.placeholder
                                        : 'Select an option'
                                    }
                                    selectText={
                                      item.placeholder != ''
                                        ? item.placeholder
                                        : 'Select an option'
                                    }
                                    styleMainWrapper={
                                      styles.multiSlectstyleMainWrapper
                                    }
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
                            {/* {item.type == 'checkbox' && (
                          <>
                            <TouchableOpacity
                              //   onPress={() => manageSelectedServices(item, index)}
                              style={[styles.checkBoxMainView, {width: '95%'}]}>
                              {downloadables ?
                              <View style={styles.checkBoxCheckSkills}>
                                <FontAwesome
                                  name="check"
                                  type="check"
                                  color={'#fff'}
                                  size={14}
                                />
                              </View>
                               :
                            <View
                              style={{
                                width: 20,
                                height: 20,
                                backgroundColor: '#fff',
                                borderRadius: 4,
                                borderColor: CONSTANT.borderColor,
                                borderWidth: 1,
                              }}></View>} 
                              <Text style={styles.checkBoxCheckSkillsText}>
                                {item.label}
                              </Text>
                            </TouchableOpacity>
                          </>
                        )} */}
                          </>
                        )}
                      />
                    </View>
                  )}
                </View>
              );
            }}
          />
        )}
      </View>
      <View style={{borderTopColor: '#DDDDDD', borderTopWidth: 0.7}} />
      <View
        style={{
          marginHorizontal: 15,
          marginVertical: 10,
        }}>
        <View
          style={{
            paddingVertical: 10,
            borderRadius: 6,
            paddingVertical: 15,
            justifyContent: 'space-between',
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <Text style={styles.postProjectHeading}>
            {constant.postTaskAddCustomFields}
          </Text>
          <TouchableOpacity onPress={() => addCustomField()}>
            <Text
              style={[
                styles.sendProposalEmpolyerCheckText,
                {color: CONSTANT.blueColor},
              ]}>
              {constant.postTaskAddMore}
            </Text>
          </TouchableOpacity>
        </View>
        <FlatList
          // style={{marginTop: 10}}
          data={customFields}
          inverted
          keyExtractor={(x, i) => i.toString()}
          extraData={refresh}
          renderItem={({item, index}) => (
            <View
              style={{
                borderRadius: 6,
                borderColor: CONSTANT.borderColor,
                borderWidth: 1,
                marginBottom: 10,
                paddingHorizontal: 15,
                paddingBottom: 10,
                flexDirection: 'row',
              }}>
              <View style={{paddingVertical: 0, width: '85%'}}>
                <FormInput
                  labelValue={item.title}
                  onChangeText={text => {
                    item.title = text;
                    setRefresh(!refresh);
                  }}
                  placeholderText={constant.postTaskAddTitle}
                  autoCorrect={false}
                />
                <View
                  style={{
                    marginTop: -10,
                    flexDirection: 'row',
                  }}>
                  <View style={{paddingVertical: 0, width: '50%'}}>
                    <FormInput
                      labelValue={item.valOne}
                      onChangeText={text => {
                        item.valOne = text;
                        setRefresh(!refresh);
                      }}
                      placeholderText={constant.postTaskAddValue}
                      autoCorrect={false}
                    />
                  </View>
                  <View style={{paddingVertical: 0, width: '50%'}}>
                    <FormInput
                      labelValue={item.valTwo}
                      onChangeText={text => {
                        item.valTwo = text;
                        setRefresh(!refresh);
                      }}
                      placeholderText={constant.postTaskAddValue}
                      autoCorrect={false}
                    />
                  </View>
                </View>
                <View
                  style={{
                    marginTop: -10,
                  }}>
                  <FormInput
                    labelValue={item.valThree}
                    onChangeText={text => {
                      item.valThree = text;
                      setRefresh(!refresh);
                    }}
                    placeholderText={constant.postTaskAddValue}
                    autoCorrect={false}
                  />
                </View>
              </View>
              <View
                style={{
                  paddingVertical: 10,
                  width: '15%',
                  alignItems: 'center',
                  paddingTop: 25,
                }}>
                <TouchableOpacity onPress={() => deleteCustomField(index)}>
                  <Feather
                    // style={styles.homeSearchIconStyle}
                    name={'trash-2'}
                    size={22}
                    color={'#EF4444'}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
        <View
          style={{
            paddingVertical: 10,
            borderRadius: 6,
            paddingVertical: 15,
            justifyContent: 'space-between',
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <Text style={styles.postProjectHeading}>
            {constant.postTaskAddAddons}
          </Text>
          <TouchableOpacity
            onPress={() => {
              setSelectedAddonId(null);
              setAddOnsTitle('');
              setAddOnsPrice('');
              setAddOnDescription('');
              RBSheetTaskAddOn.current.open();
            }}>
            <Text
              style={[
                styles.sendProposalEmpolyerCheckText,
                {color: CONSTANT.blueColor},
              ]}>
              {constant.postTaskAddMore}
            </Text>
          </TouchableOpacity>
        </View>
        <FlatList
          // style={{marginTop: 10}}
          data={addOns}
          keyExtractor={(x, i) => i.toString()}
          extraData={refresh}
          renderItem={({item, index}) => (
            <View
              style={{
                borderRadius: 6,
                borderColor: CONSTANT.borderColor,
                borderWidth: 1,
                marginBottom: 10,
                paddingHorizontal: 15,
                paddingBottom: 5,
                backgroundColor: '#f7f7f7',
              }}>
              <TouchableOpacity
                onPress={() => PushInArray(item, index)}
                style={[styles.checkBoxMainView, {width: '95%'}]}>
                {selectedAddons.includes(item.id) ? (
                  <View style={styles.checkBoxCheckSkills}>
                    <FontAwesome
                      name="check"
                      type="check"
                      color={'#fff'}
                      size={14}
                    />
                  </View>
                ) : (
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      backgroundColor: '#fff',
                      borderRadius: 4,
                      borderColor: CONSTANT.borderColor,
                      borderWidth: 1,
                    }}></View>
                )}
                <Text style={styles.checkBoxCheckSkillsText}>{item.name}</Text>
              </TouchableOpacity>
              <View style={{borderColor: '#DDDDDD', borderWidth: 0.6}} />
              <View
                style={{
                  borderRadius: 6,
                  paddingVertical: 10,
                  justifyContent: 'space-between',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <Text style={[styles.postProjectHeading, {fontSize: 18}]}>
                  {decode(settings.price_format.symbol)}
                  {parseFloat(item.price).toFixed(2)}
                </Text>
                <TouchableOpacity onPress={() => editAddons(index, item)}>
                  <Feather
                    // style={styles.homeSearchIconStyle}
                    name={'edit-2'}
                    size={20}
                    color={CONSTANT.blueColor}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </View>
      <View style={{borderTopColor: '#DDDDDD', borderTopWidth: 0.7}} />
      <View
        style={{
          marginHorizontal: 15,
          marginVertical: 10,
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
          {constant.postTaskClickSaveUpdate}
        </Text>
        <FormButton
          onPress={() => saveUpdateSecondStep()}
          buttonTitle={constant.Save}
          backgroundColor={CONSTANT.primaryColor}
          textColor={'#fff'}
          loader={loading}
        />
      </View>
      <RBSheet
        ref={RBSheetTaskAddOn}
        height={Dimensions.get('window').height * 0.65}
        duration={250}
        customStyles={{
          container: {
            paddingVertical: 15,
            paddingHorizontal: 15,
            backgroundColor: 'transparent',
          },
        }}>
        <View style={styles.RBSheetParentStyleTwo}>
          <View style={styles.RBSheetheaderStyleTwo}>
            <Text style={styles.RBSheetHeaderTextStyle}>
              {constant.postTaskNewTaskAddon}
            </Text>
            <Feather
              onPress={() => RBSheetTaskAddOn.current.close()}
              style={styles.RBSheetCloseIconStyle}
              name={'x'}
              size={20}
              color={'#1C1C1C'}
            />
          </View>

          <ScrollView
            style={{paddingHorizontal: 20, paddingVertical: 10}}
            showsVerticalScrollIndicator={false}>
            <Text style={[styles.postProjectHeading, {fontSize: 16}]}>
              {constant.postTaskAddAddonTitle}
            </Text>
            <FormInput
              labelValue={addOnsTitle}
              onChangeText={text => setAddOnsTitle(text)}
              placeholderText={constant.postTaskAddTitle}
              autoCorrect={false}
            />
            <Text style={[styles.postProjectHeading, {fontSize: 16}]}>
              {constant.postTaskAddAddonPrice}
            </Text>
            <FormInput
              labelValue={addOnsPrice}
              onChangeText={text => setAddOnsPrice(text)}
              placeholderText={constant.postTaskAddPrice}
              autoCorrect={false}
              inputType={'number-pad'}
            />
            <Text style={[styles.postProjectHeading, {fontSize: 16}]}>
              {constant.postTaskAddAddonDescription}
            </Text>
            <View style={{height: 100, marginVertical: 10, width: '100%'}}>
              <View style={[styles.MultiLineTextFieldView, {padding: 0}]}>
                <TextInput
                  style={[
                    styles.MultiLineTextField,
                    {
                      color: CONSTANT.fontColor,
                      fontFamily: 'Urbanist-SemiBold',
                    },
                  ]}
                  value={addOnDescription}
                  onChangeText={body => setAddOnDescription(body)}
                  placeholder={constant.postTaskDescription}
                  placeholderTextColor="#888888"
                  multiline={true}
                  underlineColorAndroid="transparent"
                />
              </View>
            </View>
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
            <View style={{marginBottom: 15}}>
              <FormButton
                onPress={() => saveUpdateAddOn()}
                buttonTitle={constant.Save}
                loader={loading}
                backgroundColor={CONSTANT.primaryColor}
                textColor={'#fff'}
              />
            </View>
          </ScrollView>
        </View>
      </RBSheet>
    </ScrollView>
  );
};

export default PostTaskStepTwo;
