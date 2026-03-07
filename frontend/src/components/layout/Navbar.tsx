import { Link, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../store";
import { logout } from "../../store/auth.slice";
import { Button } from "../common/Button";

export const Navbar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors duration-150 ${
      isActive ? "text-indigo-600" : "text-gray-600 hover:text-gray-900"
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link
            to="/"
            className="text-lg font-bold text-gray-900 tracking-tight"
          >
            EventHub
          </Link>

          <nav className="flex items-center gap-6">
            {user ? (
              <>
                <NavLink to="/events" className={navLinkClass}>
                  Events
                </NavLink>
                <NavLink to="/my-events" className={navLinkClass}>
                  My Events
                </NavLink>
                <NavLink to="/events/create" className={navLinkClass}>
                  <Button variant="primary" size="sm">
                    + Create Event
                  </Button>
                </NavLink>
                <span className="text-sm text-gray-500">
                  {user.firstName} {user.lastName}
                </span>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={navLinkClass}>
                  Login
                </NavLink>
                <NavLink to="/register" className={navLinkClass}>
                  <Button variant="primary" size="sm">
                    Sign Up
                  </Button>
                </NavLink>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};
