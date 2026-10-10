import { Navigate } from "react-router-dom";
import { getCurrentUser } from "../api";

function ProtectedRoute({ children }) {
  const user = getCurrentUser();

  if (!user || !user.username) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
