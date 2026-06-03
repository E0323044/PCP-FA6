// Action Types
export const SET_LOADING = 'SET_LOADING';
export const SET_ERROR = 'SET_ERROR';
export const SET_ITEMS = 'SET_ITEMS';
export const ADD_ITEM = 'ADD_ITEM';
export const UPDATE_ITEM = 'UPDATE_ITEM';
export const DELETE_ITEM = 'DELETE_ITEM';
export const SET_STATS = 'SET_STATS';
export const SET_TOKEN = 'SET_TOKEN';
export const LOGOUT = 'LOGOUT';

// Initial State
export const initialState = {
  items: [],
  total: 0,
  stats: null,
  token: localStorage.getItem('token') || null,
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

    case SET_TOKEN:
      localStorage.setItem('token', action.payload);
      return { ...state, token: action.payload, error: null };

    case LOGOUT:
      localStorage.removeItem('token');
      return { ...state, token: null, items: [], stats: null };

    case SET_ITEMS:
      return {
        ...state,
        items: action.payload.data,
        total: action.payload.total,
        loading: false,
        error: null,
      };

    case ADD_ITEM:
      return {
        ...state,
        items: [action.payload, ...state.items],
        total: state.total + 1,
        loading: false,
      };

    case UPDATE_ITEM:
      return {
        ...state,
        items: state.items.map((item) =>
          item._id === action.payload._id ? action.payload : item
        ),
        loading: false,
      };

    case DELETE_ITEM:
      return {
        ...state,
        items: state.items.filter((item) => item._id !== action.payload),
        total: state.total - 1,
        loading: false,
      };

    case SET_STATS:
      return { ...state, stats: action.payload, loading: false };

    default:
      return state;
  }
};

export default appReducer;
