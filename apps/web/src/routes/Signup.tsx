import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { TriangleAlert, UserPlus } from "lucide-react";
import { useAuth } from "../lib/authContext";
import { ApiError } from "../lib/apiClient";
import { useAuthConfig } from "../lib/useAuthConfig";
import { AuthCard, FormField, inputClass, submitButtonClass } from "../components/AuthCard";

export function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const { data: authConfig, isLoading: authConfigLoading } = useAuthConfig();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const mutation = useMutation({
    mutationFn: () => signup({ fullName, email, password }),
    onSuccess: () => navigate("/upload"),
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    mutation.mutate();
  }

  if (!authConfigLoading && authConfig?.signupDisabled) {
    return (
      <AuthCard
        title="Signups are closed"
        subtitle="Self-service signup isn't available right now. Please log in, or ask an admin to create an account for you."
        footer={
          <Link to="/login" className="font-medium text-accent hover:text-accent-hover">
            Go to login
          </Link>
        }
      >
        <p className="flex items-start gap-2 text-sm text-slate-500">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          New accounts are provisioned by an administrator while public signup is disabled.
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle="Start matching your resume to real job descriptions."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-accent hover:text-accent-hover">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField id="fullName" label="Full name">
          <input
            id="fullName"
            type="text"
            autoComplete="name"
            required
            minLength={2}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={inputClass}
          />
        </FormField>
        <FormField id="email" label="Email">
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </FormField>
        <FormField id="password" label="Password">
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1.5 text-xs text-slate-400">At least 8 characters.</p>
        </FormField>

        {mutation.isError && (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-lg border-2 border-red-700 bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700"
          >
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            {mutation.error instanceof ApiError
              ? mutation.error.message
              : "Something went wrong. Please try again."}
          </p>
        )}

        <button type="submit" disabled={mutation.isPending} className={submitButtonClass}>
          <UserPlus className="h-4 w-4" />
          {mutation.isPending ? "Creating account…" : "Sign up"}
        </button>
      </form>
    </AuthCard>
  );
}
