import { Navigate } from "react-router-dom";

const ProtectedRoutes = ({ children }) => {
  const token = localStorage.getItem("refreshToken");
  return token ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoutes;
