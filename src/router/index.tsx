import { Routes, Route } from "react-router";
import App from "../App";
import LoginPage from "../pages/LoginPage";
import MainPage from "../pages/MainPage";
import { RegisterPage } from "../pages/RegisterPage";

export const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<MainPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
      </Route>
    </Routes>
  );
};
