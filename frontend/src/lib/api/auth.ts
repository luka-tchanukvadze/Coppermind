// login, signup, logout, forgotPassword, resetPassword
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "./client";
import type { SignupInput } from "../schemas/auth";

// sign up
async function signupRequest(input: SignupInput) {
  return apiClient.post("/users/signup", input);
}

function useSignup() {
  return useMutation({ mutationFn: signupRequest });
}

// login

// logout

export { useSignup };
