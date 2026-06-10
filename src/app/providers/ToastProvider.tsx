import type { PropsWithChildren } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const ToastProvider = ({ children }: PropsWithChildren) => (
  <>
    {children}
    <ToastContainer position="top-right" autoClose={3000} hideProgressBar theme="colored" />
  </>
);

ToastProvider.displayName = 'ToastProvider';
