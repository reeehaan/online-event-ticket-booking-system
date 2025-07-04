import { jwtDecode } from "jwt-decode";

// Utility function to get current user type
export const getCurrentUserType = () => {
const token = localStorage.getItem('authToken');

if (!token) return 'guest';

try {
const decodedToken = jwtDecode(token);
const currentTime = Date.now() / 1000;

if (decodedToken.exp > currentTime) {
    return decodedToken.userType;
}
return 'guest';
} catch {
return 'guest';
}
};

// Utility function to check if user is authenticated
export const isUserAuthenticated = () => {
const token = localStorage.getItem('authToken');

if (!token) return false;

try {
const decodedToken = jwtDecode(token);
const currentTime = Date.now() / 1000;

return decodedToken.exp > currentTime;
} catch {
return false;
}
};

// Utility function to check if user has specific user type
export const hasUserType = (requiredUserType) => {
const token = localStorage.getItem('authToken');

if (!token) return false;

try {
const decodedToken = jwtDecode(token);
const currentTime = Date.now() / 1000;

return decodedToken.exp > currentTime && decodedToken.userType === requiredUserType;
} catch {
return false;
}
};

// Utility function to get user data from token
export const getUserData = () => {
const token = localStorage.getItem('authToken');

if (!token) return null;

try {
const decodedToken = jwtDecode(token);
const currentTime = Date.now() / 1000;

if (decodedToken.exp > currentTime) {
    return decodedToken;
}
return null;
} catch {
return null;
}
};

// Utility function to logout user
export const logoutUser = () => {
localStorage.removeItem('authToken');
localStorage.removeItem('userType');
localStorage.removeItem('fullName');
window.location.href = '/login';
};

// Utility function to check if token is expired
export const isTokenExpired = () => {
const token = localStorage.getItem('authToken');

if (!token) return true;

try {
const decodedToken = jwtDecode(token);
const currentTime = Date.now() / 1000;

return decodedToken.exp <= currentTime;
} catch {
return true;
}
};

// Utility function to get token expiration time
export const getTokenExpirationTime = () => {
const token = localStorage.getItem('authToken');

if (!token) return null;

try {
const decodedToken = jwtDecode(token);
return new Date(decodedToken.exp * 1000);
} catch {
return null;
}
};

// Utility function to refresh token if needed (implement based on your backend)
export const refreshTokenIfNeeded = async () => {
const token = localStorage.getItem('authToken');

if (!token) return false;

try {
const decodedToken = jwtDecode(token);
const currentTime = Date.now() / 1000;
const timeUntilExpiry = decodedToken.exp - currentTime;

// If token expires in less than 5 minutes, refresh it
if (timeUntilExpiry < 300) {
    // Implement your token refresh logic here
    // This will depend on your backend API
    console.log('Token refresh needed');
    return false;
}

return true;
} catch {
return false;
}
};