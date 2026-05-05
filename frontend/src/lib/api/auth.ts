// login, signup, logout, forgotPassword, resetPassword
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "./client";
import type { LoginInput, SignupInput } from "../schemas/auth";

// sign up
async function signupRequest(input: SignupInput) {
  return apiClient.post("/users/signup", input);
}

function useSignup() {
  return useMutation({ mutationFn: signupRequest });
}

// login
async function loginRequest(input: LoginInput) {
  return apiClient.post("/users/login", input);
}

function useLogin() {
  return useMutation({
    mutationFn: loginRequest,
  });
}

// logout

export { useSignup, useLogin };
