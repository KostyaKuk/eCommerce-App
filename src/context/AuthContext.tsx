import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getAccessTokenByRefresh } from "../api/getAccessTokenByRefresh";
import { useCookieManager } from "../hooks/useCookieManager";
import { Customer } from "@commercetools/platform-sdk";

interface AuthContextType {
  isLoggedIn: boolean;
  customer: Customer | null;
  setIsLoggedIn: (value: boolean) => void;
  setCustomer: (customer: Customer | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { cookies, setCookie, removeCookie } = useCookieManager();
  const [isLoggedIn, setIsLoggedIn] = useState(lslogin);
  const [customer, setCustomer] = useState<Customer | null>(null);

  function lslogin() {
    const authLs = localStorage.getItem("auth");
    return authLs === "true";
  }

  useEffect(() => {
    const initAuth = async () => {
      const accessToken = cookies.access_token;
      const refreshToken = cookies.refresh_token;

      const accessTokenExists = accessToken && !["", "null", "undefined"].includes(accessToken);
      const refreshTokenExists = refreshToken && !["", "null", "undefined"].includes(refreshToken);

      if (accessTokenExists) {
        setIsLoggedIn(true);
      } else if (refreshTokenExists) {
        const result = await getAccessTokenByRefresh(refreshToken);
        if (result.ok) {
          const data = await result.json();
          setCookie("access_token", data.access_token, { expires: data.expiresDate });
          setCookie("scope", data.scope);
          setCookie("token_type", data.token_type);
          setIsLoggedIn(true);
        } else {
          removeCookie("access_token");
          removeCookie("refresh_token");
          removeCookie("scope");
          removeCookie("token_type");
          setIsLoggedIn(false);
          setCustomer(null);
        }
      }
    };

    initAuth();
  }, [cookies.access_token, cookies.refresh_token, setCookie, removeCookie]);

  return (
    <AuthContext.Provider value={{ isLoggedIn, customer, setIsLoggedIn, setCustomer }}>{children}</AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
