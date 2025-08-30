import '@testing-library/jest-dom'

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R
      toHaveTextContent(text: string | RegExp): R
      toHaveValue(value: string | number): R
      toBeDisabled(): R
      toBeEnabled(): R
      toBeVisible(): R
      toHaveClass(className: string): R
      toHaveAttribute(attribute: string, value?: string): R
    }
  }
}
