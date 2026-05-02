// login, signup, logout, forgotPassword, resetPassword
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "./client";

type SignupInput = {
  name: string;
  email: string;
  password: string;
  password_confirm: string;
  photo?: string;
};

async function signupRequest(input: SignupInput) {
  return apiClient.post("/users/signup", input);
}

function useSignup() {
  return useMutation({ mutationFn: signupRequest });
}

export { useSignup };
