import { Dispatcher, Store } from './flux';

const controlPanelDispatcher = new Dispatcher();

export const UPDATE_USERNAME = 'UPDATE_USERNAME';
export const UPDATE_FONT_SIZE_PREFERENCE = 'UPDATE_FONT_SIZE_PREFERENCE';

const userNameUpdateAction = value => ({
    type: UPDATE_USERNAME,
    value,
});

const fontSizePreferenceUpdateAction = value => ({
    type: UPDATE_FONT_SIZE_PREFERENCE,
    value,
});

document.forms.fontSizeForm.fontSize.forEach(element =>
    element.addEventListener('change', ({ target: { value } }) =>
        controlPanelDispatcher.dispatch(fontSizePreferenceUpdateAction(value)),
    ),
);

document
    .getElementById('userNameInput')
    .addEventListener('input', ({ target: { value } }) =>
        controlPanelDispatcher.dispatch(userNameUpdateAction(value)),
    );

class UserPrefsStore extends Store {
    getInitialState() {
        return localStorage['preferences']
            ? JSON.parse(localStorage['preferences'])
            : {
                  userName: 'Jim',
                  fontSize: 'small',
              };
    }

    __onDispatch({ type, value }) {
        switch (type) {
            case UPDATE_USERNAME:
                this.__state.userName = value;
                this.__emitChange();
                break;
            case UPDATE_FONT_SIZE_PREFERENCE:
                this.__state.fontSize = value;
                this.__emitChange();
                break;
        }
    }
    getUserPreferences() {
        return this.__state;
    }
}

const userPrefsStore = new UserPrefsStore(controlPanelDispatcher);

userPrefsStore.addListener(state => {
    console.info('Updated Store', state);
    render(state);
    localStorage[`preferences`] = JSON.stringify(state);
});

const render = ({ userName, fontSize }) => {
    document.getElementById('userName').innerText = userName;
    document.getElementsByClassName('container')[0].style.fontSize =
        fontSize === 'small' ? '16px' : '24px';
    document.forms.fontSizeForm.fontSize.value = fontSize;
};

render(userPrefsStore.getUserPreferences());
