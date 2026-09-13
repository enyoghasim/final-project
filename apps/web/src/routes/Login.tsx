import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { LogIn, TriangleAlert } from "lucide-react";
import { useAuth } from "../lib/authContext";
import { ApiError } from "../lib/apiClient";
import { AuthCard, FormField, inputClass, submitButtonClass } from "../components/AuthCard";

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const mutation = useMutation({
    mutationFn: () => login({ email, password }),
    onSuccess: () => navigate("/upload"),
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    mutation.mutate();
  }

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Log in to continue evaluating resumes."
      footer={
        <>
          No account?{" "}
          <Link to="/signup" className="font-medium text-accent hover:text-accent-hover">
            Sign up
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
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
            autoComplete="current-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </FormField>

        {mutation.isError && (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700"
          >
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            {mutation.error instanceof ApiError
              ? mutation.error.message
              : "Something went wrong. Please try again."}
          </p>
        )}

        <button type="submit" disabled={mutation.isPending} className={submitButtonClass}>
          <LogIn className="h-4 w-4" />
          {mutation.isPending ? "Logging in…" : "Log in"}
        </button>
      </form>
    </AuthCard>
  );
}
