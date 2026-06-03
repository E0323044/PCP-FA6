import React, { createContext, useContext, useReducer, useEffect } from 'react';
import appReducer, { initialState } from '../reducers/appReducer';
import * as types from '../reducers/appReducer';
import * as api from '../services/api';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Auto load current user details if token exists
  useEffect(() => {
    if (state.token && !state.user) {
      loadCurrentUser();
    }
  }, [state.token]);

  const loadCurrentUser = async () => {
    try {
      const { data } = await api.fetchCurrentUser();
      dispatch({
        type: types.SET_AUTH,
        payload: { token: state.token, user: data.data }
      });
    } catch (err) {
      console.error("Failed to load current user details:", err.message);
      logout();
    }
  };

  // ---- Auth ----
  const login = async (credentials) => {
    dispatch({ type: types.SET_LOADING, payload: true });
    try {
      const { data } = await api.loginUser(credentials);
      dispatch({
        type: types.SET_AUTH,
        payload: { token: data.data.token, user: data.data }
      });
      return { success: true };
    } catch (err) {
      dispatch({ type: types.SET_ERROR, payload: err.response?.data?.message || 'Login failed' });
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (userData) => {
    dispatch({ type: types.SET_LOADING, payload: true });
    try {
      const { data } = await api.registerUser(userData);
      return { success: true, message: data.message };
    } catch (err) {
      dispatch({ type: types.SET_ERROR, payload: err.response?.data?.message || 'Registration failed' });
      return { success: false, message: err.response?.data?.message || 'Registration failed' };
    } finally {
      dispatch({ type: types.SET_LOADING, payload: false });
    }
  };

  const logout = () => dispatch({ type: types.LOGOUT });

  // ---- Sync ----
  const sync = async () => {
    dispatch({ type: types.SET_LOADING, payload: true });
    try {
      const { data } = await api.syncData();
      // Reload analytics and data after sync
      loadStudents();
      loadCompanies();
      loadDrives();
      loadApplications();
      loadInterviews();
      loadAnalytics();
      return { success: true, data: data.data };
    } catch (err) {
      dispatch({ type: types.SET_ERROR, payload: err.response?.data?.message || 'Sync failed' });
      return { success: false, message: err.response?.data?.message || 'Sync failed' };
    } finally {
      dispatch({ type: types.SET_LOADING, payload: false });
    }
  };

  // ---- Load Methods ----
  const loadStudents = async (params) => {
    dispatch({ type: types.SET_LOADING, payload: true });
    try {
      const { data } = await api.fetchStudents(params);
      dispatch({ type: types.SET_STUDENTS, payload: data.data });
    } catch (err) {
      dispatch({ type: types.SET_ERROR, payload: err.response?.data?.message || 'Failed to load students' });
    }
  };

  const loadCompanies = async () => {
    dispatch({ type: types.SET_LOADING, payload: true });
    try {
      const { data } = await api.fetchCompanies();
      dispatch({ type: types.SET_COMPANIES, payload: data.data });
    } catch (err) {
      dispatch({ type: types.SET_ERROR, payload: err.response?.data?.message || 'Failed to load companies' });
    }
  };

  const loadDrives = async (params) => {
    dispatch({ type: types.SET_LOADING, payload: true });
    try {
      const { data } = await api.fetchDrives(params);
      dispatch({ type: types.SET_DRIVES, payload: data.data });
    } catch (err) {
      dispatch({ type: types.SET_ERROR, payload: err.response?.data?.message || 'Failed to load drives' });
    }
  };

  const loadApplications = async (params) => {
    dispatch({ type: types.SET_LOADING, payload: true });
    try {
      const { data } = await api.fetchApplications(params);
      dispatch({ type: types.SET_APPLICATIONS, payload: data.data });
    } catch (err) {
      dispatch({ type: types.SET_ERROR, payload: err.response?.data?.message || 'Failed to load applications' });
    }
  };

  const loadInterviews = async () => {
    dispatch({ type: types.SET_LOADING, payload: true });
    try {
      const { data } = await api.fetchInterviews();
      dispatch({ type: types.SET_INTERVIEWS, payload: data.data });
    } catch (err) {
      dispatch({ type: types.SET_ERROR, payload: err.response?.data?.message || 'Failed to load interviews' });
    }
  };

  const loadAnalytics = async () => {
    dispatch({ type: types.SET_LOADING, payload: true });
    try {
      const placementsRes = await api.fetchPlacementAnalytics();
      const departmentsRes = await api.fetchDepartmentAnalytics();
      const companiesRes = await api.fetchCompanyAnalytics();
      
      dispatch({
        type: types.SET_ANALYTICS,
        payload: {
          placements: placementsRes.data.data,
          departments: departmentsRes.data.data,
          companies: companiesRes.data.data
        }
      });
    } catch (err) {
      dispatch({ type: types.SET_ERROR, payload: err.response?.data?.message || 'Failed to load analytics' });
    }
  };

  // ---- Company mutations ----
  const addCompany = async (companyData) => {
    dispatch({ type: types.SET_LOADING, payload: true });
    try {
      const { data } = await api.createCompany(companyData);
      dispatch({ type: types.ADD_COMPANY, payload: data.data });
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to add company' };
    } finally {
      dispatch({ type: types.SET_LOADING, payload: false });
    }
  };

  const editCompany = async (id, companyData) => {
    dispatch({ type: types.SET_LOADING, payload: true });
    try {
      const { data } = await api.updateCompany(id, companyData);
      dispatch({ type: types.UPDATE_COMPANY, payload: data.data });
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to update company' };
    } finally {
      dispatch({ type: types.SET_LOADING, payload: false });
    }
  };

  const removeCompany = async (id) => {
    dispatch({ type: types.SET_LOADING, payload: true });
    try {
      await api.deleteCompany(id);
      dispatch({ type: types.DELETE_COMPANY, payload: id });
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to delete company' };
    } finally {
      dispatch({ type: types.SET_LOADING, payload: false });
    }
  };

  // ---- Drive mutations ----
  const addDrive = async (driveData) => {
    dispatch({ type: types.SET_LOADING, payload: true });
    try {
      const { data } = await api.createDrive(driveData);
      dispatch({ type: types.ADD_DRIVE, payload: data.data });
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to create drive' };
    } finally {
      dispatch({ type: types.SET_LOADING, payload: false });
    }
  };

  const editDrive = async (id, driveData) => {
    dispatch({ type: types.SET_LOADING, payload: true });
    try {
      const { data } = await api.updateDrive(id, driveData);
      dispatch({ type: types.UPDATE_DRIVE, payload: data.data });
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to update drive' };
    } finally {
      dispatch({ type: types.SET_LOADING, payload: false });
    }
  };

  const removeDrive = async (id) => {
    dispatch({ type: types.SET_LOADING, payload: true });
    try {
      await api.deleteDrive(id);
      dispatch({ type: types.DELETE_DRIVE, payload: id });
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to delete drive' };
    } finally {
      dispatch({ type: types.SET_LOADING, payload: false });
    }
  };

  // ---- Application mutations ----
  const applyForDrive = async (appData) => {
    dispatch({ type: types.SET_LOADING, payload: true });
    try {
      const { data } = await api.createApplication(appData);
      dispatch({ type: types.ADD_APPLICATION, payload: data.data });
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to apply' };
    } finally {
      dispatch({ type: types.SET_LOADING, payload: false });
    }
  };

  const editApplication = async (id, appData) => {
    dispatch({ type: types.SET_LOADING, payload: true });
    try {
      const { data } = await api.updateApplication(id, appData);
      dispatch({ type: types.UPDATE_APPLICATION, payload: data.data });
      // Reload analytics after status change
      loadAnalytics();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to update application' };
    } finally {
      dispatch({ type: types.SET_LOADING, payload: false });
    }
  };

  // ---- Interview mutations ----
  const scheduleNewInterview = async (intData) => {
    dispatch({ type: types.SET_LOADING, payload: true });
    try {
      const { data } = await api.scheduleInterview(intData);
      dispatch({ type: types.ADD_INTERVIEW, payload: data.data });
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to schedule interview' };
    } finally {
      dispatch({ type: types.SET_LOADING, payload: false });
    }
  };

  const updateIntResult = async (id, intData) => {
    dispatch({ type: types.SET_LOADING, payload: true });
    try {
      const { data } = await api.updateInterviewResult(id, intData);
      dispatch({ type: types.UPDATE_INTERVIEW, payload: data.data.interview });
      // Reload applications and analytics since application status is automatically changed
      loadApplications();
      loadAnalytics();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to update interview result' };
    } finally {
      dispatch({ type: types.SET_LOADING, payload: false });
    }
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        sync,
        loadStudents,
        loadCompanies,
        loadDrives,
        loadApplications,
        loadInterviews,
        loadAnalytics,
        addCompany,
        editCompany,
        removeCompany,
        addDrive,
        editDrive,
        removeDrive,
        applyForDrive,
        editApplication,
        scheduleNewInterview,
        updateIntResult
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
