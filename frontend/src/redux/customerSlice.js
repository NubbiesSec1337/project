import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Action untuk mengambil semua customer
export const fetchCustomers = createAsyncThunk(
    'customer/fetchCustomers',
    async () => {
        const response = await fetch('http://localhost:3001/customers');
        const data = await response.json();
        return data;
    }
);

export const fetchCustomerDetails = createAsyncThunk(
    'customer/fetchCustomerDetails',
    async (customerId) => {
        const response = await fetch(`http://localhost:3001/customers/${customerId}/detail`);
        const data = await response.json();
        return data;
    }
);

const customerSlice = createSlice({
    name: 'customer',
    initialState: {
        customers: [],
        customerDetails: null,
        loading: false,
    },
    reducers: {
        setSelectedCustomerId(state, action) {
            state.selectedCustomerId = action.payload;
            state.customerDetails = null; // Reset details when switching customers
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCustomers.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchCustomers.fulfilled, (state, action) => {
                state.customers = action.payload;
                state.loading = false;
            })
            .addCase(fetchCustomers.rejected, (state) => {
                state.loading = false;
            })
            .addCase(fetchCustomerDetails.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchCustomerDetails.fulfilled, (state, action) => {
                state.customerDetails = action.payload;
                state.loading = false;
            })
            .addCase(fetchCustomerDetails.rejected, (state) => {
                state.loading = false;
            });
    },
});

export const { setSelectedCustomerId } = customerSlice.actions;
export default customerSlice.reducer;

// Hapus baris ini jika sudah ada ekspor `fetchCustomers` di bagian lain dari file ini
// export { fetchCustomers };
