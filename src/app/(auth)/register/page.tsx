import type { Metadata } from "next";
import RegisterComponent from "@/components/auth/RegisterComponent";

export const metadata: Metadata = {
  title: "הרשמה",
};

const RegisterPage = () => {
  return <RegisterComponent />;
};

export default RegisterPage;
