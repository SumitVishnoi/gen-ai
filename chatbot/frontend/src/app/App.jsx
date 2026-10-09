import "./App.css";
import { router } from "./app.routes";
import { RouterProvider } from "react-router";
import { AuthProvider } from "../features/auth/context/AuthContext";
// import { useEffect } from "react";
// import useAuth from "../features/auth/hook/useAuth";

function App() {
  // const {checkAuth} = useAuth()
  
  // useEffect(() => {
  //   checkAuth();
  // }, []);

  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
