import {getStorage, setStorage} from "./CommonUtils";
import {getSqliteCacheData, setSqliteCacheData} from "./Sqlite";
import {getRegisteredUsers} from "./DataUtils";

const KEY_USER_DATA = 'key_user_token1';
const KEY_USER_VIEW_GUIDE = 'user_viewed_guided';

export const getUserData = () => {
  const token = getStorage(KEY_USER_DATA);
  if (!token) {
    return null;
  }

  return token
};

export const getUserToken = () => {
  let token = getUserData();
  return token ? token.token : '';
};

export const isUserLogin = () => {
  const token = getUserData();
  return token !== null && token.userId;
};

export const saveUserData = data => setStorage(KEY_USER_DATA, data);

export const getCacheRegisteredUsers = async () => {
  const key = 'registered_users';
  let users = await getSqliteCacheData(key);
  if (users == null) {
    let {c, m, d} = await getRegisteredUsers();
    if (c !== 0) {
      console.error('getCacheRegisteredUsers from api failed');
      return;
    }
    users = d;
    // setSqliteCacheData(key, users, 3600);
  }

  return users
};

export const getCacheUserById = (users, id) => {
  for (let i = 0; i < users.length; i++) {
    if (users[i].juid + '' === id) {
      return users[i];
    }
  }
};


export const userViewGuide = () => {
  return getStorage(KEY_USER_VIEW_GUIDE) === 'yes';
};

export const setUserViewedGuide = () => {
  setStorage(KEY_USER_VIEW_GUIDE, 'yes');
};