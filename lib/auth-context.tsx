import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type UserRole = "admin" | "subscriber" | "none";

export interface AuthContextType {
  role: UserRole;
  isAuthenticated: boolean;
  userToken: string | null;
  adminPassword: string;
  login: (password: string, isAdmin: boolean) => Promise<boolean>;
  logout: () => Promise<void>;
  changeAdminPassword: (oldPassword: string, secret: string, newPassword: string) => Promise<boolean>;
  generateToken: (plan: "12h" | "weekly" | "monthly" | "yearly") => Promise<string>;
  validateToken: (token: string) => Promise<boolean>;
  setUserToken: (token: string) => Promise<void>;
  getSubscriptionStatus: () => Promise<{ plan: string; expiresAt: number } | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_PASSWORD_KEY = "admin_password";
const ADMIN_SECRET_KEY = "admin_secret";
const USER_TOKEN_KEY = "user_token";
const TOKEN_EXPIRY_KEY = "token_expiry";
const DEFAULT_ADMIN_PASSWORD = "#AllOfThem-3301";
const ADMIN_SECRET = "MerleoskinMerleoskin77";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole>("none");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userToken, setUserTokenState] = useState<string | null>(null);
  const [adminPassword, setAdminPasswordState] = useState(DEFAULT_ADMIN_PASSWORD);

  // Initialize on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // Check if admin is logged in
      const adminLoginTime = await AsyncStorage.getItem("admin_login_time");
      if (adminLoginTime) {
        const loginTime = parseInt(adminLoginTime);
        const now = Date.now();
        const sessionDuration = 24 * 60 * 60 * 1000; // 24 hours
        if (now - loginTime < sessionDuration) {
          setRole("admin");
          setIsAuthenticated(true);
          return;
        }
      }

      // Check if user has valid token
      const token = await AsyncStorage.getItem(USER_TOKEN_KEY);
      const expiry = await AsyncStorage.getItem(TOKEN_EXPIRY_KEY);
      if (token && expiry) {
        const expiryTime = parseInt(expiry);
        if (Date.now() < expiryTime) {
          setUserTokenState(token);
          setRole("subscriber");
          setIsAuthenticated(true);
          return;
        } else {
          // Token expired
          await AsyncStorage.removeItem(USER_TOKEN_KEY);
          await AsyncStorage.removeItem(TOKEN_EXPIRY_KEY);
        }
      }

      setRole("none");
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Auth initialization error:", error);
      setRole("none");
      setIsAuthenticated(false);
    }
  };

  const login = async (password: string, isAdmin: boolean): Promise<boolean> => {
    try {
      if (isAdmin) {
        const storedPassword = await AsyncStorage.getItem(ADMIN_PASSWORD_KEY);
        const correctPassword = storedPassword || DEFAULT_ADMIN_PASSWORD;
        if (password === correctPassword) {
          await AsyncStorage.setItem("admin_login_time", Date.now().toString());
          setRole("admin");
          setIsAuthenticated(true);
          setAdminPasswordState(correctPassword);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("admin_login_time");
      setRole("none");
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const changeAdminPassword = async (
    oldPassword: string,
    secret: string,
    newPassword: string
  ): Promise<boolean> => {
    try {
      // Verify secret
      if (secret !== ADMIN_SECRET) {
        return false;
      }

      // Verify old password
      const storedPassword = await AsyncStorage.getItem(ADMIN_PASSWORD_KEY);
      const correctPassword = storedPassword || DEFAULT_ADMIN_PASSWORD;
      if (oldPassword !== correctPassword) {
        return false;
      }

      // Update password
      await AsyncStorage.setItem(ADMIN_PASSWORD_KEY, newPassword);
      setAdminPasswordState(newPassword);
      return true;
    } catch (error) {
      console.error("Password change error:", error);
      return false;
    }
  };

  const generateToken = async (plan: "12h" | "weekly" | "monthly" | "yearly"): Promise<string> => {
    try {
      const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      let expiryMs = 0;

      switch (plan) {
        case "12h":
          expiryMs = 12 * 60 * 60 * 1000;
          break;
        case "weekly":
          expiryMs = 7 * 24 * 60 * 60 * 1000;
          break;
        case "monthly":
          expiryMs = 30 * 24 * 60 * 60 * 1000;
          break;
        case "yearly":
          expiryMs = 365 * 24 * 60 * 60 * 1000;
          break;
      }

      const expiryTime = Date.now() + expiryMs;
      await AsyncStorage.setItem(`token_${token}`, JSON.stringify({ plan, expiryTime }));
      return token;
    } catch (error) {
      console.error("Token generation error:", error);
      throw error;
    }
  };

  const validateToken = async (token: string): Promise<boolean> => {
    try {
      const tokenData = await AsyncStorage.getItem(`token_${token}`);
      if (!tokenData) {
        return false;
      }

      const { expiryTime } = JSON.parse(tokenData);
      return Date.now() < expiryTime;
    } catch (error) {
      console.error("Token validation error:", error);
      return false;
    }
  };

  const setUserToken = async (token: string) => {
    try {
      const isValid = await validateToken(token);
      if (isValid) {
        await AsyncStorage.setItem(USER_TOKEN_KEY, token);
        setUserTokenState(token);
        setRole("subscriber");
        setIsAuthenticated(true);

        // Get expiry time
        const tokenData = await AsyncStorage.getItem(`token_${token}`);
        if (tokenData) {
          const { expiryTime } = JSON.parse(tokenData);
          await AsyncStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
        }
      }
    } catch (error) {
      console.error("Set user token error:", error);
    }
  };

  const getSubscriptionStatus = async () => {
    try {
      const token = await AsyncStorage.getItem(USER_TOKEN_KEY);
      if (!token) {
        return null;
      }

      const tokenData = await AsyncStorage.getItem(`token_${token}`);
      if (!tokenData) {
        return null;
      }

      const { plan, expiryTime } = JSON.parse(tokenData);
      return { plan, expiresAt: expiryTime };
    } catch (error) {
      console.error("Get subscription status error:", error);
      return null;
    }
  };

  const value: AuthContextType = {
    role,
    isAuthenticated,
    userToken,
    adminPassword,
    login,
    logout,
    changeAdminPassword,
    generateToken,
    validateToken,
    setUserToken,
    getSubscriptionStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
