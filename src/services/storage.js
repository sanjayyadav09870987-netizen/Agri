/**
 * AgriTradeX Local Storage & Authentication Service
 */

const USERS_STORAGE_KEY = 'agritradex_users';
const CURRENT_USER_KEY = 'agritradex_current_user';
const OTP_STORE_KEY = 'agritradex_active_otps';

const DEFAULT_DEMO_USERS = [
  {
    id: 'usr_demo_farmer_1',
    userType: 'farmer',
    fullName: 'Ramesh Kumar',
    mobileNumber: '9876543210',
    aadhaarNumber: '123456789012',
    panNumber: 'ABCDE1234F',
    landAcres: '5.5',
    landSurveyNumber: 'SY-402/1A',
    village: 'Rampur',
    mandal: 'Shamirpet',
    district: 'Medchal',
    pincode: '500078',
    registeredAt: '2026-09-01T10:00:00.000Z'
  },
  {
    id: 'usr_demo_farmer_2',
    userType: 'farmer',
    fullName: 'Kisan Demo Farmer',
    mobileNumber: '9999999999',
    aadhaarNumber: '987654321098',
    panNumber: 'FGHIJ5678K',
    landAcres: '8.0',
    landSurveyNumber: 'SY-108/3C',
    village: 'Kazipet',
    mandal: 'Hanamkonda',
    district: 'Warangal',
    pincode: '506004',
    registeredAt: '2026-09-01T10:00:00.000Z'
  },
  {
    id: 'usr_demo_vendor_1',
    userType: 'vendor',
    fullName: 'Priya Sharma',
    mobileNumber: '9123456780',
    aadhaarNumber: '234567890123',
    panNumber: 'BCDEF2345G',
    companyName: 'Apex Agri Traders Pvt Ltd',
    companyId: 'APEX-9988',
    village: 'Indiranagar',
    mandal: 'Bengaluru East',
    district: 'Bengaluru Urban',
    pincode: '560038',
    registeredAt: '2026-09-01T10:00:00.000Z'
  }
];

// Retrieve all registered users (pre-seeded with default demo accounts)
export const getStoredUsers = () => {
  try {
    const data = localStorage.getItem(USERS_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_DEMO_USERS));
      return DEFAULT_DEMO_USERS;
    }
    const parsed = JSON.parse(data);
    // Ensure default demo accounts always exist
    let updated = false;
    DEFAULT_DEMO_USERS.forEach((demo) => {
      if (!parsed.some((u) => u.mobileNumber === demo.mobileNumber)) {
        parsed.push(demo);
        updated = true;
      }
    });
    if (updated) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(parsed));
    }
    return parsed;
  } catch (err) {
    console.error('Error reading users from localStorage', err);
    return DEFAULT_DEMO_USERS;
  }
};

// Find user by mobile number
export const findUserByMobile = (mobile) => {
  const users = getStoredUsers();
  const cleanedMobile = mobile.trim();
  return users.find((u) => u.mobileNumber === cleanedMobile) || null;
};

// Register a new user (Farmer or Vendor)
export const registerUser = (userData) => {
  const users = getStoredUsers();
  const cleanedMobile = userData.mobileNumber.trim();
  
  // Check if mobile is already registered
  const existing = users.find((u) => u.mobileNumber === cleanedMobile);
  if (existing) {
    return {
      success: false,
      message: 'A user with this mobile number is already registered. Please login.'
    };
  }

  const newUser = {
    id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    ...userData,
    mobileNumber: cleanedMobile,
    registeredAt: new Date().toISOString()
  };

  users.push(newUser);
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    return {
      success: true,
      user: newUser,
      message: 'Registration successful! You can now log in.'
    };
  } catch (err) {
    console.error('Error saving user to localStorage', err);
    return {
      success: false,
      message: 'Failed to save registration data. Please check storage permissions.'
    };
  }
};

// Generate Development OTP for a mobile number
export const generateOtp = (mobile) => {
  const cleanedMobile = mobile.trim();
  // Generate random 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  try {
    const raw = localStorage.getItem(OTP_STORE_KEY);
    const store = raw ? JSON.parse(raw) : {};
    store[cleanedMobile] = {
      otp,
      createdAt: Date.now()
    };
    localStorage.setItem(OTP_STORE_KEY, JSON.stringify(store));
  } catch (err) {
    console.error('Error saving OTP', err);
  }

  return otp;
};

// Verify OTP for a mobile number
export const verifyOtp = (mobile, enteredOtp) => {
  const cleanedMobile = mobile.trim();
  const cleanedOtp = enteredOtp.trim();

  try {
    const raw = localStorage.getItem(OTP_STORE_KEY);
    const store = raw ? JSON.parse(raw) : {};
    const record = store[cleanedMobile];

    // For testing ease, allow standard default dev OTP '123456' OR the dynamically generated OTP
    if (cleanedOtp === '123456' || (record && record.otp === cleanedOtp)) {
      return { success: true };
    }

    return {
      success: false,
      message: 'Invalid OTP. Please enter the correct 6-digit OTP or default test OTP 123456.'
    };
  } catch (err) {
    return {
      success: false,
      message: 'OTP verification failed. Please try again.'
    };
  }
};

// Session Management
export const getCurrentUser = () => {
  try {
    const data = localStorage.getItem(CURRENT_USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    return null;
  }
};

export const setCurrentUser = (user) => {
  try {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  } catch (err) {
    console.error('Error managing session in localStorage', err);
  }
};

export const logoutUser = () => {
  setCurrentUser(null);
};
