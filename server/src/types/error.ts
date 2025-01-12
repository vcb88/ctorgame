export interface ErrorWithStack {
  message?: string;
  stack?: string;
  code?: string | number;
  type?: string;
  [key: string]: unknown;
}