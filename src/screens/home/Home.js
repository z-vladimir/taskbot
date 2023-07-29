import {
  View,
  Text,
  TextInput,
  StatusBar,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  I18nManager,
  Appearance,
  NativeModules,
  Dimensions,
} from 'react-native';
import React, {useEffect, useState, useRef} from 'react';
import styles from '../../style/styles';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FormButton from '../../components/FormButton';
import {useSelector, useDispatch} from 'react-redux';
import {useIsFocused} from '@react-navigation/native';
import RNRestart from 'react-native-restart';
import FreelancerCard from './homeCards/freelancerCard';
import TaskCard from './homeCards/taskCard';
import CategoryCard from './homeCards/categoryCard';
import SelectonCategoryCard from './homeCards/SkelectonCategoryCard';
import SkeletonFreelancerCard from './homeCards/SkeletonFreelancerCard';
import SkeletonTaskCard from './homeCards/SkeletonTaskCard';
import Spinner from 'react-native-loading-spinner-overlay';
import Header from '../../components/Header';
import FormInput from '../../components/FormInput';
import * as CONSTANT from '../../constants/globalConstants';
import RBSheet from 'react-native-raw-bottom-sheet';
import {decode} from 'html-entities';
import {
  updateSavedSellers,
  updateSavedTasks,
  updateSavedProjects,
} from '../../Redux/SavedSlice';
import {updateVerified, updateWallet} from '../../Redux/AuthSlice';
import {
  updateLanguage,
  updateSetting,
  updateDurationTaxonomy,
  updateCategoriesTaxonomy,
  updateCountriesTaxonomy,
  updateSkillsTaxonomy,
  updateLanguagesTaxonomy,
  updateExpertiseTaxonomy,
  updateDeliveryTaxonomy,
  updateTagsTaxonomy,
} from '../../Redux/SettingSlice';
import constant from '../../constants/translation';
import ProjectListingCard from '../exploreProjects/projectListingCard';

