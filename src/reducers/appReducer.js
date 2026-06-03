// Action Types
export const SET_LOADING = 'SET_LOADING';
export const SET_ERROR = 'SET_ERROR';
export const SET_AUTH = 'SET_AUTH';
export const LOGOUT = 'LOGOUT';

export const SET_STUDENTS = 'SET_STUDENTS';
export const SET_COMPANIES = 'SET_COMPANIES';
export const SET_DRIVES = 'SET_DRIVES';
export const SET_APPLICATIONS = 'SET_APPLICATIONS';
export const SET_INTERVIEWS = 'SET_INTERVIEWS';

export const ADD_COMPANY = 'ADD_COMPANY';
export const UPDATE_COMPANY = 'UPDATE_COMPANY';
export const DELETE_COMPANY = 'DELETE_COMPANY';

export const ADD_DRIVE = 'ADD_DRIVE';
export const UPDATE_DRIVE = 'UPDATE_DRIVE';
export const DELETE_DRIVE = 'DELETE_DRIVE';

export const ADD_APPLICATION = 'ADD_APPLICATION';
export const UPDATE_APPLICATION = 'UPDATE_APPLICATION';

export const ADD_INTERVIEW = 'ADD_INTERVIEW';
export const UPDATE_INTERVIEW = 'UPDATE_INTERVIEW';

export const SET_ANALYTICS = 'SET_ANALYTICS';

// Initial State
export const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  students: [],
  companies: [],
  drives: [],
  applications: [],
  interviews: [],
  analytics: {
    placements: null,
    departments: [],
    companies: []
  },
  loading: false,
  error: null,
};

// Reducer
const appReducer = (state, action) => {
  switch (action.type) {
    case SET_LOADING:
      return { ...state, loading: action.payload };

    case SET_ERROR:
      return { ...state, error: action.payload, loading: false };

    case SET_AUTH:
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      return {
        ...state,
        token: action.payload.token,
        user: action.payload.user,
        error: null,
        loading: false
      };

    case LOGOUT:
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return {
        ...initialState,
        user: null,
        token: null
      };

    case SET_STUDENTS:
      return { ...state, students: action.payload, loading: false };

    case SET_COMPANIES:
      return { ...state, companies: action.payload, loading: false };

    case SET_DRIVES:
      return { ...state, drives: action.payload, loading: false };

    case SET_APPLICATIONS:
      return { ...state, applications: action.payload, loading: false };

    case SET_INTERVIEWS:
      return { ...state, interviews: action.payload, loading: false };

    case ADD_COMPANY:
      return { ...state, companies: [...state.companies, action.payload], loading: false };

    case UPDATE_COMPANY:
      return {
        ...state,
        companies: state.companies.map((c) => (c._id === action.payload._id ? action.payload : c)),
        loading: false
      };

    case DELETE_COMPANY:
      return {
        ...state,
        companies: state.companies.filter((c) => c._id !== action.payload),
        loading: false
      };

    case ADD_DRIVE:
      return { ...state, drives: [...state.drives, action.payload], loading: false };

    case UPDATE_DRIVE:
      return {
        ...state,
        drives: state.drives.map((d) => (d._id === action.payload._id ? action.payload : d)),
        loading: false
      };

    case DELETE_DRIVE:
      return {
        ...state,
        drives: state.drives.filter((d) => d._id !== action.payload),
        loading: false
      };

    case ADD_APPLICATION:
      return { ...state, applications: [action.payload, ...state.applications], loading: false };

    case UPDATE_APPLICATION:
      return {
        ...state,
        applications: state.applications.map((a) => (a._id === action.payload._id ? action.payload : a)),
        loading: false
      };

    case ADD_INTERVIEW:
      return { ...state, interviews: [...state.interviews, action.payload], loading: false };

    case UPDATE_INTERVIEW:
      return {
        ...state,
        interviews: state.interviews.map((i) => (i._id === action.payload._id ? action.payload : i)),
        loading: false
      };

    case SET_ANALYTICS:
      return {
        ...state,
        analytics: {
          ...state.analytics,
          ...action.payload
        },
        loading: false
      };

    default:
      return state;
  }
};

export default appReducer;
