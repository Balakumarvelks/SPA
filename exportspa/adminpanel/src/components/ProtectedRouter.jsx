import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";

export function RequireAuth({ children }) {
    const auth = Cookies.get('malar_admin_token');;
    return auth ? children : <Navigate to="/signin" replace />;
}



export function RedirectAuth({ children }) {
    const auth = Cookies.get('malar_admin_token');;
    return !auth ? children : <Navigate to="/dashboard" replace />;
}
