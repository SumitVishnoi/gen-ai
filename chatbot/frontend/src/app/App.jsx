import "./App.css";
import { router } from "./app.routes";
import { RouterProvider } from "react-router";
import { AuthProvider } from "../features/auth/context/AuthContext";

function App() {
  

  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
