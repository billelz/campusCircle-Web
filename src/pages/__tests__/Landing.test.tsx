import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { Landing } from "../Landing"

describe("Landing", () => {
  it("renders primary sections and calls to action", () => {
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>
    )

    expect(screen.getByRole("img", { name: /campuscircle logo/i })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /login/i })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /sign up/i })).toBeInTheDocument()

    expect(screen.getByRole("heading", { name: /what is campuscircle\?/i })).toBeInTheDocument()
    expect(
      screen.getByRole("heading", { name: /everything a campus needs to stay aligned/i })
    ).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: /from student voices to campus action/i })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: /because student trust is a growth engine/i })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: /what our students say about us/i })).toBeInTheDocument()

    expect(
      screen.getByText(/building trusted campus communities through insight, transparency, and action/i)
    ).toBeInTheDocument()
  })
})
