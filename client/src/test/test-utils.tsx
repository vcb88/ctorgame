import React from 'react';
import { render } from '@testing-library/react';
import { vi } from 'vitest';

// Custom render для компонентов с провайдерами
const customRender = (ui: React.ReactElement, options = {}) =>
  render(ui, {
    wrapper: ({ children }) => children,
    ...options,
  });

// Создание mock для Socket.IO
export const createMockSocket = () => {
  const mockEmit = vi.fn();
  const mockOn = vi.fn();
  const mockOff = vi.fn();
  const mockClose = vi.fn();

  return {
    emit: mockEmit,
    on: mockOn,
    off: mockOff,
    close: mockClose,
    mockEmit,
    mockOn,
    mockOff,
    mockClose,
  };
};

// Экспортируем все методы из testing-library
export * from '@testing-library/react';
export { customRender as render };