import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage     from "./Component/HomePage";
import LoginPage    from "./Component/Account/Login";
import RegisterPage from "./Component/Account/Register";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"         element={<HomePage />}     />
        <Route path="/login"    element={<LoginPage />}    />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;