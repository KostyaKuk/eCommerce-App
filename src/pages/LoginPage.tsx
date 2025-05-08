import { useState, useEffect } from "react";

import "./LoginPage.css";

interface ValidationErrors {
  email: string;
  password: string;
}

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({ email: "", password: "" });
  const [isFormValid, setIsFormValid] = useState(false);

  const validateEmail = (value: string): string => {
    const trimmed = value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmed) return "Email is required";
    if (trimmed !== value) return "Email must not contain leading or trailing whitespace";
    if (!emailRegex.test(trimmed)) return "Email must be properly formatted (e.g., user@example.com)";
    return "";
  };

  const validatePassword = (value: string): string => {
    const trimmed = value.trim();
    if (!trimmed) return "Password is required";
    if (trimmed !== value) return "Password must not contain leading or trailing whitespace";
    if (trimmed.length < 8) return "Password must be at least 8 characters long";
    if (!/[A-Z]/.test(trimmed)) return "Password must contain at least one uppercase letter";
    if (!/[a-z]/.test(trimmed)) return "Password must contain at least one lowercase letter";
    if (!/[0-9]/.test(trimmed)) return "Password must contain at least one digit";
    return "";
  };

  useEffect(() => {
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    setErrors({ email: emailError, password: passwordError });
    setIsFormValid(!!email && !!password && !emailError && !passwordError);
  }, [email, password]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      console.log("API.........:", { email, password });
    }
  };

  return (
    <div className="page-container">
      {/* <Header activePage="login" /> */}
      <div className="form-wrapper">
        <div className="form-container">
          <h2>Login</h2>
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={errors.email ? "input-error" : ""}
                placeholder="user@example.com"
              />
              {errors.email && <span className="error-field">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={errors.password ? "input-error" : ""}
                placeholder="Enter your password"
              />
              {errors.password && <span className="error-field">{errors.password}</span>}
            </div>

            <div className="form-group checkbox">
              <input
                type="checkbox"
                id="showPassword"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
              />
              <label htmlFor="showPassword">Show Password</label>
            </div>

            <button type="submit" disabled={!isFormValid} className={`submit-button ${isFormValid ? "" : "disabled"}`}>
              Login
            </button>
          </form>
        </div>
      </div>
      {/* <Footer /> */}
    </div>
  );
};

export default LoginPage;
