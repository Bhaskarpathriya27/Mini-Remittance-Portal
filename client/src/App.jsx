import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import AuthLogin from "./pages/AuthLogin";
import AuthSignup from "./pages/AuthSignup";
import Dashboard from "./pages/Dashboard";
import Beneficiaries from "./pages/Beneficiaries";
import Transfer from "./pages/Transfer";
import Transactions from "./pages/Transactions";
import AdminHome from "./pages/Admin/AdminHome";
import Users from "./pages/Admin/Users";
import AdminTransactions from "./pages/Admin/AdminTransactions";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div className="max-w-6xl mx-auto p-4">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/login" element={<AuthLogin />} />
          <Route path="/signup" element={<AuthSignup />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/beneficiaries" element={<Beneficiaries />} />
            <Route path="/transfer" element={<Transfer />} />
            <Route path="/transactions" element={<Transactions />} />
          </Route>

          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminHome />} />
            <Route path="/admin/users" element={<Users />} />
            <Route path="/admin/transactions" element={<AdminTransactions />} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}
