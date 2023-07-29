import {createSlice} from '@reduxjs/toolkit';
export const SettingSlice = createSlice({
  name: 'SettingSlice',
  initialState: {
    language:"en",
    settings: {},
    durationTaxonomy: [],
    categoriesTaxonomy: [],
    countriesTaxonomy: [],
    skillsTaxonomy: [],
    languagesTaxonomy: [],
    expertiseTaxonomy: [],
    deliveryTaxonomy: [],
    tagsTaxonomy: [],
  },
  reducers: {
    updateLanguage: (state, action) => {
      state.language = action.payload;
    },
    updateSetting: (state, action) => {
      state.settings = action.payload;
    },
    updateDurationTaxonomy: (state, action) => {
      state.durationTaxonomy = action.payload;
    },
    updateCategoriesTaxonomy: (state, action) => {
      state.categoriesTaxonomy = action.payload;
    },
    updateCountriesTaxonomy: (state, action) => {
      state.countriesTaxonomy = action.payload;
    },
    updateSkillsTaxonomy: (state, action) => {
      state.skillsTaxonomy = action.payload;
    },
    updateLanguagesTaxonomy: (state, action) => {
      state.languagesTaxonomy = action.payload;
    },
    updateExpertiseTaxonomy: (state, action) => {
      state.expertiseTaxonomy = action.payload;
    },
    updateDeliveryTaxonomy: (state, action) => {
      state.deliveryTaxonomy = action.payload;
    },
    updateTagsTaxonomy: (state, action) => {
      state.tagsTaxonomy = action.payload;
    },
  },
});
export const {
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
} = SettingSlice.actions;
export default SettingSlice.reducer;
