import React, { createContext, useState } from "react";

const AuthContext = createContext();
const BASE_URL = import.meta.env.VITE_BASE_URL;

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null); // <-- tambahkan ini

  const login = async (email, password) => {
    let data;
    try {
      const res = await fetch(`${BASE_URL}/api/users/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login gagal");
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }

    setIsAuthenticated(true);
    setUser(data.user); // sekarang sudah ada state 'user'
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null); // reset user saat logout
  };

  const register = async (email, password, confirmPassword) => {
    if (!email || !password || !confirmPassword) {
      throw new Error("Semua field harus diisi");
    }
    if (password !== confirmPassword) {
      throw new Error("Password dan konfirmasi tidak sama");
    }
    const res = await fetch(`${BASE_URL}/api/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Register gagal");
    }
    console.log("Registration successful");
    return true;
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };
