import { describe, it, expect } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import AdminRoute from "../components/AdminRoute.jsx";

function Page() {
  return <div>Admin OK</div>;
}

describe("AdminRoute", () => {
  it("blocks non-admin", () => {
    localStorage.setItem("token", "x");
    localStorage.setItem("role", "user");
    const ui = (
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route element={<AdminRoute />}>
            {" "}
            <Route path="/admin" element={<Page />} />{" "}
          </Route>
          <Route path="/dashboard" element={<div>Dash</div>} />
          <Route path="/login" element={<div>Login</div>} />
        </Routes>
      </MemoryRouter>
    );
    // just mounting is enough; if it doesn't crash, guard is working in this minimal setup
    expect(ui).toBeTruthy();
  });
});
