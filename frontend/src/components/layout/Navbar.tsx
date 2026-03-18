import { useState, useEffect, useCallback } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../store";
import { logout } from "../../store/auth.slice";
import { Button } from "../common/Button";

import iconEvents from "../../assets/icons/icon-events.svg";
import iconCalendar from "../../assets/icons/icon-calendar.svg";
import iconPlus from "../../assets/icons/icon-plus.svg";
import iconUser from "../../assets/icons/icon-user.svg";
import iconLogout from "../../assets/icons/icon-logout.svg";
import iconClose from "../../assets/icons/icon-close.svg";

export const Navbar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);

  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") setMenuOpen(false);
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    closeMenu();
    dispatch(logout());
    navigate("/login");
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-1.5 text-sm font-medium transition-colors duration-150 ${
      isActive ? "text-indigo-600" : "text-gray-600 hover:text-gray-900"
    }`;

  const burgerLinkClass = ({ isActive }: { isActive: boolean }) =>
    `burger-nav-link ${isActive ? "active" : ""}`;

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <Link
              to="/"
              className="text-lg font-bold text-gray-900 tracking-tight"
            >
              EventHub
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              {user ? (
                <>
                  <NavLink to="/events" className={navLinkClass}>
                    <img
                      src={iconEvents}
                      alt=""
                      className="nav-icon"
                      aria-hidden="true"
                    />
                    Events
                  </NavLink>

                  <NavLink to="/my-events" className={navLinkClass}>
                    <img
                      src={iconCalendar}
                      alt=""
                      className="nav-icon"
                      aria-hidden="true"
                    />
                    My Events
                  </NavLink>

                  <NavLink to="/ai-assistant" className={navLinkClass}>
                    <span className="text-base leading-none" aria-hidden="true">
                      🤖
                    </span>
                    AI Assistant
                  </NavLink>

                  <NavLink to="/events/create" className="flex items-center">
                    <Button variant="primary" size="sm">
                      <img
                        src={iconPlus}
                        alt=""
                        className="nav-icon mr-1"
                        aria-hidden="true"
                      />
                      Create Event
                    </Button>
                  </NavLink>

                  <div className="nav-divider" aria-hidden="true" />

                  <div className="flex items-center gap-2">
                    <div className="nav-user-avatar">
                      <img src={iconUser} alt="" aria-hidden="true" />
                    </div>
                    <span className="text-sm text-gray-700 font-medium">
                      {user.firstName} {user.lastName}
                    </span>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors duration-150"
                    aria-label="Logout"
                    title="Logout"
                  >
                    <img src={iconLogout} alt="Logout" className="nav-icon" />
                  </button>
                </>
              ) : (
                <>
                  <NavLink to="/login" className={navLinkClass}>
                    Login
                  </NavLink>
                  <NavLink to="/register" className="flex items-center">
                    <Button variant="primary" size="sm">
                      Sign Up
                    </Button>
                  </NavLink>
                </>
              )}
            </nav>

            <button
              className={`burger-icon md:!hidden ${menuOpen ? "active" : ""}`}
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              data-expanded={menuOpen}
              type="button"
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <div
        className={`burger-overlay md:hidden ${menuOpen ? "open" : ""}`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      <nav
        className={`burger-menu md:hidden ${menuOpen ? "open" : ""}`}
        aria-label="Mobile navigation"
      >
        <button
          className="burger-close-btn"
          onClick={closeMenu}
          aria-label="Close menu"
        >
          <img src={iconClose} alt="" aria-hidden="true" />
        </button>

        {user ? (
          <>
            <NavLink
              to="/events"
              className={burgerLinkClass}
              onClick={closeMenu}
            >
              <img src={iconEvents} alt="" aria-hidden="true" />
              Events
            </NavLink>

            <NavLink
              to="/my-events"
              className={burgerLinkClass}
              onClick={closeMenu}
            >
              <img src={iconCalendar} alt="" aria-hidden="true" />
              My Events
            </NavLink>

            <NavLink
              to="/ai-assistant"
              className={burgerLinkClass}
              onClick={closeMenu}
            >
              <span className="text-base leading-none" aria-hidden="true">
                🤖
              </span>
              AI Assistant
            </NavLink>

            <NavLink
              to="/events/create"
              className="burger-create-btn"
              onClick={closeMenu}
            >
              <img src={iconPlus} alt="" aria-hidden="true" />
              Create Event
            </NavLink>

            <div className="burger-user-info">
              <img src={iconUser} alt="" aria-hidden="true" />
              <span>
                {user.firstName} {user.lastName}
              </span>
            </div>

            <button className="burger-logout-btn" onClick={handleLogout}>
              <img src={iconLogout} alt="" aria-hidden="true" />
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink
              to="/login"
              className={burgerLinkClass}
              onClick={closeMenu}
            >
              Login
            </NavLink>
            <NavLink
              to="/register"
              className={burgerLinkClass}
              onClick={closeMenu}
            >
              Sign Up
            </NavLink>
          </>
        )}
      </nav>
    </>
  );
};
