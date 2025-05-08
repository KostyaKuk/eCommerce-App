import styles from "./styles.module.css";
import { NavLink } from "react-router";
import Button from "@mui/material/Button";

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <h1 className={styles.logo}>Shop</h1>
        <div className={styles.headerButtons}>
          <NavLink to="/" end className={({ isActive }) => (isActive ? styles.linkDisabled : "")}>
            <Button variant="contained">Home</Button>
          </NavLink>
          <NavLink to="/login" className={({ isActive }) => (isActive ? styles.linkDisabled : "")} end>
            <Button variant="contained">Login</Button>
          </NavLink>
          <NavLink to="/register" className={({ isActive }) => (isActive ? styles.linkDisabled : "")}>
            <Button variant="contained">Register</Button>
          </NavLink>
        </div>
      </div>
    </header>
  );
};

export default Header;