const Home = ({navigation, route}) => {
  const userDetail = useSelector(state => state.value.userInfo);
  const settings = useSelector(state => state.setting.settings);
  const token = useSelector(state => state.value.token);
  const dispatch = useDispatch();
  const isFocused = useIsFocused();

  const [text, setText] = useState('');
  const [categories, setCategories] = useState([]);
  const [searchCategories, setSearchCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState('');
  const [selectedCategoriesSlug, setSelectedCategoriesSlug] = useState('');
  const [freelancers, setFreelancers] = useState([]);
  const [tasks, setTasks] = useState([]);
  // const [savedSellers, setSavedSellers] = useState([]);
  // const [savedTasks, setSavedTasks] = useState([]);
  const [categoriesSpinner, setCategoriesSpinner] = useState(true);
  const [hideCategory, setHideCategory] = useState(false);
  const [loader, setLoader] = useState(false);
  const [hideFreelancer, setHideFreelancer] = useState(false);
  const [hideTaskCard, setHideTaskCard] = useState(false);
  const [freelancerSpinner, setFreelancerSpinner] = useState(true);
  const [taskCardSpinner, setTaskCardSpinner] = useState(true);
  const [projectsListing, setProjectsListing] = useState([]);
  const rbSheet = useRef();

  useEffect(() => {
    const colorScheme = Appearance.getColorScheme();
    getCategories();
    getFreelancers();
    getSettings();
    getTasks();
    getProjects();
  }, []);
  useEffect(() => {
    if (isFocused) {
      getsavedItems('sellers');
      getsavedItems('tasks');
      getsavedItems('projects');
      getVerification();
      userBalance();
      setSelectedCategories('');
      setText('');
      getSettings();
      getDurationTaxonomy();
      getDeliveryTaxonomy();
      getCountryTaxonomy();
      getSkillsTaxonomy();
      getCategories();
      getLanguagesTaxonomy();
      getExpertiseTaxonomy();
      getTagsTaxonomy();
    }
  }, [isFocused]);

  const userBalance = () => {
    fetch(CONSTANT.BaseUrl + 'user-balance?post_id=' + userDetail.profile_id, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
    })
      .then(response => response.json())
      .then(responseJson => {
        if (responseJson.type == 'success') {
          dispatch(updateWallet(responseJson.user_balance_formate));
        }
      })
      .catch(error => {
        console.error(error);
      });
  };
  const getSettings = async () => {
    return fetch(CONSTANT.BaseUrl + 'settings/get_settings', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
      .then(response => response.json())
      .then(responseJson => {
        dispatch(updateSetting(responseJson));
      })
      .catch(error => {
        console.error(error);
      });
  };
  const getDurationTaxonomy = () => {
    fetch(
      CONSTANT.BaseUrl +
        'settings/get_options?type=taxonomy&taxonomy_name=duration',
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
        dispatch(updateDurationTaxonomy(responseJson));
      })
      .catch(error => {
        console.error(error);
      });
  };
  const getDeliveryTaxonomy = () => {
    fetch(
      CONSTANT.BaseUrl +
        'settings/get_options?type=taxonomy&taxonomy_name=delivery_time',
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
        dispatch(updateDeliveryTaxonomy(responseJson));
      })
      .catch(error => {
        console.error(error);
      });
  };
  const getTagsTaxonomy = () => {
    fetch(CONSTANT.BaseUrl + 'get-all-tags', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
      .then(response => response.json())
      .then(responseJson => {
        dispatch(updateTagsTaxonomy(responseJson));
      })
      .catch(error => {
        console.error(error);
      });
  };
  const getSkillsTaxonomy = () => {
    fetch(
      CONSTANT.BaseUrl +
        'settings/get_options?type=taxonomy&taxonomy_name=skills',
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
        dispatch(updateSkillsTaxonomy(responseJson));
      })
      .catch(error => {
        console.error(error);
      });
  };
  const getCountryTaxonomy = () => {
    fetch(CONSTANT.BaseUrl + 'settings/get_options?type=country', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
      .then(response => response.json())
      .then(responseJson => {
        {
          let countries = [];
          Object.entries(responseJson).map(([key, value]) =>
            countries.push({
              slug: key,
              name: value,
            }),
          );
          dispatch(updateCountriesTaxonomy(countries));
        }
      })
      .catch(error => {
        console.error(error);
      });
  };
  const getLanguagesTaxonomy = () => {
    fetch(
      CONSTANT.BaseUrl +
        'settings/get_options?type=taxonomy&taxonomy_name=languages',
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
        dispatch(updateLanguagesTaxonomy(responseJson));
      })
      .catch(error => {
        console.error(error);
      });
  };
  const getExpertiseTaxonomy = () => {
    fetch(
      CONSTANT.BaseUrl +
        'settings/get_options?type=taxonomy&taxonomy_name=expertise_level',
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
        dispatch(updateExpertiseTaxonomy(responseJson));
      })
      .catch(error => {
        console.error(error);
      });
  };
  const getVerification = () => {
    // setLoader(true);
    fetch(
      CONSTANT.BaseUrl + 'get-verification?post_id=' + userDetail.profile_id,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
      },
    )
      .then(response => response.json())
      .then(responseJson => {
        if (responseJson.type == 'success') {
          if (responseJson.verification_attachments.length != 0) {
            dispatch(updateVerified('2'));
          } else {
            dispatch(updateVerified(responseJson.identity_verified));
          }
        }
        // setLoader(false);
      })
      .catch(error => {
        // setLoader(false);
        console.error(error);
      });
  };
  const getsavedItems = async type => {
    var savedSellers = [];
    var savedTasks = [];
    var savedProjects = [];
    savedSellers.length = 0;
    savedTasks.length = 0;
    savedProjects.length = 0;
    return fetch(
      CONSTANT.BaseUrl +
        'get-saved-items?post_id=' +
        userDetail.profile_id +
        '&type=' +
        type,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
      },
    )
      .then(response => response.json())
      .then(responseJson => {
        setLoader(false);
        if (type == 'sellers') {
          Object.entries(responseJson.items).map(([key, value]) =>
            savedSellers.push({
              slug: key,
              id: value,
            }),
          );
          dispatch(updateSavedSellers(savedSellers));
        } else if (type == 'tasks') {
          Object.entries(responseJson.items).map(([key, value]) =>
            savedTasks.push({
              slug: key,
              id: value,
            }),
          );
          dispatch(updateSavedTasks(savedTasks));
        } else {
          Object.entries(responseJson.items).map(([key, value]) =>
            savedProjects.push({
              // slug: key,
              id: value,
            }),
          );
          dispatch(updateSavedProjects(savedProjects));
        }
      })
      .catch(error => {
        setLoader(false);
        console.error(error);
      });
  };

  const getCategories = async () => {
    return fetch(
      CONSTANT.BaseUrl +
        'settings/get_options?type=taxonomy&taxonomy_name=product_cat',
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
        if (responseJson.length == 0) {
          setHideCategory(true);
        } else {
          let array = [];
          for (var i = 0; i < responseJson.length; i++) {
            if (settings.hide_product_cat != '') {
              for (var j = 0; j < settings.hide_product_cat.length; j++) {
                if (responseJson[i].term_id != settings.hide_product_cat[j]) {
                  array.push(responseJson[i]);
                }
              }
            } else {
              array = responseJson;
            }
          }
          setCategories(array);
          setSearchCategories(array);
          dispatch(updateCategoriesTaxonomy(array));
          setCategoriesSpinner(false);
        }
      })
      .catch(error => {
        console.error(error);
      });
  };
  const getFreelancers = async () => {
    return fetch(
      CONSTANT.BaseUrl + 'sellers/get_sellers?type=verified&show_posts=5',
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
        if (responseJson.length == 0) {
          setHideFreelancer(true);
        } else {
          setFreelancers(responseJson);
          setFreelancerSpinner(false);
        }
      })
      .catch(error => {
        console.error(error);
      });
  };

  const getTasks = async () => {
    return fetch(
      CONSTANT.BaseUrl + 'get_tasks?type=top_rated&show_posts=20',
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
        if (responseJson.tasks.length == 0) {
          setHideTaskCard(true);
        } else {
          setTasks(responseJson.tasks);
          setTaskCardSpinner(false);
        }
      })
      .catch(error => {
        console.error(error);
      });
  };
  const getProjects = async () => {
    setLoader(true);
    return fetch(
      CONSTANT.BaseUrl + 'projects/get_projects?type=search&show_posts=10',
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
        setLoader(false);

        setProjectsListing(responseJson.projects);
      })
      .catch(error => {
        setLoader(false);
        console.error(error);
      });
  };
  const handelSelectedCategory = value => {
    setSelectedCategories(decode(value.name));
    setSelectedCategoriesSlug(value.slug);
    rbSheet.current.close();
  };

  const handelSearchItem = text => {
    const formattedQuery = text.toLowerCase();
    const newData = categories.filter(item => {
      return item.name.toLowerCase().includes(formattedQuery);
    });

    setSearchCategories(newData);
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
      {/* <StatusBar
        backgroundColor="#0A0F26"
        barStyle="light-content"
      /> */}
      <Header
        title={constant.homeTitle}
        titleColor={'#FFFFFF'}
        backColor={'#0A0F26'}
        iconColor={'#FFFFFF'}
      />
      {loader && <Spinner visible={true} color={'#000'} />}
      <ScrollView
        contentContainerStyle={{width: '100%'}}
        showsVerticalScrollIndicator={false}>
        <View style={styles.homeTextContainer}>
          <Text style={styles.homeTextStyle}>
            {constant.homeWorkTogether} {'\n'}
            <Text style={styles.homeTextStyleTwo}>
              {constant.homeOpportunities}
            </Text>
          </Text>
          <View style={styles.homeSearchParentInputStyle}>
            <Feather
              style={styles.homeSearchIconStyle}
              name={'search'}
              size={20}
              color={'#999999'}
            />
            <TextInput
              style={styles.homeSearchInputStyle}
              placeholderTextColor={'#999999'}
              onChangeText={text => setText(text)}
              value={text}
              placeholder={constant.homeLookingFor}
            />
          </View>
          <TouchableOpacity
            activeOpacity={0.5}
            style={styles.homeSearchCateogryParentStyle}
            onPress={() => rbSheet.current.open()}>
            <Feather
              style={styles.homeSearchIconStyle}
              name={'layers'}
              size={20}
              color={'#999999'}
            />

            {selectedCategories == '' ? (
              <Text style={styles.homeSearchCateogryTextStyle}>
                {constant.homeSelectCategory}
              </Text>
            ) : (
              <Text style={styles.homeSearchSelectedCateogryText}>
                {selectedCategories}
              </Text>
            )}

            <Feather
              style={styles.homeSearchIconStyle}
              name={I18nManager.isRTL ? 'chevron-left' : 'chevron-right'}
              size={20}
              color={'#999999'}
            />
          </TouchableOpacity>
          <View style={{marginVertical: 10}}>
            <FormButton
              buttonTitle={constant.homeSearch}
              backgroundColor={CONSTANT.primaryColor}
              textColor={'#fff'}
              onPress={() =>
                // navigation.navigate('searchResult', {
                //   text: text,
                //   location: '',
                //   sellerType: [],
                //   englishLevel: [],
                //   sellerType: selectedCategoriesSlug,
                // })
               
                navigation.navigate('searchResultTask', {
                  text: text,
                  min: 1,
                  max: 1000,
                  location: '',
                  category: selectedCategoriesSlug,
                  sub_category: [],
                  services: [],
                })
              }
            />
          </View>
        </View>

        {!hideCategory && (
          <>
            <View style={styles.homeCatParentStyle}>
              <Text style={styles.homeCatHeadingTextStyle}>
                {constant.homeExploreCategories}
              </Text>
              {/* <Text
                style={[styles.homeCatExploreTextStyle, {color: '#1DA1F2'}]}>
                Explore all
              </Text> */}
            </View>
            {categoriesSpinner ? (
              <View style={{flexDirection: 'row', padding: 10}}>
                <SelectonCategoryCard />
                <SelectonCategoryCard />
                <SelectonCategoryCard />
                <SelectonCategoryCard />
              </View>
            ) : (
              <View style={{flexDirection: 'row', padding: 10}}>
                <FlatList
                  showsHorizontalScrollIndicator={false}
                  horizontal={true}
                  data={categories}
                  keyExtractor={(x, i) => i.toString()}
                  renderItem={({item, index}) => (
                    <TouchableOpacity activeOpacity={0.9}>
                      {item.parent == 0 && <CategoryCard item={item} />}
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}

            <View style={styles.homeFreelancerUnderLine} />
          </>
        )}
        {!hideFreelancer && (
          <>
            <View
              style={{
                padding: 10,
              }}>
              <Text style={styles.homeCatHeadingTextStyle}>
                {constant.homeVerifiedFreelancers}
              </Text>
            </View>
            {freelancerSpinner ? (
              <>
                <SkeletonFreelancerCard />
                <SkeletonFreelancerCard />
                <SkeletonFreelancerCard />
                <SkeletonFreelancerCard />
              </>
            ) : (
              <>
                <FlatList
                  scrollEnabled={false}
                  data={freelancers}
                  ListFooterComponent={
                    <View style={{margin: 10}}>
                      <FormButton
                        buttonTitle={constant.homeExploreFreelancers}
                        backgroundColor={'#F7F7F7'}
                        textColor={'#1C1C1C'}
                        iconName={'arrow-right'}
                        onPress={() =>
                          navigation.navigate('searchResult', {
                            text: '',
                            location: '',
                            sellerType: [],
                            englishLevel: [],
                          })
                        }
                      />
                    </View>
                  }
                  keyExtractor={(x, i) => i.toString()}
                  renderItem={({item, index}) => (
                    <TouchableOpacity activeOpacity={0.1}>
                      <FreelancerCard item={item} />
                    </TouchableOpacity>
                  )}
                />
              </>
            )}
          </>
        )}
        {!hideTaskCard && (
          <>
            <View
              style={{
                padding: 10,
              }}>
              <Text style={styles.homeCatHeadingTextStyle}>
                {constant.homePostedTasks}
              </Text>
            </View>
            <View style={{flexDirection: 'row'}}>
              {taskCardSpinner ? (
                <>
                  <SkeletonTaskCard widthval={190} mainWidth={190} />
                  <SkeletonTaskCard widthval={190} mainWidth={190} />
                  <SkeletonTaskCard widthval={190} mainWidth={190} />
                  <SkeletonTaskCard widthval={190} mainWidth={190} />
                  <SkeletonTaskCard widthval={190} mainWidth={190} />
                  <SkeletonTaskCard widthval={190} mainWidth={190} />
                </>
              ) : (
                <>
                  <FlatList
                    showsHorizontalScrollIndicator={false}
                    horizontal={true}
                    data={tasks}
                    keyExtractor={(x, i) => i.toString()}
                    renderItem={({item, index}) => (
                      <TouchableOpacity activeOpacity={0.9}>
                        <TaskCard
                          imageWidth={160}
                          widthValue={160}
                          item={item}
                        />
                      </TouchableOpacity>
                    )}
                  />
                </>
              )}
            </View>
            <View style={{margin: 10}}>
              <FormButton
                buttonTitle={constant.homeExploreAll}
                backgroundColor={'#F7F7F7'}
                textColor={'#1C1C1C'}
                iconName={'arrow-right'}
                onPress={() =>
                  navigation.navigate('searchResultTask', {
                    text: '',
                    location: '',
                    category: '',
                    sub_category: '',
                    services: [],
                    max: '',
                    min: '',
                  })
                }
              />
            </View>
          </>
        )}
        {
          <>
            <View
              style={{
                padding: 10,
              }}>
              <Text style={styles.homeCatHeadingTextStyle}>
                {constant.homePostedProjects}
              </Text>
            </View>
            <View style={{flexDirection: 'row'}}>
              <>
                <FlatList
                  showsHorizontalScrollIndicator={false}
                  horizontal={true}
                  data={projectsListing}
                  keyExtractor={(x, i) => i.toString()}
                  renderItem={({item, index}) => (
                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={() =>
                        navigation.navigate('projectDetails', {
                          item: item,
                        })
                      }>
                      <ProjectListingCard
                        item={item}
                        widthValue={300}
                        showMoreDetails={false}
                        showSkills={false}
                      />
                    </TouchableOpacity>
                  )}
                />
              </>
            </View>
            <View>
              <FormButton
                buttonTitle={constant.homeExploreAllProjects}
                backgroundColor={'#F7F7F7'}
                textColor={'#1C1C1C'}
                iconName={'arrow-right'}
                onPress={() =>
                  navigation.navigate('projectListing', {
                    showSkills: true,
                    showMoreDetails: true,
                  })
                }
              />
            </View>
          </>
        }
      </ScrollView>
      <RBSheet
        ref={rbSheet}
        height={Dimensions.get('window').height * 0.75}
        duration={250}
        customStyles={{
          container: {
            paddingLeft: 15,
            paddingRight: 15,
            backgroundColor: 'transparent',
          },
        }}>
        <View style={styles.RBSheetParentStyle}>
          <View style={styles.RBSheetheaderStyle}>
            <Feather
              onPress={() => rbSheet.current.close()}
              style={styles.RBSheetCloseIconStyle}
              name={I18nManager.isRTL ? 'arrow-right' : 'arrow-left'}
              size={20}
              color={'#1C1C1C'}
            />
            <Text style={styles.RBSheetHeaderTextStyle}>
              {constant.homeSelectCategory}
            </Text>
          </View>
          <TouchableOpacity style={styles.homeRBSheetSearchStyle}>
            <Feather
              style={{textAlign: 'center'}}
              name={'search'}
              size={20}
              color={'#999999'}
            />
            <TextInput
              style={styles.homeRBSheetSearchTextStyle}
              placeholderTextColor={'#999999'}
              onChangeText={handelSearchItem}
              placeholder={constant.homeSearchCategory}
            />
          </TouchableOpacity>
          <FlatList
            style={{marginHorizontal: 30}}
            showsVerticalScrollIndicator={true}
            data={searchCategories}
            keyExtractor={(x, i) => i.toString()}
            renderItem={({item, index}) => {
              return (
                <TouchableOpacity activeOpacity={0.3}>
                  {item.parent == 0 && (
                    <Text
                      style={styles.homeRBSheetListTextStyle}
                      onPress={() => handelSelectedCategory(item)}>
                      {decode(item.name)}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </RBSheet>
    </SafeAreaView>
  );
};

export default Home;
