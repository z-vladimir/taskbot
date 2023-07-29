import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  Dimensions,
  Modal,
  ScrollView,
  I18nManager,
} from 'react-native';
import React, {useState, useCallback, useRef, useEffect} from 'react';
import FormButton from '../../components/FormButton';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import RangeSlider from 'rn-range-slider';
import Thumb from '../searchResults/Slider/Thumb';
import Label from '../searchResults/Slider/Label';
import Notch from '../searchResults/Slider/Notch';
import Spinner from 'react-native-loading-spinner-overlay';
import Rail from '../searchResults/Slider/Rail';
import RailSelected from '../searchResults/Slider/RailSelected';
import MultiSelect from 'react-native-multiple-select';
import {useSelector, useDispatch} from 'react-redux';
import * as CONSTANT from '../../constants/globalConstants';
import styles from '../../style/styles';
import RBSheet from 'react-native-raw-bottom-sheet';
import {decode} from 'html-entities';
import constant from '../../constants/translation';

const SearchProjects = ({navigation, route}) => {
  const userDetail = useSelector(state => state.value.userInfo);
  const [text, setText] = useState('');
  const [disable, setDisable] = useState(false);
  const [radius, setRadius] = useState('');
  const [lowRange, setLowRange] = useState('');
  const [highRange, setHighRange] = useState('');
  const [categories, setCategories] = useState([]);
  const [searchCategories, setSearchCategories] = useState([]);
  const [subcategories, setSubCategories] = useState([]);
  const [subCategoriesServices, setSubCategoriesServices] = useState([]);
  const [searchSubCategories, setSearchSubCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState('');
  const [selectedSubCategories, setSelectedSubCategories] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedCategoriesSlug, setSelectedCategoriesSlug] = useState('');
  const [selectedSubCategoriesSlug, setSelectedSubCategoriesSlug] =
    useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);
  const [countries, setCountries] = useState([]);
  const [checkUsers, setCheckUsers] = useState(null);
  const [selectedSkills, setSelectedSkills] = useState(false);
  const [refreshList, setRefreshList] = useState(false);
  const [selectedExpertiesType, setSelectedExpertiesType] = useState(false);
  const [selectedLangType, setSelectedLangType] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [expertiseLevel, setExpertiseLevel] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [skills, setSkills] = useState([]);
  const [level, setLevel] = useState('');
  const [sellerType, setSellerType] = useState([]);
  const [seller, setSeller] = useState('');
  const [spinner, setSpinner] = useState(false);
  const [loader, setLoader] = useState(false);

  const [selectedSkillsType, setSelectedSkillsType] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedExperties, setSelectedExperties] = useState([]);
  const [selectedLang, setSelectedLang] = useState([]);
  const rbSheet = useRef();
  const rbSheetSubcategories = useRef();

  const renderThumb = useCallback(() => <Thumb />, []);
  const renderRail = useCallback(() => <Rail />, []);
  const renderRailSelected = useCallback(() => <RailSelected />, []);
  const renderLabel = useCallback(value => <Label text={value} />, []);
  const renderNotch = useCallback(() => <Notch />, []);

  useEffect(() => {
    getCategories();
    getSettings();
    getCountryTaxonomy();
    getSkillsTaxonomy();
    getExpertiseLevelTaxonomy();
    getLanguagesTaxonomy();
  }, []);

  const getCategories = async () => {
    setLoader(true);
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
        setCategories(responseJson);
        setSearchCategories(responseJson);
        setLoader(false);
      })
      .catch(error => {
        setLoader(false);
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
        setMinPrice(responseJson.min_search_price);
        setMaxPrice(responseJson.max_search_price);
      })
      .catch(error => {
        console.error(error);
      });
  };

  const getExpertiseLevelTaxonomy = () => {
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
        setExpertiseLevel(responseJson);
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
        setLanguages(responseJson);
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
        setSkills(responseJson);
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
          Object.entries(responseJson).map(([key, value]) =>
            countries.push({
              slug: key,
              name: value,
            }),
          );
        }
      })
      .catch(error => {
        console.error(error);
      });
  };

  const handelSelectedCategory = value => {
    // getSubCategories(value.term_id);
    setSelectedCategoryId(value.term_id);
    setSelectedCategories(decode(value.name));
    setSelectedCategoriesSlug(value.slug);
    rbSheet.current.close();
  };


  const manageSelectedSkills = (item, index) => {
    setCheckUsers(index);
    if (selectedSkillsType.includes(item)) {
      const index = selectedSkillsType.indexOf(item);
      if (index > -1) {
        selectedSkillsType.splice(index, 1);
      }
      setSelectedSkills(false);
    } else {
      selectedSkillsType.push(item);
      setSelectedSkills(true);
    }
  };

  const manageExpertise = (item, index) => {
    setCheckUsers(index);
    if (selectedExperties.includes(item)) {
      const index = selectedExperties.indexOf(item);
      if (index > -1) {
        selectedExperties.splice(index, 1);
      }
      setSelectedExpertiesType(false);
    } else {
      selectedExperties.push(item);
      setSelectedExpertiesType(true);
    }
  };
  const manageLanguages = (item, index) => {
    setCheckUsers(index);
    if (selectedLang.includes(item)) {
      const index = selectedLang.indexOf(item);
      if (index > -1) {
        selectedLang.splice(index, 1);
      }
      setSelectedLangType(false);
    } else {
      selectedLang.push(item);
      setSelectedLangType(true);
    }
  };

  const searchProjects = () => {
    var expert = [];
    var skills = [];
    var lang = [];
    for (var i = 0; i < selectedLang.length; i++) {
      lang.push(selectedLang[i].slug);
    }
   
    for (var i = 0; i < selectedExperties.length; i++) {
      expert.push(selectedExperties[i].slug);
    }
   
    for (var i = 0; i < selectedSkillsType.length; i++) {
      skills.push(selectedSkillsType[i].slug);
    }
    
    navigation.navigate('projectListing', {
      text: text,
      min: lowRange,
      max: highRange,
      location: selectedCountry.toString(),
      skills: skills,
      expert: expert,
      category: selectedCategoriesSlug,
      languages:lang,
      showSkills: true,
      showMoreDetails: true,
    });
  };

  const clearAllData = () => {
    setText('');
    setSelectedCategories('');
    // setSelectedSubCategories('')
    // setSubCategoriesServices([])
    setSelectedCountry([]);
    setMinPrice(minPrice);
    setMaxPrice(maxPrice);
    setLowRange(minPrice);
    setHighRange(maxPrice);
    setSelectedSkillsType([]);
    setSelectedExperties([]);
    setSelectedLang([]);
  };
  return (
    <SafeAreaView style={styles.globalContainer}>
      <View style={styles.narrowSearchHeaderView}>
        <Text style={styles.narrowSearchHeaderText}>
          {constant.narrowSearchTitle}
        </Text>
        <View style={styles.narrowSearchHeaderIcon}>
          <Feather
            onPress={() => navigation.goBack()}
            style={{paddingHorizontal: 10}}
            name="x"
            type="x"
            color={'#1C1C1C'}
            size={25}
          />
        </View>
      </View>
      {loader && <Spinner visible={true} color={'#000'} />}
      <ScrollView
        style={{marginHorizontal: 10}}
        showsVerticalScrollIndicator={false}>
        <View
          style={[
            styles.narrowSearchInputView,
            {
              paddingVertical: Platform.OS == 'ios' ? 10 : 0,
            },
          ]}>
          <Feather
            style={{paddingLeft: 5, paddingRight: 10}}
            name={'search'}
            size={20}
            color={'#999999'}
          />
          <TextInput
            style={styles.narrowSearchInputStyle}
            placeholderTextColor={'#999999'}
            onChangeText={text => setText(text)}
            value={text}
            placeholder={constant.narrowSearchPlaceholder}
          />
        </View>

        <>
          <Text style={styles.narrowSearchHeadingText}>
            {constant.narrowSearchCategory}
          </Text>
          <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => rbSheet.current.open()}
            style={[
              styles.narrowSearchCateogryConatiner,
              {
                paddingVertical: Platform.OS == 'ios' ? 10 : 0,
              },
            ]}>
            <Text
              style={[
                styles.narrowSearchCateogryTextStyle,
                {color: selectedCategories != '' ? '#1C1C1C' : '#999999'},
              ]}>
              {selectedCategories != ''
                ? selectedCategories
                : constant.narrowSearchSelectCategory}
            </Text>
            <Feather
              style={styles.narrowSearchIconStyle}
              name={I18nManager.isRTL ? 'chevron-left' : 'chevron-right'}
              size={20}
              color={'#999999'}
            />
          </TouchableOpacity>

          {/* <FlatList
            style={{marginTop: 10}}
            data={subCategoriesServices}
            keyExtractor={(x, i) => i.toString()}
            renderItem={({item, index}) => (
              <TouchableOpacity
                onPress={() => manageSelectedServices(item, index)}
                style={styles.checkBoxMainView}>
                {selectedServices.includes(item) ? (
                  <View style={styles.checkBoxCheck}>
                    <FontAwesome
                      name="check"
                      type="check"
                      color={'#fff'}
                      size={14}
                    />
                  </View>
                ) : (
                  <View style={styles.checkBoxUncheck} />
                )}
                <Text style={styles.checkBoxTextSearch}>{item.name}</Text>
              </TouchableOpacity>
            )}
          /> */}
        </>

        <>
          <Text style={styles.narrowSearchHeadingText}>{constant.SearchProjectsSkills}</Text>
          <View>
            <FlatList
              data={skills}
              keyExtractor={(x, i) => i.toString()}
              renderItem={({item, index}) => (
                <TouchableOpacity
                  onPress={() => manageSelectedSkills(item, index)}
                  style={styles.checkBoxMainView}>
                  {selectedSkillsType.includes(item) ? (
                    <View style={styles.checkBoxCheck}>
                      <FontAwesome
                        name="check"
                        type="check"
                        color={'#fff'}
                        size={14}
                      />
                    </View>
                  ) : (
                    <View style={styles.checkBoxUncheck} />
                  )}
                  <Text style={styles.checkBoxTextSearch}>
                    {decode(item.name)}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
          <Text style={styles.narrowSearchHeadingText}>{constant.SearchProjectsExpertiseLevel}</Text>
          <FlatList
            data={expertiseLevel}
            keyExtractor={(x, i) => i.toString()}
            renderItem={({item, index}) => (
              <TouchableOpacity
                onPress={() => manageExpertise(item, index)}
                style={styles.checkBoxMainView}>
                {selectedExperties.includes(item) ? (
                  <View style={styles.checkBoxCheck}>
                    <FontAwesome
                      name="check"
                      type="check"
                      color={'#fff'}
                      size={14}
                    />
                  </View>
                ) : (
                  <View style={styles.checkBoxUncheck} />
                )}
                <Text style={styles.checkBoxTextSearch}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
          <Text style={styles.narrowSearchHeadingText}>{constant.SearchProjectsLanguages}</Text>
          <FlatList
            data={languages}
            keyExtractor={(x, i) => i.toString()}
            renderItem={({item, index}) => (
              <TouchableOpacity
                onPress={() => manageLanguages(item, index)}
                style={styles.checkBoxMainView}>
                {selectedLang.includes(item) ? (
                  <View style={styles.checkBoxCheck}>
                    <FontAwesome
                      name="check"
                      type="check"
                      color={'#fff'}
                      size={14}
                    />
                  </View>
                ) : (
                  <View style={styles.checkBoxUncheck} />
                )}
                <Text style={styles.checkBoxTextSearch}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </>

        <View style={styles.narrowSearchPriceRatingHeading}>
          <Text style={styles.narrowSearchPriceText}>
            {constant.narrowSearchMinPrice}
          </Text>
          <Text style={styles.narrowSearchPriceText}>
            {constant.narrowSearchMaxPrice}
          </Text>
        </View>
        <View style={styles.narrowSearchPriceAmount}>
          <Text style={styles.narrowSearchPriceTextAmount}>{minPrice}</Text>
          <Text style={styles.narrowSearchPriceTextAmount}>{maxPrice}</Text>
        </View>
        {maxPrice != 0 && (
          <RangeSlider
            style={styles.narrowSearchRangeSlider}
            gravity={'center'}
            min={Number(minPrice)}
            max={Number(maxPrice)}
            step={30}
            renderThumb={renderThumb}
            renderRail={renderRail}
            renderRailSelected={renderRailSelected}
            renderLabel={renderLabel}
            renderNotch={renderNotch}
            onValueChanged={(low, high, fromUser) => {
              setLowRange(low);
              setHighRange(high);
            }}
          />
        )}

        <Text style={styles.narrowSearchHeadingText}>
          {constant.narrowSearchLocation}
        </Text>
        <View style={styles.narrowSearchLocationConatiner}>
          <MultiSelect
            fontSize={16}
            onSelectedItemsChange={value => setSelectedCountry(value)}
            uniqueKey="slug"
            items={countries}
            selectedItems={selectedCountry}
            borderBottomWidth={0}
            single={true}
            searchInputPlaceholderText={constant.narrowSearchSelectCountry}
            selectText={constant.narrowSearchSelectCountry}
            styleMainWrapper={styles.multiSlectstyleMainWrapper}
            styleDropdownMenuSubsection={
              styles.multiSlectstyleDropdownMenuSubsection
            }
            styleListContainer={{
              maxHeight: 150,
            }}
            onChangeInput={text => console.log(text)}
            displayKey="name"
            submitButtonText={'submit'}
          />
        </View>

        <FormButton
          buttonTitle={constant.SearchProjectsApplyFilters}
          backgroundColor={CONSTANT.primaryColor}
          textColor={'#fff'}
          onPress={() => searchProjects()}
        />
        <View style={styles.narrowSearchButtonView}>
          <Text
            onPress={() => clearAllData()}
            style={styles.narrowSearchClearButton}>
            {constant.narrowSearchClearFilters}
          </Text>
        </View>
      </ScrollView>
      <RBSheet
        ref={rbSheet}
        height={Dimensions.get('window').height * 0.6}
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
              name={'arrow-left'}
              size={20}
              color={'#1C1C1C'}
            />
            <Text style={styles.RBSheetHeaderTextStyle}>
              {constant.narrowSearchSelectCategory}
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
              // onChangeText={handelSearchItem}
              placeholder={constant.narrowSearchSearchCategory}
            />
          </TouchableOpacity>
          <FlatList
            style={{marginHorizontal: 20}}
            showsVerticalScrollIndicator={true}
            extraData={refreshList}
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
      {/* <RBSheet
        ref={rbSheetSubcategories}
        height={Dimensions.get('window').height * 0.6}
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
              onPress={() => rbSheetSubcategories.current.close()}
              style={styles.RBSheetCloseIconStyle}
              name={'arrow-left'}
              size={20}
              color={'#1C1C1C'}
            />
            <Text style={styles.RBSheetHeaderTextStyle}>
              {constant.narrowSearchSubCategory}
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
              // onChangeText={handelSearchItem}
              placeholder="Search category"
            />
          </TouchableOpacity>
          <FlatList
            style={{paddingHorizontal: 30}}
            showsVerticalScrollIndicator={true}
            data={searchSubCategories}
            extraData={refreshList}
            keyExtractor={(x, i) => i.toString()}
            renderItem={({item, index}) => {
              return (
                <TouchableOpacity activeOpacity={0.3}>
                  <Text
                    style={styles.homeRBSheetListTextStyle}
                    onPress={() => handelSelectedSubCategory(item)}>
                    {decode(item.name)}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </RBSheet> */}
    </SafeAreaView>
  );
};

export default SearchProjects;
