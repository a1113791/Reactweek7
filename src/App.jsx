import { useState } from "react";
import Login from "./pages/Login";
import Product from "./pages/Product";

function App() {
  const [isAuth, setIsAuth] = useState(false);

  return (
    <>
      {isAuth ? (
        <Product setIsAuth={setIsAuth} />
      ) : (
        <Login setIsAuth={setIsAuth} />
      )}
    </>
  );
}

export default App;
