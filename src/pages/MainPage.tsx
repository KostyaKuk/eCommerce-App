import Header from "../components/Header";
import Footer from "../components/Footer";

import "./MainPage.css";

const MainPage = () => {
  return (
    <div className="page-container">
      <Header activePage="home" />
      <main className="main">
        <h2>Main Page</h2>
      </main>
      <Footer />
    </div>
  );
};

export default MainPage;
