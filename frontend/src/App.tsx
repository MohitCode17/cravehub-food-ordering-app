import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Home from "./pages/Home";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import SelectRole from "./pages/SelectRole";

const App = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route element={<ProtectedRoute />}>
            {/* Protected Route */}
            <Route path="/" element={<Home />} />
            <Route path="/select-role" element={<SelectRole />} />
          </Route>
          <Route element={<PublicRoute />}>
            {/* Public Route */}
            <Route path="/login" element={<Login />} />
          </Route>
        </Routes>
        <Toaster />
      </BrowserRouter>
    </>
  );
};

export default App;
