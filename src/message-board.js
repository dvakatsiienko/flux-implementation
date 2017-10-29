import { createStore, combineReducers, applyMiddleware } from 'redux';
import { get } from './http';
import { createLogger } from 'redux-logger';
import thunk from 'redux-thunk';

export const ONLINE = 'ONLINE';
export const AWAY = 'AWAY';
export const BUSY = 'BUSY';
export const OFFLINE = 'OFFLINE';

export const READY = 'READY';
export const WAITING = 'WAITING';
export const NEW_MESSAGE_SERVER_ACCEPTED = 'NEW_MESSAGE_SERVER_ACCEPTED';

export const UPDATE_STATUS = 'UPDATE_STATUS';
export const CREATE_NEW_MESSAGE = 'CREATE_NEW_MESSAGE';

const defaultState = {
    messages: [
        {
            date: new Date('1991-07-15 11:44:23'),
            postedBy: 'Daniel',
            content: 'I <3 skating',
        },
        {
            date: new Date('1991-07-15 11:45:23'),
            postedBy: 'Jack',
            content: 'Where is my axe?',
        },
        {
            date: new Date('1991-07-15 11:45:44'),
            postedBy: 'Jaina',
            content: "I' freezing!",
        },
    ],
    userStatus: ONLINE,
    apiCommunicationStatus: READY,
};

const userStatusReducer = (state = defaultState.userStatus, { type, value }) => {
    switch (type) {
        case UPDATE_STATUS:
            return value;
        default:
            return state;
    }
};

const messageReducer = (state = defaultState.messages, { type, value, postedBy, date }) => {
    switch (type) {
        case CREATE_NEW_MESSAGE:
            return [{ date, postedBy, content: value }, ...state];
        default:
            return state;
    }
};

const apiCommunicationStatusReducer = (state = READY, { type }) => {
    switch (type) {
        case CREATE_NEW_MESSAGE:
            return WAITING;
        case NEW_MESSAGE_SERVER_ACCEPTED:
            return READY;
        default:
            return state;
    }
};

const store = createStore(
    combineReducers({
        userStatus: userStatusReducer,
        messages: messageReducer,
        apiCommunicationStatus: apiCommunicationStatusReducer,
    }),
    defaultState,
    applyMiddleware(createLogger(), thunk),
);

document.forms.newMessage.addEventListener('submit', event => {
    event.preventDefault();
    const userName = localStorage['preferences']
        ? JSON.parse(localStorage['preferences']).userName
        : 'Earthworm Jim';
    store.dispatch(newMessageAction(event.target.newMessage.value, userName))
});

const render = () => {
    const { messages, userStatus, apiCommunicationStatus } = store.getState();
    document.getElementById('messages').innerHTML = messages
        .sort((a, b) => a.date - a.date)
        .map(message => `<div>${message.postedBy}: ${message.content}</div>`)
        .join('');

    document.forms.newMessage.fields.disabled =
        userStatus === OFFLINE || apiCommunicationStatus === WAITING;
    document.forms.newMessage.newMessage.value = null;
};

const statusUpdateAction = value => ({
    type: UPDATE_STATUS,
    value,
});

const newMessageAction = (content, postedBy) => (dispatch, getState) => {
    const date = new Date();
    dispatch({
        type: CREATE_NEW_MESSAGE,
        value: content,
        postedBy,
        date,
    });
    get('/api/create', id => {
        dispatch({
            type: NEW_MESSAGE_SERVER_ACCEPTED,
            value: content,
            postedBy,
            date,
            id,
        });
    });
};

document.forms.selectStatus.status.addEventListener('change', ({ target: { value } }) => {
    store.dispatch(statusUpdateAction(value));
});

render();

store.subscribe(render);
