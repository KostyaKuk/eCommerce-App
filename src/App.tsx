import { Outlet } from "react-router";
import "./global.css";
import Footer from "./components/Footer";
import Header from "./components/Header";

// Раскомментировать нужное (Запрос на сервер || LOGIN страница || MAIN страница)
// API TESTING ......
// import { useEffect } from "react";
// import { getCategories } from "./utils/api";

// function App() {
//   useEffect(() => {
//     getCategories()
//       .then((data) => console.log("API response:", data))
//       .catch((error) => console.error("API error:", error));
//   }, []);

//   return <div>Testing API...</div>;
// }

// MAIN PAGE || LOGIN PAGE
//
function App() {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
}

export default App;
