import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-20 bg-white/60 backdrop-blur-md shadow-sm">
      <div className="max-w-6xl mx-auto px-5 py-3 flex items-center">
        <Link
          to="/dashboard"
          className="font-extrabold text-xl bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent hover:scale-105 transition"
        >
          PayStreet 💸
        </Link>

        <div className="ml-10 flex gap-6 font-medium text-slate-700">
          {token && (
            <>
              <Link
                className="hover:text-indigo-600 transition"
                to="/beneficiaries"
              >
                Beneficiaries
              </Link>
              <Link className="hover:text-indigo-600 transition" to="/transfer">
                Transfer
              </Link>
              <Link
                className="hover:text-indigo-600 transition"
                to="/transactions"
              >
                History
              </Link>
              {role === "admin" && (
                <Link className="hover:text-indigo-600 transition" to="/admin">
                  Admin
                </Link>
              )}
            </>
          )}
        </div>

        <div className="ml-auto flex gap-3">
          {!token ? (
            <>
              <Link
                to="/login"
                className="px-4 py-2 rounded-md text-indigo-600 border border-indigo-600 hover:bg-indigo-600 hover:text-white transition"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 rounded-md bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:opacity-90 transition"
              >
                Signup
              </Link>
            </>
          ) : (
            <button
              onClick={logout}
              className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
