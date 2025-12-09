
'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useFirebase, useDoc } from '@/firebase';
import { collection, Timestamp, doc } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { PlusCircle, Upload, Camera, Sparkles, Loader2, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { ScrollArea } from './ui/scroll-area';
import { suggestListingDetails } from '@/ai/flows/listing-assistant-flow';


const formSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters.' }),
  description: z.string().optional(),
  itemType: z.string().optional(),
  condition: z.string().optional(),
  price: z.string().optional(),
  status: z.enum(['lost', 'found', '']).optional(),
  location: z.string().optional(),
  imageUrl: z.string().optional(),
  contactName: z.string().min(2, { message: 'Please enter a name.' }),
  contactNumber: z.string().min(10, { message: 'Please enter a valid contact number.' }),
  contactEmail: z.string().email({ message: 'Please enter a valid email.' }).optional().or(z.literal('')),
});

// Refine schema based on category
const refinedSchema = (category: 'buy-sell' | 'borrow-lend' | 'lost-found') => formSchema.refine(data => {
    if (category === 'buy-sell') {
        const price = Number(data.price);
        return data.price !== undefined && !isNaN(price) && price > 0;
    }
    return true;
}, {
    message: 'Price must be a number greater than 0.',
    path: ['price'],
});

type UserProfile = {
  collegeId: string;
};


interface PostItemDialogProps {
  category: 'buy-sell' | 'borrow-lend' | 'lost-found';
}


