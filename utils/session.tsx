import * as SecureStore from 'expo-secure-store';

const SESSION_KEY = 'user_session';
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 Days

export const saveSession = async(user: { id: string; email: string; fname: string }) => {
    const sessionData = {
        userID: user.id,
        email: user.email,
        fname: user.fname,
        expiresAt: Date.now() + SESSION_DURATION,
    };
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(sessionData));
};

export const getSession = async() => {
    const sessionData = await SecureStore.getItemAsync(SESSION_KEY);
    if (!sessionData) return null;

    const parsedData = JSON.parse(sessionData);
    if (Date.now() > parsedData.expiresAt) {
        await SecureStore.deleteItemAsync(SESSION_KEY);
        return null;
    }
    return parsedData;
}

export const clearSession = async() => {
    await SecureStore.deleteItemAsync(SESSION_KEY);
}