import { useEffect } from "react";
import { getCategories } from "./utils/api";

function App() {
  useEffect(() => {
    getCategories()
      .then((data) => console.log("API response:", data))
      .catch((error) => console.error("API error:", error));
  }, []);

  return <div>Testing API...</div>;
}

export default App;