export function PostItemDialog({ category }: PostItemDialogProps) {
  const { user, firestore } = useFirebase();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showCamera, setShowCamera] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [isGenerating, setIsGenerating] = useState(false);

  const userDocRef = useMemo(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);
  
  const { data: userProfile } = useDoc<UserProfile>(userDocRef);


  useEffect(() => {
    const getCameraPermission = async () => {
      if (showCamera) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          setHasCameraPermission(true);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
          toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description: 'Please enable camera permissions in your browser settings.',
          });
        }
      }
    };
    getCameraPermission();
    
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [showCamera, toast]);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(refinedSchema(category)),
    defaultValues: {
      title: '',
      description: '',
      price: '',
      status: category === 'lost-found' ? 'found' : '',
      location: '',
      imageUrl: '',
      contactName: user?.displayName || '',
      contactNumber: '',
      contactEmail: user?.email || '',
    },
  });

  const title = form.watch('title');
  const condition = form.watch('condition');

  useEffect(() => {
    if (user) {
        form.reset({
            title: '',
            description: '',
            itemType: undefined,
            price: '',
            status: category === 'lost-found' ? 'found' : '',
            location: '',
            imageUrl: '',
            contactName: user.displayName || '',
            contactNumber: '',
            contactEmail: user.email || '',
        });
    }
  }, [user, isOpen, form, category]);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
            variant: "destructive",
            title: "Image too large",
            description: "Please upload an image smaller than 2MB.",
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        form.setValue('imageUrl', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setImagePreview(dataUrl);
        form.setValue('imageUrl', dataUrl);
        setShowCamera(false);
      }
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !firestore || !userProfile?.collegeId) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in and have a college selected to post an item.',
      });
      return;
    }
    
    if ((category === 'buy-sell' || category === 'borrow-lend') && !values.condition) {
        toast({
            variant: "destructive",
            title: "Condition required",
            description: "Please select the item's condition.",
        });
        return;
    }

    const itemsCollectionRef = collection(firestore, 'colleges', userProfile.collegeId, 'items');
    const newItem: any = {
      userId: user.uid,
      title: values.title,
      description: values.description || '',
      category: category,
      itemType: values.itemType || 'Other',
      datePosted: Timestamp.now(),
      status:
        category === 'lost-found'
          ? values.status
          : 'available',
      imageUrl: values.imageUrl || '',
      contactName: values.contactName,
      contactNumber: values.contactNumber,
      contactEmail: values.contactEmail || '',
    };
    
    if (category === 'buy-sell') {
        newItem.price = Number(values.price) || 0;
    }
    
    if (category === 'borrow-lend') {
        newItem.rate = values.price;
    }

    if (category === 'lost-found') {
        newItem.location = values.location || '';
    }
    
    if (values.condition) {
        newItem.condition = values.condition;
    }

    try {
      await addDocumentNonBlocking(itemsCollectionRef, newItem);
      toast({
        title: 'Item Posted!',
        description: `Your item "${values.title}" has been successfully listed.`,
      });
      setIsOpen(false);
      form.reset();
      setImagePreview(null);
    } catch (error) {
      console.error('Error posting item:', error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'There was a problem posting your item.',
      });
    }
  }

  const handleDialogClose = () => {
    form.reset();
    setImagePreview(null);
    setShowCamera(false);
    setHasCameraPermission(null);
  };
  
  const handleGenerate = async () => {
    if (!title) {
        toast({
            variant: "destructive",
            title: "Title is required",
            description: "Please enter an item title before generating with AI.",
        });
        return;
    }

    setIsGenerating(true);
    try {
        const result = await suggestListingDetails({
            title,
            category,
            condition,
        });

        if (result.description) {
            form.setValue('description', result.description);
        }
        if (result.price && category === 'buy-sell') {
            form.setValue('price', String(result.price));
        }
        toast({
          title: "Content generated!",
          description: "The AI has filled in the description and price for you.",
        })
    } catch (error) {
        console.error("AI Generation Error", error);
        toast({
            variant: "destructive",
            title: "AI Generation Failed",
            description: "Could not generate content. Please try again.",
        });
    } finally {
        setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) handleDialogClose();
    }}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          List an Item
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="font-headline">List an Item</DialogTitle>
          <DialogDescription>
            Fill in the details below. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-6">
            {!showCamera ? (
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <>
                        <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Item Name</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g. MacBook Pro" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />

                        <FormField
                            control={form.control}
                            name="itemType"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Item Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select the type of item" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Electronics">Electronics</SelectItem>
                                        <SelectItem value="Furniture">Furniture</SelectItem>
                                        <SelectItem value="Books">Books</SelectItem>
                                        <SelectItem value="Clothing">Clothing</SelectItem>
                                        <SelectItem value="Stationery">Stationery</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                         <div className="relative">
                            <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Describe your item..." {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                             {title && (
                                <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="icon" 
                                    className="absolute top-0 right-0"
                                    onClick={handleGenerate}
                                    disabled={isGenerating}
                                    aria-label="Generate with AI"
                                >
                                    {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                                </Button>
                            )}
                         </div>


                        {(category === 'buy-sell' || category === 'borrow-lend') && (
                            <FormField
                                control={form.control}
                                name="condition"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Condition</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select item condition" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                        <SelectItem value="New">New</SelectItem>
                                        <SelectItem value="Like New">Like New</SelectItem>
                                        <SelectItem value="Good">Good</SelectItem>
                                        <SelectItem value="Fair">Fair</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {category === 'buy-sell' && (
                        <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Price (₹)</FormLabel>
                                <FormControl>
                                <Input type="number" min="0.01" step="any" placeholder="e.g. 500" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        )}

                        {category === 'borrow-lend' && (
                        <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Borrowing Rate</FormLabel>
                                <FormControl>
                                <Input placeholder="e.g. ₹50/day" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        )}

                        {category === 'lost-found' && (
                        <>
                            <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Status</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    <SelectItem value="found">I Found an Item</SelectItem>
                                    <SelectItem value="lost">I Lost an Item</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                            <FormField
                            control={form.control}
                            name="location"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Last Known Location</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. Library 2nd Floor" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                        </>
                        )}

                        <div className="border-t pt-4 mt-4 space-y-4">
                            <FormField
                                control={form.control}
                                name="contactName"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Your Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="How your name should appear" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="contactNumber"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Contact Number</FormLabel>
                                    <FormControl>
                                        <Input type="tel" placeholder="Your phone number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="contactEmail"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Contact Email (Optional)</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="Your email address" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormItem>
                        <FormLabel>Image (Optional)</FormLabel>
                            <FormControl>
                                <div className="space-y-2">
                                    <div className="grid grid-cols-2 gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full"
                                    >
                                        <Upload className="mr-2 h-4 w-4" />
                                        Upload
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowCamera(true)}
                                        className="w-full"
                                    >
                                        <Camera className="mr-2 h-4 w-4" />
                                        Use Camera
                                    </Button>
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        className="hidden"
                                        accept="image/png, image/jpeg, image/gif"
                                    />
                                </div>
                            </FormControl>
                            {imagePreview && (
                                <div className="mt-4 relative w-full aspect-video rounded-md overflow-hidden border">
                                    <Image src={imagePreview} alt="Image preview" fill objectFit="cover" />
                                     <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-2 right-2 h-7 w-7 bg-black/50 hover:bg-destructive/80"
                                        onClick={() => {
                                            setImagePreview(null);
                                            form.setValue('imageUrl', '');
                                            if (fileInputRef.current) {
                                                fileInputRef.current.value = '';
                                            }
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        <span className="sr-only">Remove image</span>
                                    </Button>
                                </div>
                            )}
                        <FormMessage />
                        </FormItem>


                        <DialogFooter className="sticky bottom-0 bg-background pt-4 pb-0 -mx-6 px-6">
                        <DialogClose asChild>
                            <Button type="button" variant="secondary" onClick={handleDialogClose}>
                            Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit">Save changes</Button>
                        </DialogFooter>
                    </>
                </form>
                </Form>
            ) : (
                <div className="space-y-4">
                    <div className="relative w-full aspect-video bg-muted rounded-md overflow-hidden">
                        <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                        {hasCameraPermission === false && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white p-4">
                                <Camera className="h-12 w-12 mb-4" />
                                <h3 className="font-bold">Camera Access Denied</h3>
                                <p className="text-sm text-center">Please enable camera access in your browser settings to use this feature.</p>
                            </div>
                        )}
                    </div>
                     <canvas ref={canvasRef} className="hidden"></canvas>
                     <div className="flex justify-between gap-2">
                        <Button variant="secondary" onClick={() => setShowCamera(false)}>Back to Form</Button>
                        <Button onClick={handleCapture} disabled={!hasCameraPermission}>Take Photo</Button>
                    </div>
                </div>
            )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
