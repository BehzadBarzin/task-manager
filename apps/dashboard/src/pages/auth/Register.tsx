import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "../../Providers/AuthProvider";
import { Link, useNavigate } from "react-router";
import type { authTypes } from "@task-manager/data";
import { useQueryClient } from "@tanstack/react-query";

// -------------------------------------------------------------------------------------------------
type RegisterDto = authTypes.components["schemas"]["RegisterDto"];

// -------------------------------------------------------------------------------------------------
const schema = z.object({
  email: z.email(),
  password: z.string().min(8),
  displayName: z.string().optional(),
});

// -------------------------------------------------------------------------------------------------
const Register: React.FC = () => {
  const { register: authRegister } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterDto>({
    resolver: zodResolver(schema),
  });
  // -----------------------------------------------------------------------------------------------
  // Get query client to invalidate queries
  const queryClient = useQueryClient();
  // -----------------------------------------------------------------------------------------------
  const onSubmit = async (data: RegisterDto) => {
    try {
      await authRegister(data.email, data.password, data.displayName);

      // Invalidate query client data to fetch new data with new token
      await queryClient.invalidateQueries();

      navigate("/");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <form onSubmit={handleSubmit(onSubmit)} className="p-4 border rounded">
        <input {...register("email")} placeholder="Email" />
        {errors.email && <p>{errors.email.message}</p>}
        <input
          type="password"
          {...register("password")}
          placeholder="Password"
        />
        {errors.password && <p>{errors.password.message}</p>}
        <input {...register("displayName")} placeholder="Display Name" />
        <button type="submit" disabled={isSubmitting}>
          Register
        </button>
      </form>
      {/* Login link */}
      <p>
        Already have an account?{" "}
        <Link to="/login" className="underline">
          Login
        </Link>
      </p>
    </div>
  );
};

export default Register;
