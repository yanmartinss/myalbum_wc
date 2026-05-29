import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "firebase/auth";
import api from "../services/api";
import { getApiErrorMessage } from "../utils/getApiErrorMessage";

interface AuthContextType {
  user: User | null;
  carregando: boolean;
  login: (email: string, senha: string) => Promise<void>;
  cadastrar: (email: string, name: string, senha: string) => Promise<void>;
  logout: () => Promise<void>;
  erro: string | null;
  limparErro: () => void;
}

interface LoginResponse {
  token: string;
  message?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    const token = localStorage.getItem("token");
    if (email && token) {
      setUser({ email } as User);
    }
    setCarregando(false);
  }, []);

  const persistSession = (email: string, token: string) => {
    localStorage.setItem("token", token);
    localStorage.setItem("userEmail", email);
    setUser({ email } as User);
  };

  const login = async (email: string, password: string) => {
    setErro(null);
    setCarregando(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const { data } = await api.post<LoginResponse>("/user/login", {
        email: normalizedEmail,
        password,
      });

      persistSession(normalizedEmail, data.token);
    } catch (err) {
      setErro(getApiErrorMessage(err, "Não foi possível fazer login."));
      throw err;
    } finally {
      setCarregando(false);
    }
  };

  const cadastrar = async (email: string, name: string, password: string) => {
    setErro(null);
    setCarregando(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();

      await api.post("/user/register", {
        name,
        email: normalizedEmail,
        password,
      });

      const { data } = await api.post<LoginResponse>("/user/login", {
        email: normalizedEmail,
        password,
      });

      persistSession(normalizedEmail, data.token);
    } catch (err) {
      setErro(getApiErrorMessage(err, "Não foi possível cadastrar"));
      throw err;
    } finally {
      setCarregando(false);
    }
  };

  const logout = async () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    setUser(null);
  };

  const limparErro = () => setErro(null);

  return (
    <AuthContext.Provider
      value={{ user, carregando, login, cadastrar, logout, erro, limparErro }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
};
