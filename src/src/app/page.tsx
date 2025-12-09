'use client';
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ShoppingBag,
  ArrowRightLeft,
  Search,
} from "lucide-react";
import Image from "next/image";
import { Logo } from "@/components/logo";

export default function LandingPage() {
  const contactEmails = "ayush.1251090413@vit.edu,shriman.1251090081@vit.edu,unnati.1251090430@vit.edu,mayuresh.1251090398@vit.edu";
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Link href="/" aria-label="Back to Home page">
            <Logo />
          </Link>
          <nav className="flex items-center space-x-4 ml-auto">
            <Button asChild variant="ghost">
              <Link href="/login">Log In</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Sign Up</Link>
            </Button>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="relative w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-cover bg-center" style={{backgroundImage: "url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxzdHVkZW50cyUyMGxhcHRvcCUyMGdyb3VwfGVufDB8fHx8MTc2NTEyMjI1N3ww&ixlib=rb-4.1.0&q=80&w=1080')"}}>
          <div className="absolute inset-0 bg-black/60 z-10" />
          <div className="container relative z-20 px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-1 items-center">
              <div className="flex flex-col justify-center space-y-4 text-center text-white">
                <div className="space-y-4">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                    Your Campus, Connected.
                  </h1>
                  <p className="mx-auto max-w-[700px] text-gray-200 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    CampusHub is the exclusive platform for students to buy, sell, borrow, and reconnect with lost items—all within your trusted college community.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row justify-center">
                  <Button asChild size="lg">
                    <Link href="/register">
                      Join Your Campus
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Everything You Need, All in One Place</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  From finding a cheap textbook to borrowing a guitar for the weekend, CampusHub makes student life easier and more affordable.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:max-w-none lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-headline">
                    <ShoppingBag className="h-6 w-6 text-primary" />
                    Buy & Sell
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Find great deals on textbooks, furniture, electronics, and more from students you trust.</p>
                </CardContent>
                 <CardFooter>
                    <p className="text-sm text-muted-foreground">Log in to explore.</p>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-headline">
                    <ArrowRightLeft className="h-6 w-6 text-primary" />
                    Borrow & Lend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Need a tool for a project or an instrument for a performance? Borrow it from a fellow student.</p>
                </CardContent>
                 <CardFooter>
                    <p className="text-sm text-muted-foreground">Log in to explore.</p>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-headline">
                    <Search className="h-6 w-6 text-primary" />
                    Lost & Found
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Lost your keys? Found a wallet? Post it here to quickly reconnect items with their owners.</p>
                </CardContent>
                 <CardFooter>
                    <p className="text-sm text-muted-foreground">Log in to explore.</p>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>
        
        <section id="faq" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Frequently Asked Questions</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Have questions? We've got answers. If you can't find what you're looking for, feel free to reach out.
                </p>
              </div>
            </div>
            <div className="mx-auto max-w-3xl">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>What is CampusHub?</AccordionTrigger>
                  <AccordionContent>
                    CampusHub is an exclusive online platform for college students. It provides a safe and trusted environment for you to buy, sell, borrow, and lend items with fellow students on your campus. We also have a dedicated lost and found section to help reconnect you with misplaced belongings.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>Is CampusHub free to use?</AccordionTrigger>
                  <AccordionContent>
                    Yes, CampusHub is completely free for all registered students. You can list items, browse the marketplace, and connect with others at no cost. For "buy-sell" transactions, the price negotiation and payment are handled directly between the buyer and seller.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>How do I create an account?</AccordionTrigger>
                  <AccordionContent>
                    You can create an account by clicking the "Sign Up" button on our homepage. You'll need to provide your name, email address, choose your college, and create a password. For an even faster setup, you can sign up using your Google account. We may require you to use your official college email address to ensure you are a verified student.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger>How do I post an item?</AccordionTrigger>
                  <AccordionContent>
                    Once you are logged in, navigate to the relevant section (Buy & Sell, Borrow & Lend, or Lost & Found). Click the "List an Item" or "Post an Item" button, and a dialog box will appear. Fill in the details like the title, description, price or rate, and add a photo. Once you save, your item will be live!
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-5">
                  <AccordionTrigger>Is my personal information safe?</AccordionTrigger>
                  <AccordionContent>
                    Absolutely. We take your privacy and security very seriously. Your profile information is stored securely, and we only share the contact details you choose to provide on an item listing. All transactions and communications are between students of the same campus community.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-6">
                  <AccordionTrigger>How does the "Borrow & Lend" feature work?</AccordionTrigger>
                  <AccordionContent>
                    The Borrow & Lend section allows you to lend out items you own for a fee or borrow items you need from other students. When listing an item to lend, you set a "rate" (e.g., ₹50/day, ₹200/week). Interested borrowers can then contact you to arrange the exchange. It's a great way to make a little extra money from things you aren't using or to save money by not having to buy something you only need temporarily.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-7">
                  <AccordionTrigger>How are users verified?</AccordionTrigger>
                  <AccordionContent>
                    We build a trusted community by encouraging users to sign up with their official college email address (e.g., you@college.edu). For some colleges, this may be a requirement. This helps ensure that you are interacting only with other students from your campus, making transactions safer and more reliable.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-8">
                  <AccordionTrigger>I found the item I listed as 'lost'. What should I do?</AccordionTrigger>
                  <AccordionContent>
                    That's great news! Simply navigate to the "Lost & Found" page. You will see a delete icon (a trash can) on the card for the item you posted. Just click that button and confirm the deletion to remove the listing from the page. This keeps the board up-to-date for everyone else.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </section>

        <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
          <p className="text-xs text-muted-foreground">&copy; CampusHub. All rights reserved.</p>
          <nav className="sm:ml-auto flex gap-4 sm:gap-6">
            <Link href="/login" className="text-xs hover:underline underline-offset-4">Login</Link>
            <Link href="/register" className="text-xs hover:underline underline-offset-4">Register</Link>
            <a href={`mailto:${contactEmails}`} className="text-xs hover:underline underline-offset-4">Contact Us</a>
          </nav>
        </footer>
      </main>
    </div>
  );
}
