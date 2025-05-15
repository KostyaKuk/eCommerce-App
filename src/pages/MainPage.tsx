import { Toaster } from "react-hot-toast";
import "./MainPage.css";

const MainPage = () => {
  return (
    <div className="page-container">
      <Toaster />
      <main className="main">
        <h2>Main Page</h2>
      </main>
    </div>
  );
};

export default MainPage;
