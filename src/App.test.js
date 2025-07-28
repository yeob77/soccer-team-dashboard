import { render, screen } from '@testing-library/react';
import App from './App';

test('renders soccer team dashboard header', () => {
  render(<App />);
  const headerElement = screen.getByText(/⚽ 조기축구팀 대시보드/i);
  expect(headerElement).toBeInTheDocument();
});
