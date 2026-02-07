import { render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { Auth } from "../Auth"

const renderAuth = (initialEntry = "/auth") =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/auth" element={<Auth />} />
      </Routes>
    </MemoryRouter>
  )

describe("Auth", () => {
  it("defaults to login mode", () => {
    renderAuth()

    expect(screen.getByRole("img", { name: /campuscircle logo/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/username or email/i)).toBeInTheDocument()
    expect(screen.queryByLabelText(/university email/i)).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument()
  })

  it("switches to register mode via query param", () => {
    renderAuth("/auth?mode=register")

    expect(screen.getByLabelText(/university email/i)).toBeInTheDocument()
    expect(screen.queryByLabelText(/username or email/i)).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: /create account/i })).toBeInTheDocument()
  })
})
