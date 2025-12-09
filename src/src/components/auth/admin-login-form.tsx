"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";


import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useFirestore } from "@/firebase";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

export function AdminLoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!auth || !firestore) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Firebase not initialized. Please try again.",
      });
      return;
    }

    try {
      // 1. Sign in the user
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      // 2. Check for admin role
      const adminRoleDoc = await getDoc(doc(firestore, "roles_admin", user.uid));

      if (adminRoleDoc.exists()) {
        // 3. User is an admin, proceed
        toast({
          title: "Admin Login Successful",
          description: "Redirecting to the admin dashboard...",
        });
        router.push("/");
      } else {
        // 4. User is not an admin, sign them out and show error
        await signOut(auth);
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "You do not have administrator privileges.",
        });
      }
    } catch (error: any) {
        console.error("Admin Login Error", error);
        let description = 'An unexpected error occurred during login.';
        if (error.code === 'auth/invalid-credential') {
            description = 'Invalid email or password. Please try again.';
        }
        toast({
            variant: "destructive",
            title: "Login Failed",
            description,
        });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Admin Email</FormLabel>
              <FormControl>
                <Input placeholder="Enter your admin email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
          Sign In as Admin
        </Button>
        <div className="text-center text-sm text-muted-foreground">
            Not an admin?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
                Go to student login
            </Link>
        </div>
      </form>
    </Form>
  );
}
