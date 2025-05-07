import "./Header.css";

interface HeaderProps {
  activePage: "home" | "login" | "register";
}

const Header = ({ activePage }: HeaderProps) => {
  return (
    <header className="header">
      <div className="header-content">
        <h1 className="logo">Shop</h1>
        <div className="header-buttons">
          <button className={`header-button ${activePage === "home" ? "active" : ""}`} disabled={activePage === "home"}>
            Home
          </button>
          <button
            className={`header-button ${activePage === "login" ? "active" : ""}`}
            disabled={activePage === "login"}
          >
            Login
          </button>
          <button
            className={`header-button ${activePage === "register" ? "active" : ""}`}
            disabled={activePage === "register"}
          >
            Register
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
