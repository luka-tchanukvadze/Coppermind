// login, signup, logout, forgotPassword, resetPassword
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "./client";
import type {
  ForgotPasswordInput,
  LoginInput,
  ResetPasswordInput,
  SignupInput,
} from "../schemas/auth";

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
async function logoutRequest() {
  return apiClient.post("/users/logout");
}

function useLogout() {
  return useMutation({
    mutationFn: logoutRequest,
  });
}

// forgot password - sends a reset link to the email (200 either way for privacy)
async function forgotPasswordRequest(input: ForgotPasswordInput) {
  return apiClient.post("/users/forgotPassword", input);
}

function useForgotPassword() {
  return useMutation({ mutationFn: forgotPasswordRequest });
}

// reset password - token comes from the email link, body has the new password
type ResetPasswordRequestInput = ResetPasswordInput & { token: string };
async function resetPasswordRequest({
  token,
  ...body
}: ResetPasswordRequestInput) {
  return apiClient.patch(`/users/resetPassword/${token}`, body);
}

function useResetPassword() {
  return useMutation({ mutationFn: resetPasswordRequest });
}

export {
  useSignup,
  useLogin,
  useLogout,
  useForgotPassword,
  useResetPassword,
};
