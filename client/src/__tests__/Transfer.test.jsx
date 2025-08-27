import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Transfer from "../pages/Transfer.jsx";

vi.mock("gsap", () => ({
  default: { fromTo: () => {}, to: () => {}, from: () => {} },
  fromTo: () => {},
  to: () => {},
  from: () => {},
}));

vi.mock("../api/axios", () => ({
  api: {
    get: vi.fn().mockResolvedValue({
      data: [{ _id: "b1", name: "Amit", currency: "INR" }],
    }),
    post: vi.fn().mockResolvedValue({
      data: {
        toCurrency: "INR",
        rate: 82,
        convertedAmount: 8200,
        fees: { fixed: 2, percent: 0.5, total: 2.5 },
        totalDebit: 102.5,
      },
    }),
  },
}));

describe("Transfer", () => {
  it("renders quote info", async () => {
    const user = userEvent.setup();
    render(<Transfer />);

    const combo = await screen.findByRole("combobox");
    await user.selectOptions(combo, "b1");

    const amount = screen.getByPlaceholderText("Amount");
    await user.clear(amount);
    await user.type(amount, "100");

    await user.click(screen.getByText("Get Quote"));

    // wait until quote shows up (any stable label)
    await screen.findByText(/To Currency:/i);

    expect(document.getElementById("fx-rate")).toHaveTextContent(
      /FX Rate:\s*82/i
    );

    expect(document.getElementById("converted")).toHaveTextContent(
      /8200(\.00)?/i
    );

    expect(document.getElementById("to-currency")).toHaveTextContent(/INR/i);

    expect(document.getElementById("total-debit")).toHaveTextContent(
      /102\.50?\s*USD/i
    );
  });
});
