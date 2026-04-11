import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/login";
  };

  // setUser wrapper that also syncs to localStorage
  const updateUser = (data) => {
    if (data) localStorage.setItem("user", JSON.stringify(data));
    else { localStorage.removeItem("user"); localStorage.removeItem("token"); }
    setUser(data);
  };

  return (
    <AuthContext.Provider value={{ user, logout, setUser: updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}