import React, { createContext, useContext, useReducer } from 'react';
import appReducer, { initialState } from '../reducers/appReducer';
import {
  SET_LOADING,
  SET_ERROR,
  SET_ITEMS,
  ADD_ITEM,
  UPDATE_ITEM,
  DELETE_ITEM,
  SET_STATS,
  SET_TOKEN,
  LOGOUT,
} from '../reducers/appReducer';
import {
  loginUser,
  syncData as syncAPI,
  fetchItems,
  fetchItem,
  createItem,
  updateItem,
  deleteItem,
  fetchStats,
} from '../services/api';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // ---- Auth ----
  const login = async (credentials) => {
    dispatch({ type: SET_LOADING, payload: true });
    try {
      const { data } = await loginUser(credentials);
      dispatch({ type: SET_TOKEN, payload: data.token });
      return { success: true };
    } catch (err) {
      dispatch({ type: SET_ERROR, payload: err.response?.data?.message || 'Login failed' });
      return { success: false };
    }
  };

  const logout = () => dispatch({ type: LOGOUT });

  // ---- Sync ----
  const sync = async () => {
    dispatch({ type: SET_LOADING, payload: true });
    try {
      const { data } = await syncAPI();
      return { success: true, data };
    } catch (err) {
      dispatch({ type: SET_ERROR, payload: err.response?.data?.message || 'Sync failed' });
      return { success: false };
    } finally {
      dispatch({ type: SET_LOADING, payload: false });
    }
  };

  // ---- CRUD ----
  const loadItems = async (params) => {
    dispatch({ type: SET_LOADING, payload: true });
    try {
      const { data } = await fetchItems(params);
      dispatch({ type: SET_ITEMS, payload: data });
    } catch (err) {
      dispatch({ type: SET_ERROR, payload: err.response?.data?.message || 'Failed to load' });
    }
  };

  const addItem = async (itemData) => {
    dispatch({ type: SET_LOADING, payload: true });
    try {
      const { data } = await createItem(itemData);
      dispatch({ type: ADD_ITEM, payload: data.data });
      return { success: true };
    } catch (err) {
      dispatch({ type: SET_ERROR, payload: err.response?.data?.message || 'Create failed' });
      return { success: false };
    }
  };

  const editItem = async (id, itemData) => {
    dispatch({ type: SET_LOADING, payload: true });
    try {
      const { data } = await updateItem(id, itemData);
      dispatch({ type: UPDATE_ITEM, payload: data.data });
      return { success: true };
    } catch (err) {
      dispatch({ type: SET_ERROR, payload: err.response?.data?.message || 'Update failed' });
      return { success: false };
    }
  };

  const removeItem = async (id) => {
    dispatch({ type: SET_LOADING, payload: true });
    try {
      await deleteItem(id);
      dispatch({ type: DELETE_ITEM, payload: id });
      return { success: true };
    } catch (err) {
      dispatch({ type: SET_ERROR, payload: err.response?.data?.message || 'Delete failed' });
      return { success: false };
    }
  };

  const loadStats = async () => {
    dispatch({ type: SET_LOADING, payload: true });
    try {
      const { data } = await fetchStats();
      dispatch({ type: SET_STATS, payload: data.data });
    } catch (err) {
      dispatch({ type: SET_ERROR, payload: err.response?.data?.message || 'Stats failed' });
    }
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        login,
        logout,
        sync,
        loadItems,
        addItem,
        editItem,
        removeItem,
        loadStats,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
