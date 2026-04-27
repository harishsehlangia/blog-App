import { nanoid } from 'nanoid';
import User from '../Schema/User.js';

export const generateUsername = async (email) => {
    let username = email.split("@")[0];

    let isUsernameExists = await User.exists({ "personal_info.username": username }).then((result) => result)

    isUsernameExists ? username += nanoid().substring(0, 5) : "";

    return username;
};

// Escape special regex characters to prevent ReDoS
export const escapeRegex = (str) => {
    if (!str) return '';
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};
