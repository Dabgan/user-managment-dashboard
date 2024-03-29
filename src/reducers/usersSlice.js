import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { API_URL, fetchApi } from '../api/users';

const initialState = {
    users: [],
    currentUserId: null,
    isLoading: false,
    error: null,
    isModalOpen: false,
    isAscending: true,
};

export const fetchUsers = createAsyncThunk('users/fetchUsers', async () => {
    const data = await fetchApi(API_URL, 'GET');
    return data;
});

export const fetchAddUser = createAsyncThunk(
    'users/addUser',
    async (newUser) => {
        const data = await fetchApi(API_URL, 'POST', newUser);
        return data;
    }
);

export const fetchEditUser = createAsyncThunk(
    'users/editUser',
    async ({ id, updatedInfo }) => {
        const data = await fetchApi(`${API_URL}/${id}`, 'PUT', updatedInfo);
        return data;
    }
);

export const fetchDeleteUser = createAsyncThunk(
    'users/deleteUser',
    async (id) => {
        await fetchApi(`${API_URL}/${id}`, 'DELETE');
        return id;
    }
);

export const usersSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        openModal: (state) => {
            state.isModalOpen = true;
        },
        closeModal: (state) => {
            state.isModalOpen = false;
            state.currentUserId = null;
        },
        setCurrentUserId: (state, action) => {
            state.currentUserId = action.payload;
        },
        sortUsers: (state) => {
            state.users.sort((a, b) => {
                if (state.isAscending) {
                    return a.username?.localeCompare(b.username);
                } else {
                    return b.username?.localeCompare(a.username);
                }
            });
            state.isAscending = !state.isAscending;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.isLoading = false;
                state.users = action.payload;
                state.error = null;
            })
            .addCase(fetchAddUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.users.push(action.payload);
                state.error = null;
            })
            .addCase(fetchEditUser.fulfilled, (state, action) => {
                state.isLoading = false;
                const updatedUser = action.meta.arg.updatedUser;
                const updatedUserId = action.payload.id;
                state.users = state.users.map((user) => {
                    if (user.id === updatedUserId) {
                        return {
                            ...user,
                            ...updatedUser,
                        };
                    }
                    return user;
                });
                state.error = null;
            })
            .addCase(fetchDeleteUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.users = state.users.filter(
                    (user) => user.id !== action.meta.arg
                );
            })
            .addCase(fetchDeleteUser.rejected, (state, action) => {
                state.isLoading = false;
                state.users = state.users.filter(
                    (user) => user.id !== action.meta.arg
                );
            })
            .addMatcher(
                (action) => action.type.endsWith('/pending'),
                (state) => {
                    state.isLoading = true;
                }
            )
            .addMatcher(
                (action) => action.type.endsWith('/rejected'),
                (state, action) => {
                    state.isLoading = false;
                    // those two below scenarions for rejected actions are here because we are working
                    // on custom test/api and normally it's throwing an error (in example because of deleting
                    // user that doesn't exist on server). Here we ignore response error to show correct and
                    // updated users list
                    if (action.type.includes('deleteUser')) {
                        state.isLoading = false;
                        state.users = state.users.filter(
                            (user) => user.id !== action.meta.arg
                        );
                        return;
                    }
                    if (action.type.includes('editUser')) {
                        state.isLoading = false;
                        const updatedUser = action.meta.arg.updatedUser;
                        const updatedUserId = action.meta.arg.id;

                        state.users = state.users.map((user) => {
                            if (user.id === updatedUserId) {
                                return {
                                    ...user,
                                    ...updatedUser,
                                };
                            }
                            return user;
                        });
                        state.error = null;
                    } else {
                        state.error = action.error.message;
                    }
                }
            );
    },
});

export const { openModal, closeModal, getUser, setCurrentUserId, sortUsers } =
    usersSlice.actions;

export const selectAllUsers = (state) => state.users;

export const findUserById = (users, userId) => {
    return users.find((user) => {
        return user.id === userId;
    });
};

export default usersSlice.reducer;
