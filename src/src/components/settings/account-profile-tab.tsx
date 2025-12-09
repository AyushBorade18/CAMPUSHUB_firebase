
'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Camera, Building2, Check, ChevronsUpDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirebase, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { colleges } from '@/lib/data';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Separator } from '../ui/separator';

type UserProfile = {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  collegeId: string;
};


export function AccountProfileTab() {
  const { user, firestore } = useFirebase();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const isSetupFlow = searchParams.get('setup') === 'true';

  const userDocRef = useMemo(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);
  

  const { data: userProfile, isLoading: isProfileLoading } =
    useDoc<UserProfile>(userDocRef);
    
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [selectedCollegeId, setSelectedCollegeId] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [collegeSearch, setCollegeSearch] = useState('');
  const [collegePickerOpen, setCollegePickerOpen] = useState(false);


  useEffect(() => {
    if (userProfile) {
      setName(`${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim());
      setUsername(userProfile.username || '');
      setEmail(userProfile.email || '');
      if (userProfile.collegeId && userProfile.collegeId !== 'unknown') {
        setSelectedCollegeId(userProfile.collegeId);
      }
    }
    if (user?.photoURL) {
      setAvatar(user.photoURL);
    }
  }, [userProfile, user]);

  const collegeName = useMemo(() => {
    if (!selectedCollegeId || selectedCollegeId === 'unknown') return 'Select your college';
    const collegeInfo = colleges.find((c) => c.id === selectedCollegeId);
    return collegeInfo?.name || 'Select your college';
  }, [selectedCollegeId]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
          variant: 'destructive',
          title: 'Image too large',
          description: 'Please upload an image smaller than 2MB.',
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatar(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userDocRef || !userProfile) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not update profile. User data not loaded.',
      });
      return;
    }
    
    if ((isSetupFlow || userProfile.collegeId === 'unknown') && (!selectedCollegeId || selectedCollegeId === 'unknown')) {
        toast({
            variant: 'destructive',
            title: 'College not selected',
            description: 'Please select your college to complete your profile.',
        });
        return;
    }

    const [firstName, ...lastNameParts] = name.split(' ');
    const lastName = lastNameParts.join(' ');

    const updatedData: Partial<UserProfile> = {
      firstName: firstName || '',
      lastName: lastName || '',
      username,
      email,
    };

    if (selectedCollegeId && selectedCollegeId !== userProfile.collegeId) {
        updatedData.collegeId = selectedCollegeId;
    }

    updateDocumentNonBlocking(userDocRef, updatedData);

    toast({
      title: 'Profile Updated',
      description: 'Your profile information has been saved.',
    });
    
    // If user was in the setup flow, redirect them to the home page
    if (isSetupFlow) {
        router.push('/');
    }
  };

  const getInitials = (nameStr: string) => {
    if (!nameStr || nameStr.trim() === '') return user?.email?.[0].toUpperCase() || 'U';
    const nameParts = nameStr.trim().split(' ').filter(Boolean);
    if (nameParts.length === 0) return 'U';
    const first = nameParts[0][0];
    const last = nameParts.length > 1 ? nameParts[nameParts.length - 1][0] : '';
    return (first + last).toUpperCase();
  };

  const filteredColleges = useMemo(() => {
    if (!collegeSearch) return colleges;
    return colleges.filter((college) =>
        college.name.toLowerCase().includes(collegeSearch.toLowerCase())
    );
  }, [collegeSearch]);
  
  if (isProfileLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-5 w-64" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-7 w-40" />
              <Skeleton className="h-5 w-32" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!userProfile && !isProfileLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">Could not load user profile.</p>
        </CardContent>
      </Card>
    );
  }
  
  const canEditCollege = true;

  return (
    <Card>
      <CardHeader>
          <CardTitle className="font-headline text-xl">
              {isSetupFlow ? "Complete Your Profile" : "Public Profile"}
          </CardTitle>
          <CardDescription>
              {isSetupFlow ? "Welcome! Please complete your profile to get started." : "This is how others will see you on the site."}
          </CardDescription>
      </CardHeader>
      <CardContent>
          {isSetupFlow && (
          <Alert className="mb-6 bg-accent/20 border-accent/50">
              <AlertTitle className="font-semibold">Just one more step!</AlertTitle>
              <AlertDescription>
              Please select your college and confirm your details below.
              </AlertDescription>
          </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex items-center gap-6">
              <div className="relative">
              <Avatar className="h-24 w-24 border">
                  {avatar && <AvatarImage src={avatar} alt={name} />}
                  <AvatarFallback>{getInitials(name)}</AvatarFallback>
              </Avatar>
              <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute bottom-0 right-0 rounded-full bg-background/70 hover:bg-background"
                  onClick={handleAvatarClick}
              >
                  <Camera className="h-5 w-5" />
                  <span className="sr-only">Change profile picture</span>
              </Button>
              <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/png, image/jpeg, image/gif"
              />
              </div>
              <div className="flex-grow">
                  <h2 className="text-2xl font-bold font-headline">{name || 'Your Name'}</h2>
                  <p className="text-muted-foreground">{collegeName || "Select your college below"}</p>
              </div>
          </div>

          <div className="grid gap-4">
              <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
              </div>
              <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="grid gap-2">
              <Label htmlFor="college">College</Label>
              {canEditCollege ? (
                  <Popover open={collegePickerOpen} onOpenChange={setCollegePickerOpen}>
                  <PopoverTrigger asChild>
                      <Button
                      variant="outline"
                      role="combobox"
                      className={cn('w-full justify-between', (!selectedCollegeId || selectedCollegeId === 'unknown') && 'text-muted-foreground')}
                      >
                      <div className="flex items-center gap-2 overflow-hidden">
                          <Building2 className="mr-2 h-4 w-4 shrink-0" />
                          <span className="truncate">{collegeName}</span>
                      </div>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <div className="p-2"><Input placeholder="Search college..." value={collegeSearch} onChange={(e) => setCollegeSearch(e.target.value)} className="h-9"/></div>
                      <ScrollArea className="h-60">
                      {filteredColleges.map((college) => (
                          <div key={college.id} onClick={() => { setSelectedCollegeId(college.id); setCollegePickerOpen(false);}} className="flex items-center gap-2 p-2 mx-1 rounded-sm cursor-pointer hover:bg-accent">
                          <Check className={cn('mr-2 h-4 w-4', selectedCollegeId === college.id ? 'opacity-100' : 'opacity-0')}/>
                          <span className="text-sm">{college.name}</span>
                          </div>
                      ))}
                      </ScrollArea>
                  </PopoverContent>
                  </Popover>
              ) : ( <Input id="college" value={collegeName} readOnly className="cursor-not-allowed bg-muted/50"/>)}
              </div>
          </div>

          <div className="flex justify-end">
              <Button type="submit">{isSetupFlow ? "Finish Setup" : "Save Changes"}</Button>
          </div>
          </form>
      </CardContent>
    </Card>
  );
}
