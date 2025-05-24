import React, { useState } from "react";
import styles from "./styles.module.css";
import { NavLink, useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import { useAuth } from "../../context/AuthContext";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LogoutIcon from "@mui/icons-material/Logout";
import { IconButton, Drawer, Box } from "@mui/material";
import { useCookieManager } from "../../hooks/useCookieManager";
import MenuIcon from "@mui/icons-material/Menu";

const Header = () => {
  const { isLoggedIn, setIsLoggedIn } = useAuth();
  const { removeCookie } = useCookieManager();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsLoggedIn(false);
    removeCookie("access_token");
    removeCookie("refresh_token");
    removeCookie("scope");
    removeCookie("token_type");
    setMobileOpen(false);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const closeMobileMenu = () => setMobileOpen(false);

  const handleProfileClick = () => {
    if (mobileOpen) closeMobileMenu();
    navigate("/profile");
  };

  const renderNavLinks = (isMobile = false) => (
    <>
      <NavLink
        to="/main"
        end
        className={({ isActive }) => (isActive ? styles.linkDisabled : "")}
        onClick={isMobile ? closeMobileMenu : undefined}
      >
        <Button variant="contained" fullWidth sx={{ mb: 1 }}>
          Home
        </Button>
      </NavLink>
      {!isLoggedIn ? (
        <>
          <NavLink
            to="/login"
            className={({ isActive }) => (isActive ? styles.linkDisabled : "")}
            end
            onClick={isMobile ? closeMobileMenu : undefined}
          >
            <Button variant="contained" fullWidth sx={{ mb: 1 }}>
              Login
            </Button>
          </NavLink>
          <NavLink
            to="/register"
            className={({ isActive }) => (isActive ? styles.linkDisabled : "")}
            onClick={isMobile ? closeMobileMenu : undefined}
          >
            <Button variant="contained" fullWidth>
              Register
            </Button>
          </NavLink>
        </>
      ) : (
        <>
          <IconButton
            aria-label="profile"
            color="primary"
            sx={{ display: "block", mx: "auto", mb: 1 }}
            onClick={isMobile ? handleProfileClick : handleProfileClick}
          >
            <PersonOutlineIcon />
          </IconButton>
          <IconButton
            aria-label="logout"
            color="primary"
            onClick={isMobile ? handleLogout : handleLogout}
            sx={{ display: "block", mx: "auto" }}
          >
            <LogoutIcon />
          </IconButton>
        </>
      )}
    </>
  );

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <NavLink to="/main" className={styles.logoLink}>
          <img src="/assets/logo.png" alt="Shop Logo" className={styles.logo} />
        </NavLink>

        <div className={styles.desktopNav}>{renderNavLinks()}</div>

        <IconButton
          sx={{
            display: { xs: "flex", md: "none" },
            color: "inherit",
          }}
          aria-label="menu"
          edge="end"
          onClick={handleDrawerToggle}
        >
          <MenuIcon />
        </IconButton>

        <Drawer anchor="right" open={mobileOpen} onClose={handleDrawerToggle}>
          <Box className={styles.mobileMenuContainer}>{renderNavLinks(true)}</Box>
        </Drawer>
      </div>
    </header>
  );
};

export default Header;
