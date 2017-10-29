import { generate as id } from 'shortid';

const delay = 1000;
export const get = (url, callback) => {
    setTimeout(() => {
        callback(id());
    }, delay);
};
