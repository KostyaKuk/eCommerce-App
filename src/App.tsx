import "./global.css";

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

import LoginPage from "./pages/LoginPage";
// import MainPage from "./pages/MainPage";

function App() {
  return <LoginPage />;
  // return <MainPage />;
}

export default App;
