import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Button,
  Checkbox,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@/components/ui';
import { useLoginMutation } from '@/api/services';
import { Eye, EyeOff, Github, Mail } from 'lucide-react';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [login, { isLoading }] = useLoginMutation();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      void (await login({
        email: values.email,
        password: values.password,
      }).unwrap());

      toast.success('Login successful! Redirecting...');

      // Navegar para dashboard após login bem-sucedido
      void setTimeout(() => {
        void navigate('/');
      }, 1000);
    } catch (error) {
      const errorData = (error as Record<string, Record<string, string>>)?.data;
      const errorMessage = errorData?.message ?? 'Login failed. Please try again.';
      toast.error(errorMessage);
      console.error('Login error:', error);
    }
  };

  const handleSocialLogin = (provider: string) => {
    toast.info(`Social login with ${provider} coming soon!`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      {/* Main Card */}
      <Card className="w-full max-w-md px-8 py-8 bg-white">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black mb-2 font-sans">Welcome</h1>
          <p className="text-black/60 text-base">Sign in to your account</p>
        </div>

        {/* Form */}
        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void form.handleSubmit(onSubmit)();
            }}
            className="space-y-6"
          >
            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black font-semibold">Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      {...field}
                      className="border-2 border-black bg-white focus-visible:ring-4 focus-visible:border-black transition-all"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password Field */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black font-semibold">Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        {...field}
                        className="border-2 border-black bg-white focus-visible:ring-4 focus-visible:border-black pr-10 transition-all"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setShowPassword(!showPassword);
                        }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black hover:text-black/70 transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <FormField
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked: boolean | 'indeterminate') =>
                          field.onChange(checked === true)
                        }
                        className="border-2 border-black"
                      />
                    </FormControl>
                    <FormLabel className="text-sm text-black cursor-pointer font-medium mb-0">
                      Remember me
                    </FormLabel>
                  </FormItem>
                )}
              />
              <a href="#" className="text-sm text-black hover:underline font-semibold">
                Forgot password?
              </a>
            </div>

            {/* Login Button */}
            <Button type="submit" disabled={isLoading} variant="default" className="w-full h-12">
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </Form>

        {/* Divider */}
        <div className="my-8 flex items-center gap-4">
          <div className="flex-1 border-t-2 border-black" />
          <span className="text-sm font-bold text-black px-2">OR</span>
          <div className="flex-1 border-t-2 border-black" />
        </div>

        {/* Social Login Buttons */}
        <div className="space-y-3">
          <Button
            onClick={(e) => {
              e.preventDefault();
              handleSocialLogin('Google');
            }}
            disabled={isLoading}
            variant="neutral"
            className="w-full gap-2"
          >
            <Mail size={18} />
            Google
          </Button>
          <Button
            onClick={(e) => {
              e.preventDefault();
              handleSocialLogin('GitHub');
            }}
            disabled={isLoading}
            className="w-full gap-2 bg-black text-white border-black hover:bg-black/90"
          >
            <Github size={18} />
            GitHub
          </Button>
        </div>

        {/* Footer */}
        <p className="text-center text-black/60 text-sm mt-8">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={() => {
              void navigate('/register');
            }}
            className="font-bold text-black hover:underline cursor-pointer bg-transparent border-0 p-0"
          >
            Sign up
          </button>
        </p>
      </Card>
    </div>
  );
}
