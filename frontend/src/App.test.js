import { render, screen } from '@testing-library/react';
import App from './App';

beforeEach(() => {
  // the Live Tracking section calls the backend on load; fake an empty reply
  global.fetch = jest.fn(() => Promise.resolve({ json: () => Promise.resolve([]) }));
});

test('renders the navbar title', () => {
  render(<App />);
  expect(screen.getByText("Kochi Water Metro")).toBeInTheDocument();
});