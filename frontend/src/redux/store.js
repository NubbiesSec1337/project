import { configureStore } from '@reduxjs/toolkit';
import customerReducer from './customerSlice';

const store = configureStore({
  reducer: {
    customer: customerReducer,
  },
});

export default store;
