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
    <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
      <div className="card bg-base-100 shadow-xl w-full max-w-md">
        <div className="card-body">
          <h2 className="mx-auto card-title text-2xl font-bold text-center mb-2">
            Login to Your Account
          </h2>
          <p className="mx-auto text-center text-base-content/70 mb-6">
            Enter your credentials to continue
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email Address</span>
              </label>
              <input
                {...register("email")}
                type="email"
                placeholder="email@example.com"
                className={`input input-bordered w-full ${
                  errors.email ? "input-error" : ""
                }`}
              />
              {errors.email && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {errors.email.message}
                  </span>
                </label>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                type="password"
                {...register("password")}
                placeholder="••••••••"
                className={`input input-bordered w-full ${
                  errors.password ? "input-error" : ""
                }`}
              />
              {errors.password && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {errors.password.message}
                  </span>
                </label>
              )}
            </div>

            <div className="form-control mt-6">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </button>
            </div>
          </form>

          <div className="divider my-6">OR</div>

          <p className="text-center">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="link link-primary">
              Register now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
