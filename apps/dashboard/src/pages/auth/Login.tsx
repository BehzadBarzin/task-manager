import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "../../Providers/AuthProvider";
import { Link, useNavigate } from "react-router";
import type { authTypes } from "@task-manager/data";
import { useQueryClient } from "@tanstack/react-query";

// -------------------------------------------------------------------------------------------------
// API body type
type LoginDto = authTypes.components["schemas"]["LoginDto"];

// -------------------------------------------------------------------------------------------------
// Form validation schema
const schema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

// -------------------------------------------------------------------------------------------------
const Login: React.FC = () => {
  // -----------------------------------------------------------------------------------------------
  // Get login function from auth store
  const { login } = useAuth();
  // -----------------------------------------------------------------------------------------------
  // Get navigate function to redirect
  const navigate = useNavigate();
  // -----------------------------------------------------------------------------------------------
  // Form Hook
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginDto>({
    resolver: zodResolver(schema),
  });
  // -----------------------------------------------------------------------------------------------
  // Get query client to invalidate queries
  const queryClient = useQueryClient();
  // -----------------------------------------------------------------------------------------------
  // Handle form submit
  const onSubmit = async (data: LoginDto) => {
    try {
      await login(data.email, data.password);

      // Invalidate query client data to fetch new data with new token
      await queryClient.invalidateQueries();

      navigate("/");
    } catch (err) {
      // TODO: Toast error
      console.error(err);
    }
  };
  // -----------------------------------------------------------------------------------------------
  // -----------------------------------------------------------------------------------------------
  return (
    <div className="flex items-center justify-center h-screen">
      <form onSubmit={handleSubmit(onSubmit)} className="p-4 border rounded">
        {/* Email input */}
        <input {...register("email")} placeholder="Email" />
        {errors.email && <p>{errors.email.message}</p>}
        {/* Password input */}
        <input
          type="password"
          {...register("password")}
          placeholder="Password"
        />
        {errors.password && <p>{errors.password.message}</p>}
        {/* Submit button */}
        <button type="submit" disabled={isSubmitting}>
          Login
        </button>
      </form>

      {/* Register link */}
      <p>
        Don&apos;t have an account?{" "}
        <Link to="/register" className="underline">
          Register
        </Link>
      </p>
    </div>
  );
};

export default Login;
