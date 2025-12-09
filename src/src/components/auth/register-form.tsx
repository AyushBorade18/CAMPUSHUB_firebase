'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { colleges } from '@/lib/data';
import { Building2, Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth, useFirestore, setDocumentNonBlocking } from '@/firebase';
import {
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { doc } from 'firebase/firestore';
import { ADMIN_EMAIL } from '@/lib/config';

const formSchema = z
  .object({
    fullName: z
      .string()
      .min(2, { message: 'Name must be at least 2 characters.' }),
    username: z
      .string()
      .min(2, { message: 'Username must be at least 2 characters.' }),
    email: z
      .string()
      .email({ message: 'Invalid email address.' })
      .refine((email) => /\.edu(\.in)?$/.test(email), {
        message: 'Only .edu or .edu.in emails are allowed.',
      }),
    college: z.string({ required_error: 'Please select your college.' }),
    password: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters.' }),
    confirmPassword: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters.' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export function RegisterForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const auth = useAuth();
  const firestore = useFirestore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!auth || !firestore) {
        toast({
            variant: "destructive",
            title: "Initialization Error",
            description: "Firebase is not ready. Please try again in a moment.",
        });
        return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
      const user = userCredential.user;

      const collegeData = colleges.find((c) => c.name === values.college);

      // Create a user profile in Firestore
      if (user && collegeData) {
        const userRef = doc(firestore, 'users', user.uid);
        const [firstName, ...lastNameParts] = values.fullName.split(' ');
        const lastName = lastNameParts.join(' ');

        setDocumentNonBlocking(
          userRef,
          {
            id: user.uid,
            collegeId: collegeData.id,
            username: values.username,
            email: values.email,
            firstName: firstName || '',
            lastName: lastName || '',
            registrationDate: new Date().toISOString(),
          },
          { merge: true }
        );
        
        // This is the temporary, one-time admin setup logic.
        // It checks if the registering user's email is the special admin setup email.
        if (values.email === ADMIN_EMAIL) {
          const adminId = 'X9X7z6RoREQvPWXpDGbPQrsR31k2';
          const adminRoleRef = doc(firestore, 'roles_admin', adminId);
          setDocumentNonBlocking(adminRoleRef, {
            id: adminId,
            role: 'superadmin',
            assignedBy: 'initial_setup',
            assignedAt: new Date().toISOString(),
          }, { merge: true });
          toast({
            title: 'Admin Role Assigned!',
            description: `User ${adminId} has been made an administrator.`,
          });
        }
        
      } else if (user && !collegeData) {
         throw new Error("Selected college could not be found. Please try again.");
      }

      toast({
        title: 'Registration Successful',
        description: 'Welcome! Please log in to continue.',
      });
      router.push('/login');
    } catch (error: any) {
      console.error('Registration Error', error);
      let description = 'An unexpected error occurred.';
      if (error.code === 'auth/email-already-in-use') {
        description = 'This email is already in use. Please try logging in instead.';
      } else if (error.message) {
        description = error.message;
      }
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: description,
      });
    }
  }

  const filteredColleges = React.useMemo(() => {
    if (!search) return colleges.map((c) => c.name);
    return colleges
      .filter((college) =>
        college.name.toLowerCase().includes(search.toLowerCase())
      )
      .map((c) => c.name);
  }, [search]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Add your name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Choose a username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="you@college.edu" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="college"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>College</FormLabel>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        'w-full justify-between',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <Building2 className="mr-2 h-4 w-4 shrink-0" />
                        <span className="truncate">
                          {field.value || 'Select your college'}
                        </span>
                      </div>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <div className="p-2">
                    <Input
                      placeholder="Search college..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="h-9"
                    />
                  </div>
                  <ScrollArea className="h-60">
                    {filteredColleges.length > 0 ? (
                      filteredColleges.map((college) => (
                        <div
                          key={college}
                          onClick={() => {
                            form.setValue('college', college);
                            setOpen(false);
                          }}
                          className="flex items-center gap-2 p-2 mx-1 rounded-sm cursor-pointer hover:bg-accent"
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              field.value === college
                                ? 'opacity-100'
                                : 'opacity-0'
                            )}
                          />
                          <span className="text-sm">{college}</span>
                        </div>
                      ))
                    ) : (
                      <p className="p-4 text-center text-sm text-muted-foreground">
                        No college found.
                      </p>
                    )}
                  </ScrollArea>
                </PopoverContent>
              </Popover>
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
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          Create Account
        </Button>
        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-medium text-primary hover:underline"
          >
            Sign In
          </Link>
        </div>
      </form>
    </Form>
  );
}
