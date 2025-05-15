import styles from "./styles.module.css";
import { NavLink } from "react-router";
import Button from "@mui/material/Button";
import { useAuth } from "../../context/AuthContext";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LogoutIcon from "@mui/icons-material/Logout";
import { IconButton } from "@mui/material";
import { useCookieManager } from "../../hooks/useCookieManager";

const Header = () => {
  const { isLoggedIn, setIsLoggedIn } = useAuth();
  const { removeCookie } = useCookieManager();

  const handleLogout = () => {
    setIsLoggedIn(false);
    removeCookie("access_token");
    removeCookie("refresh_token");
    removeCookie("scope");
    removeCookie("token_type");
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <h1 className={styles.logo}>Shop</h1>
        <div className={styles.headerButtons}>
          <NavLink to="/main" end className={({ isActive }) => (isActive ? styles.linkDisabled : "")}>
            <Button variant="contained">Home</Button>
          </NavLink>
          {!isLoggedIn && (
            <>
              <NavLink to="/login" className={({ isActive }) => (isActive ? styles.linkDisabled : "")} end>
                <Button variant="contained">Login</Button>
              </NavLink>
              <NavLink to="/register" className={({ isActive }) => (isActive ? styles.linkDisabled : "")}>
                <Button variant="contained">Register</Button>
              </NavLink>
            </>
          )}
          {isLoggedIn && (
            <>
              <IconButton aria-label="profile" color="primary">
                <PersonOutlineIcon />
              </IconButton>
              <IconButton aria-label="logout" color="primary" onClick={handleLogout}>
                <LogoutIcon />
              </IconButton>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
