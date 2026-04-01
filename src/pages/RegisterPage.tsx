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
import { useRegisterMutation } from '@/api/services';
import { Eye, EyeOff, Github, Mail } from 'lucide-react';
import { toast } from 'sonner';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
    agreeTerms: z.boolean().refine((val) => val === true, {
      message: 'You must agree to the terms and conditions',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [register, { isLoading }] = useRegisterMutation();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeTerms: false,
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      void (await register({
        name: values.name,
        email: values.email,
        password: values.password,
      }).unwrap());

      toast.success('Registration successful! Redirecting to Home...');

      void setTimeout(() => {
        void navigate('/');
      }, 1000);
    } catch (error) {
      const errorData = (error as Record<string, Record<string, string>>)?.data;
      const errorMessage = errorData?.message ?? 'Registration failed. Please try again.';
      toast.error(errorMessage);
      console.error('Registration error:', error);
    }
  };

  const handleSocialRegister = (provider: string) => {
    toast.info(`Social registration with ${provider} coming soon!`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      {/* Main Card */}
      <Card className="w-full max-w-md px-8 py-8 bg-white">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black mb-2 font-sans">Create Account</h1>
          <p className="text-black/60 text-base">Sign up to get started</p>
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
            {/* Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black font-semibold">Full Name</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="John Doe"
                      {...field}
                      className="border-2 border-black bg-white focus-visible:ring-4 focus-visible:border-black transition-all"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            {/* Confirm Password Field */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black font-semibold">Confirm Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        {...field}
                        className="border-2 border-black bg-white focus-visible:ring-4 focus-visible:border-black pr-10 transition-all"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setShowConfirmPassword(!showConfirmPassword);
                        }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black hover:text-black/70 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Agree Terms */}
            <FormField
              control={form.control}
              name="agreeTerms"
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
                    I agree to the{' '}
                    <a href="#" className="font-semibold hover:underline">
                      terms and conditions
                    </a>
                  </FormLabel>
                </FormItem>
              )}
            />
            <FormMessage />

            {/* Register Button */}
            <Button type="submit" disabled={isLoading} variant="default" className="w-full h-12">
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </Button>
          </form>
        </Form>

        {/* Divider */}
        <div className="my-8 flex items-center gap-4">
          <div className="flex-1 border-t-2 border-black" />
          <span className="text-sm font-bold text-black px-2">OR</span>
          <div className="flex-1 border-t-2 border-black" />
        </div>

        {/* Social Register Buttons */}
        <div className="space-y-3">
          <Button
            onClick={(e) => {
              e.preventDefault();
              handleSocialRegister('Google');
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
              handleSocialRegister('GitHub');
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
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => {
              void navigate('/login');
            }}
            className="font-bold text-black hover:underline cursor-pointer bg-transparent border-0 p-0"
          >
            Sign in
          </button>
        </p>
      </Card>
    </div>
  );
}
