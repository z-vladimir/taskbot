import {
  View,
  Text,
  TextInput,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import Feather from 'react-native-vector-icons/Feather';
import FormButton from '../../components/FormButton';
import * as CONSTANT from '../../constants/globalConstants';
import {decode} from 'html-entities';
import MultiSelect from 'react-native-multiple-select';
import axios from 'axios';
import DocumentPicker from 'react-native-document-picker';
import constant from '../../constants/translation';
import styles from '../../style/styles.js';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {useSelector, useDispatch} from 'react-redux';
import {updateStep, updatePostedItemOne} from '../../Redux/PostProjectSlice';
import FormInput from '../../components/FormInput';

const PostProjectStepOne = ({stepHandel}) => {
  const token = useSelector(state => state.value.token);
  const userDetail = useSelector(state => state.value.userInfo);
  const categoriesTaxonomy = useSelector(
    state => state.setting.categoriesTaxonomy,
  );
  const postedItemOne = useSelector(state => state.postedProject.postedItemOne);
  const step = useSelector(state => state.postedProject.step);
  const durationTaxonomy = useSelector(state => state.setting.durationTaxonomy);
  const settings = useSelector(state => state.setting.settings);
  const countriesTaxonomy = useSelector(
    state => state.setting.countriesTaxonomy,
  );
  const dispatch = useDispatch();

  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [zipcode, setZipcode] = useState('');
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [show, setShow] = useState(false);

  const [selectedDuration, setSelectedDuration] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [documents, setDocuments] = useState([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [comment, setComment] = useState('');
  const [refreshList, setRefreshList] = useState(false);
  const [loader, setLoader] = useState(false);
  const [enableMileston, setEnableMileston] = useState(false);
  const [selectedType, setSelectedType] = useState('fixed');
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
    if (Object.keys(postedItemOne).length != 0) {
      setTitle(postedItemOne.title);
      setSelectedType(postedItemOne.project_type);
      setEnableMileston(postedItemOne.is_milestone == 'yes' ? true : false);
      setMinBudget(postedItemOne.min_price);
      setMaxBudget(postedItemOne.max_price);
      setSelectedDuration([parseInt(postedItemOne.duration)]);
      setSelectedCategory([parseInt(postedItemOne.categories)]);
      setSelectedLocation([postedItemOne.location]);
      setComment(postedItemOne.details);
      setDocuments(postedItemOne.attachments);
      setVideoUrl(postedItemOne.video_url);
      setZipcode(postedItemOne.zipcode);
      setSelectedCountry([postedItemOne.country]);
    }
  }, []);

  const toggleSwitch = () => {
    setEnableMileston(previousState => !previousState);
  };
  const selectedProjectType = val => {
    setSelectedType(val);
  };
  const pickDocumentfromDevice = async () => {
    try {
      const res = await DocumentPicker.pickMultiple({
        type: [DocumentPicker.types.allFiles],
        allowMultiSelection: true,
      });
      let docs = JSON.parse(JSON.stringify(documents));
      for (var i = 0; i < res.length; i++) {
        docs.push(res[i]);
      }
      setRefreshList(!refreshList);
      setDocuments(docs);
      console.log('docArray', res);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker, exit any dialogs or menus and move on
      } else {
        throw err;
      }
    }
  };
  const deleteAttachment = index => {
    let docs = JSON.parse(JSON.stringify(documents));
    docs.splice(index, 1);
    setDocuments(docs);
    setRefreshList(!refreshList);
  };
  const saveAndContinue = () => {
    setLoader(true);
    let finalDcouments = [];
    let oldAttachments = [];
    for (var i = 0; i < documents.length; i++) {
      if(documents[i].hasOwnProperty("download_id"))
      {
        oldAttachments.push(documents[i])
      }
      else
      {
        finalDcouments.push({
          uri: documents[i].uri,
          type: documents[i].type,
          name: documents[i].name,
        });
      }
    }
    const formData = new FormData();
    formData.append('post_id', userDetail.profile_id);
    formData.append('user_id', userDetail.user_id);
    formData.append(
      'project_id',
      Object.keys(postedItemOne).length != 0 ? postedItemOne.ID : null,
    );
    formData.append('step_id', 2);
    formData.append('title', title);
    formData.append('project_type', 'fixed');
    formData.append('min_price', minBudget);
    formData.append('max_price', maxBudget);
    formData.append('duration', selectedDuration.toString());
    formData.append('categories', selectedCategory.toString());
    formData.append('video_url', videoUrl);
    formData.append('details', comment);
    formData.append('location', selectedLocation.toString());
    formData.append('zipcode', zipcode);
    formData.append('country', selectedCountry.toString());
    formData.append('is_milestone', enableMileston ? 'yes' : '');
    formData.append('attachments', oldAttachments);
    if (finalDcouments.length != 0) {
      finalDcouments.forEach((item, i) => {
        formData.append('project_image_' + i, {
          uri: item.uri,
          type: item.type,
          name: item.name,
        });
      });
      formData.append('attachment_size', finalDcouments.length);
    }
    // axios
    //   .post(
    //     CONSTANT.BaseUrl + 'update-job',
    //     {
    //       post_id: userDetail.profile_id,
    //       user_id: userDetail.user_id,
    //       project_id:
    //         Object.keys(postedItemOne).length != 0 ? postedItemOne.ID : null,
    //       step_id: 2,
    //       title: title,
    //       project_type: 'fixed',
    //       min_price: minBudget,
    //       max_price: maxBudget,
    //       duration: selectedDuration.toString(),
    //       categories: selectedCategory.toString(),
    //       video_url: videoUrl,
    //       details: comment,
    //       location: selectedLocation.toString(),
    //       zipcode: zipcode,
    //       country: selectedCountry.toString(),
    //       is_milestone: enableMileston ? 'yes' : '',
    //       attachments: JSON.stringify(finalDcouments),
    //     },
    //     {
    //       headers: {
    //         Authorization: 'Bearer ' + token,
    //       },
    //     },
    //   )
    fetch(CONSTANT.BaseUrl + 'update-job', {
      method: 'post',
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: 'Bearer ' + token,
      },
      body: formData,
    })
      .then(response => response.json())
      .then(async response => {
        setLoader(false);
        if (response.type == 'success') {
          let obj = {
            ID: response.post_id,
            title: title,
            project_type: 'fixed',
            min_price: minBudget,
            max_price: maxBudget,
            duration: selectedDuration.toString(),
            categories: selectedCategory.toString(),
            video_url: videoUrl,
            location: selectedLocation.toString(),
            zipcode: zipcode,
            country: selectedCountry.toString(),
            is_milestone: enableMileston ? 'yes' : '',
            details: comment,
            attachments: documents,
          };

          dispatch(updatePostedItemOne(obj));
          console.log('object', obj);
          dispatch(updateStep(1));
        } else if (response.type == 'error') {
          Alert.alert('Oops', response.message_desc);
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
          {constant.postProjectTellAboutProject}
        </Text>
        <Text style={[styles.postProjectHeading, {paddingTop: 20}]}>
          {constant.postProjectAddProjectTitle}
        </Text>
        <FormInput
          labelValue={title}
          onChangeText={text => setTitle(text)}
          placeholderText={constant.postProjectEnterProjectTitle}
          autoCorrect={false}
        />
        <Text style={[styles.postProjectHeading, {paddingTop: 20}]}>
          {constant.postProjectSelectProjectType}
        </Text>
        {/* <TouchableOpacity
          onPress={() => selectedProjectType('hourly')}
          style={[
            styles.sendProposalMileStoneConatiner,
            {
              borderColor: selectedType == 'hourly' ? '#22C55E' : '#DDDDDD',
              overflow: 'hidden',
              borderWidth: 1,
              paddingVertical: 0,
              marginVertical: 10,
            },
          ]}>
          {selectedType == 'hourly' && (
            <View style={styles.sendProposalChecke}>
              <FontAwesome name="check" type="check" color={'#fff'} size={14} />
            </View>
          )}

          <View style={styles.postProjectSelect}>
            <View style={styles.myProjectDetailsEarnigsViewIcon}>
              <Feather name={'clock'} size={20} color={'#6366F1'} />
            </View>
            <View style={styles.myProjectDetailsEarnigsViewDetails}>
              <Text style={styles.myProjectDetailsEarnigsAmount}>
                Hourly project
              </Text>
              <Text style={styles.myProjectDetailsEarnigsTitle}>
                Pay each freelancer on hourly rate
              </Text>
            </View>
          </View>
        </TouchableOpacity> */}
        <TouchableOpacity
          onPress={() => selectedProjectType('fixed')}
          style={[
            styles.sendProposalMileStoneConatiner,
            {
              borderColor: selectedType == 'fixed' ? '#22C55E' : '#DDDDDD',
              overflow: 'hidden',
              borderWidth: 1,
              paddingVertical: 0,
              marginVertical: 10,
            },
          ]}>
          {selectedType == 'fixed' && (
            <View style={styles.sendProposalChecke}>
              <FontAwesome name="check" type="check" color={'#fff'} size={14} />
            </View>
          )}

          <View style={styles.postProjectSelect}>
            <View
              style={[
                styles.myProjectDetailsEarnigsViewIcon,
                {backgroundColor: '#EF444420'},
              ]}>
              <Feather name={'bookmark'} size={20} color={'#EF4444'} />
            </View>
            <View style={[styles.myProjectDetailsEarnigsViewDetails]}>
              <Text style={styles.myProjectDetailsEarnigsAmount}>
                {constant.postProjectFixedPriceProject}
              </Text>
              <Text style={styles.myProjectDetailsEarnigsTitle}>
                {constant.postProjectPayFixedMilestoneRate}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
        {selectedType == 'fixed' && (
          <View
            style={[
              styles.myProjectDetailsLockedView,
              {
                paddingVertical: 10,
                alignItems: 'flex-start',
                overflow: 'hidden',
                borderRadius: 20,
              },
            ]}>
            <View style={styles.postProjectVerionView}>
              <Text style={styles.postProjectVerionText}>
                {constant.postProjectBetaVersion}
              </Text>
            </View>
            <View style={{alignItems: 'center'}}>
              <View
                style={{
                  backgroundColor: '#ffff',
                  height: 80,
                  width: 80,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 80 / 2,
                  marginTop: 10,
                }}>
                <Image
                  resizeMode="contain"
                  style={styles.lockedimg}
                  source={require('../../../assets/images/pdf.png')}
                />
              </View>

              <Text style={styles.myProjectDetailsLockedHeading}>
                {constant.postProjectSplitProjectMilestones}
              </Text>
              <Text style={styles.myProjectDetailsLockedText}>
                {constant.postProjectSplitProjectMilestonesDesc}
              </Text>
            </View>
            <View style={styles.postProjectEnableView}>
              <Text style={styles.postProjectEnableText}>
                {constant.postProjectEnable}
              </Text>

              <Switch
                style={{
                  transform: [{scaleX: 0.8}, {scaleY: 0.8}],
                }}
                trackColor={{false: '#DDDDDD', true: '#22C55E'}}
                thumbColor={'#fff'}
                ios_backgroundColor={'#FFFFFF'}
                onValueChange={toggleSwitch}
                value={enableMileston}
              />
            </View>
          </View>
        )}
        {selectedType == 'fixed' && (
          <View>
            <>
              <Text style={[styles.postProjectHeading, {paddingTop: 20}]}>
                {constant.postProjectMinFixedBudget}
              </Text>

              <FormInput
                labelValue={minBudget}
                onChangeText={text => setMinBudget(text)}
                placeholderText={constant.postProjectEnterMinPrice}
                autoCorrect={false}
                inputType={'number-pad'}
              />
            </>
            <>
              <Text style={[styles.postProjectHeading, {paddingTop: 20}]}>
                {constant.postProjectMaxFixedBudget}
              </Text>
              <FormInput
                labelValue={maxBudget}
                onChangeText={text => setMaxBudget(text)}
                placeholderText={constant.postProjectEnterMaxPrice}
                autoCorrect={false}
                inputType={'number-pad'}
              />
            </>
          </View>
        )}
        {selectedType == 'hourly' && (
          <View>
            <>
              <Text style={[styles.postProjectHeading, {paddingTop: 20}]}>
                {constant.postProjectAddProjectTitle}
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
                  placeholder={constant.postProjectPaymentMode}
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
                {constant.postProjectWeeklyRequiredHours}
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
                  placeholder={constant.postProjectEnterHoursHere}
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
                {constant.postProjectMinHourlyRate}
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
                  placeholder={constant.postProjectEnterMinPrice}
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
                {constant.postProjectMaxHourlyRate}
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
                  placeholder={constant.postProjectEnterMaxPrice}
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

        <Text style={[styles.postProjectHeading, {paddingTop: 20}]}>
          {constant.postProjectProjectDuration}
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
            onSelectedItemsChange={value => setSelectedDuration(value)}
            uniqueKey="term_id"
            items={durationTaxonomy}
            selectedItems={selectedDuration}
            borderBottomWidth={0}
            single={true}
            searchInputPlaceholderText={
              constant.postProjectSelectProjectDuration
            }
            selectText={constant.postProjectSelectProjectDuration}
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
          {constant.postProjectCategory}
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
            onSelectedItemsChange={value => setSelectedCategory(value)}
            uniqueKey="id"
            items={categories}
            selectedItems={selectedCategory}
            borderBottomWidth={0}
            single={true}
            searchInputPlaceholderText={constant.postProjectSelectDuration}
            selectText={constant.postProjectSelectDuration}
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
        <>
          <Text style={[styles.postProjectHeading, {paddingTop: 20}]}>
            {constant.postProjectAddLocation}
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
              onSelectedItemsChange={value => setSelectedLocation(value)}
              uniqueKey="slug"
              items={loactions}
              selectedItems={selectedLocation}
              borderBottomWidth={0}
              single={true}
              searchInputPlaceholderText={constant.postProjectSelectLocation}
              selectText={constant.postProjectSelectLocation}
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
        {selectedLocation == 'location' && (
          <>
            <Text style={[styles.postProjectHeading, {paddingTop: 20}]}>
              {constant.postProjectCountry}
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
                searchInputPlaceholderText={constant.postProjectChooseCountry}
                selectText={constant.postProjectChooseCountry}
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
              {constant.postProjectZipcode}
            </Text>
            <FormInput
              labelValue={zipcode}
              onChangeText={text => setZipcode(text)}
              placeholderText={constant.postProjectZipcode}
              autoCorrect={false}
            />
          </>
        )}

        <>
          <View style={styles.disputeDetailsAddReply}>
            <Text style={[styles.postProjectHeading, {paddingTop: 10}]}>
              {constant.postProjectAddDescription}
            </Text>
            <View style={styles.MultiLineTextFieldView}>
              <TextInput
                style={styles.sendProjectMultiLineTextField}
                value={comment}
                onChangeText={body => setComment(body)}
                placeholder={constant.postProjectEnterDetailsHere}
                placeholderTextColor="#888888"
                multiline={true}
                underlineColorAndroid="transparent"
              />
            </View>
          </View>
        </>
      </View>

      <>
        <View
          style={{borderColor: '#DDDDDD', borderWidth: 0.5, marginTop: 35}}
        />
        <View style={styles.myProjectDetailsTimeCardProjectActivity}>
          <View style={styles.myProjectDetailsTimeCardActivityView}>
            <View
              style={{justifyContent: 'center', alignItems: 'center'}}></View>

            <Text
              style={[
                styles.myProjectDetailsTimeCardActivityTitle,
                {paddingHorizontal: 0},
              ]}>
              {constant.postProjectAddMediaAttachments}
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
          <>
            <View>
              <View
                style={[
                  {
                    marginHorizontal: 15,
                    paddingVertical: 10,
                    marginVertical: 10,
                  },
                ]}>
                <Text
                  style={[
                    styles.myProjectDetailsTimeCardHeading,
                    {paddingTop: 0},
                  ]}>
                  {constant.postProjectDescriptiveVideo}
                </Text>
                <FormInput
                  labelValue={videoUrl}
                  onChangeText={text => setVideoUrl(text)}
                  placeholderText={constant.postProjectEnterVideoLinkHere}
                  autoCorrect={false}
                />
                <Text style={styles.myProjectDetailsTimeCardHeading}>
                  {constant.postProjectUploadAttachments}
                </Text>
                <FlatList
                  data={documents}
                  keyExtractor={(x, i) => i.toString()}
                  renderItem={({item, index}) => (
                    <View style={styles.sendProposalResumeImgView}>
                      <Text style={styles.sendProposalResumeImgText}>
                        {item.name}
                      </Text>
                      <TouchableOpacity
                        onPress={() => deleteAttachment(index)}
                        activeOpacity={0.1}>
                        <Feather name={'trash-2'} size={22} color={'#EF4444'} />
                      </TouchableOpacity>
                    </View>
                  )}
                />

                <View style={{marginVertical: 10}}>
                  <Text style={styles.myProjectDetailsProjectDownlodeInfo}>
                    {constant.postProjectUploadDesc}
                  </Text>
                  <TouchableOpacity onPress={() => pickDocumentfromDevice()}>
                    <Text style={styles.sendProposalResumeUplodeText}>
                      {constant.postProjectClickUpload}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </>
        )}
        <FormButton
          buttonTitle={constant.SaveCont}
          backgroundColor={CONSTANT.primaryColor}
          textColor={'#FFFFFF'}
          onPress={() => saveAndContinue()}
          loader={loader}
        />
      </>
    </ScrollView>
  );
};

export default PostProjectStepOne;
