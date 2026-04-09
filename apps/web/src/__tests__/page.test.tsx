import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";

beforeAll(() => {
	// Mock IntersectionObserver
	window.IntersectionObserver = jest.fn().mockReturnValue({
		observe: jest.fn(),
		unobserve: jest.fn(),
		disconnect: jest.fn(),
	});

	// Mock matchMedia
	window.matchMedia = jest.fn().mockReturnValue({
		matches: false,
		addEventListener: jest.fn(),
		removeEventListener: jest.fn(),
	});

	// Mock requestAnimationFrame
	window.requestAnimationFrame = jest.fn((cb) => {
		cb(0);
		return 0;
	});
	window.cancelAnimationFrame = jest.fn();
});

describe("HomePage", () => {
	it("renders the Sentinel heading", () => {
		render(<HomePage />);
		expect(screen.getByText("Sentinel")).toBeInTheDocument();
	});

	it("renders the search input", () => {
		render(<HomePage />);
		expect(
			screen.getByPlaceholderText("Search multisig wallet address..."),
		).toBeInTheDocument();
	});

	it("renders feature sections", () => {
		render(<HomePage />);
		expect(
			screen.getByText("Every Proposal, Scored Before You Sign"),
		).toBeInTheDocument();
	});
});
