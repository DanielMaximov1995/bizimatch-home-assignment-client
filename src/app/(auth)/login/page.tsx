import type { Metadata } from "next";
import LoginComponent from "@/components/auth/LoginComponent";

export const metadata: Metadata = {
  title: "התחברות",
};

const LoginPage = () => {
  return <LoginComponent />;
};

export default LoginPage;
