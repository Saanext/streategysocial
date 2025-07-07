"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import jsPDF from "jspdf";
import {
  Building2,
  Users,
  Goal,
  Share2,
  Instagram,
  Linkedin,
  Facebook,
  Loader2,
  Download,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { createStrategy } from "./actions";
import type { GenerateSocialMediaStrategyOutput } from "@/ai/flows/generate-social-media-strategy";

const TwitterIcon = () => (
  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5">
    <title>X</title>
    <path
      fill="currentColor"
      d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"
    />
  </svg>
);

const platformOptions = [
  { id: "instagram", label: "Instagram", icon: <Instagram className="h-5 w-5"/> },
  { id: "x", label: "X (Twitter)", icon: <TwitterIcon /> },
  { id: "facebook", label: "Facebook", icon: <Facebook className="h-5 w-5"/> },
  { id: "linkedin", label: "LinkedIn", icon: <Linkedin className="h-5 w-5"/> },
];

const formSchema = z.object({
  businessDetails: z.string().min(20, {
    message: "Business details must be at least 20 characters.",
  }),
  targetAudience: z.string().min(20, {
    message: "Target audience description must be at least 20 characters.",
  }),
  goals: z.string().min(10, {
    message: "Goals must be at least 10 characters.",
  }),
  platforms: z.array(z.string()).refine((value) => value.length > 0, {
    message: "You must select at least one social media platform.",
  }),
});

type FormData = z.infer<typeof formSchema>;

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [strategyOutput, setStrategyOutput] = useState<GenerateSocialMediaStrategyOutput | null>(null);
  const { toast } = useToast();
  const resultsRef = useRef<HTMLDivElement>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessDetails: "",
      targetAudience: "",
      goals: "",
      platforms: [],
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setStrategyOutput(null);
    try {
      const result = await createStrategy({
        ...data,
        platforms: data.platforms as Array<'instagram' | 'x' | 'facebook' | 'linkedin'>,
      });
      setStrategyOutput(result);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error Generating Strategy",
        description: "There was an issue generating your strategy. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!strategyOutput) return;
    setIsDownloading(true);

    try {
        const doc = new jsPDF('p', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 15;
        const contentWidth = pageWidth - margin * 2;
        let y = margin;

        const checkPageBreak = (heightNeeded: number) => {
            if (y + heightNeeded > pageHeight - margin) {
                doc.addPage();
                y = margin;
            }
        };

        // --- Title ---
        doc.setFontSize(22);
        doc.setFont(undefined, 'bold');
        doc.text('Your AI-Generated Social Media Strategy', pageWidth / 2, y, { align: 'center' });
        y += 15;

        // --- Main content ---
        strategyOutput.strategies.forEach((s, index) => {
            const platformName = s.platform === 'x' ? 'X (Twitter)' : s.platform.charAt(0).toUpperCase() + s.platform.slice(1);
            
            checkPageBreak(20);
            doc.setFontSize(18);
            doc.setFont(undefined, 'bold');
            doc.text(`${platformName} Strategy`, margin, y);
            y += 12;

            const addSection = (title: string, content: string) => {
                checkPageBreak(15);
                doc.setFontSize(14);
                doc.setFont(undefined, 'bold');
                doc.text(title, margin, y);
                y += 7;

                doc.setFontSize(11);
                doc.setFont(undefined, 'normal');
                const textLines = doc.splitTextToSize(content, contentWidth);
                checkPageBreak(textLines.length * 5 + 5);
                doc.text(textLines, margin, y);
                y += textLines.length * 5 + 5;
            };

            addSection('Strategy', s.strategy);
            addSection('Weekly Content Plan', s.weeklyContentPlan);
            addSection('Algorithm Insights', s.algorithmKnowledge);
            
            if (index < strategyOutput.strategies.length - 1) {
                y += 5;
                checkPageBreak(10);
                doc.setDrawColor(221, 221, 221);
                doc.line(margin, y, pageWidth - margin, y);
                y += 10;
            }
        });

        doc.save('social-media-strategy.pdf');
    } catch (err) {
        console.error(err);
        toast({
            variant: "destructive",
            title: "PDF Download Failed",
            description: "An error occurred while generating the PDF.",
        });
    } finally {
        setIsDownloading(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    const p = platformOptions.find((opt) => opt.id === platform);
    return p ? p.icon : null;
  };

  return (
    <main className="min-h-screen bg-muted/30 p-4 sm:p-8">
      <div className="max-w-screen-xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-orange-400">
            SocialBoost AI
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
            Fuel your brand's growth. Input your business details, and our AI will craft tailored social media strategies for your chosen platforms.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          <div className="lg:col-span-2">
            <Card className="sticky top-8 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">1. Define Your Business</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="businessDetails"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-primary" /> Business Details
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="e.g., 'We are a startup selling eco-friendly handmade soaps...'"
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="targetAudience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-primary" /> Target Audience
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="e.g., 'Eco-conscious millennials aged 25-40...'"
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="goals"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Goal className="h-4 w-4 text-primary" /> Your Goals
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="e.g., 'Increase online sales by 20%...'"
                              className="min-h-[70px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="platforms"
                      render={() => (
                        <FormItem>
                          <div className="mb-4">
                            <FormLabel className="flex items-center gap-2">
                              <Share2 className="h-4 w-4 text-primary" /> Select Platforms
                            </FormLabel>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {platformOptions.map((item) => (
                              <FormField
                                key={item.id}
                                control={form.control}
                                name="platforms"
                                render={({ field }) => (
                                  <FormItem key={item.id} className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3 bg-card hover:bg-muted/50 transition-colors">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(item.id)}
                                        onCheckedChange={(checked) => {
                                          const newValue = checked
                                            ? [...field.value, item.id]
                                            : field.value?.filter((value) => value !== item.id);
                                          field.onChange(newValue);
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal flex items-center gap-2 cursor-pointer w-full">
                                      {item.icon} {item.label}
                                    </FormLabel>
                                  </FormItem>
                                )}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={isLoading} className="w-full text-lg py-6 font-bold">
                      {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                      {isLoading ? "Generating..." : "Create My Strategy"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold tracking-tight">2. Your AI-Generated Strategies</h2>
                {strategyOutput && strategyOutput.strategies.length > 0 && (
                    <Button onClick={handleDownloadPdf} variant="outline" disabled={isDownloading}>
                    {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                    {isDownloading ? 'Downloading...' : 'Download PDF'}
                    </Button>
                )}
            </div>

            <div className="space-y-4">
              {isLoading && (
                [...Array(form.getValues("platforms").length || 2)].map((_, i) => (
                  <Card key={i} className="shadow-lg">
                    <CardHeader>
                      <Skeleton className="h-8 w-1/2" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Skeleton className="h-6 w-1/3" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                       <Skeleton className="h-6 w-1/3 mt-4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </CardContent>
                  </Card>
                ))
              )}
              
              <div ref={resultsRef} className="bg-transparent">
                {strategyOutput && strategyOutput.strategies.length > 0 && (
                  <div className="space-y-4 animate-in fade-in-50 duration-500">
                    {strategyOutput.strategies.map((s, index) => (
                      <Card key={index} className="shadow-lg border bg-card">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-3 text-2xl text-primary">
                            {getPlatformIcon(s.platform)}
                            <span className="capitalize">{s.platform === 'x' ? 'X (Twitter)' : s.platform}</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Accordion type="single" collapsible defaultValue="strategy" className="w-full">
                              <AccordionItem value="strategy">
                                <AccordionTrigger className="text-lg font-semibold">Strategy</AccordionTrigger>
                                <AccordionContent className="whitespace-pre-wrap text-base text-foreground/90 pt-2">
                                  {s.strategy}
                                </AccordionContent>
                              </AccordionItem>
                              <AccordionItem value="content-plan">
                                <AccordionTrigger className="text-lg font-semibold">Weekly Content Plan</AccordionTrigger>
                                <AccordionContent className="whitespace-pre-wrap text-base text-foreground/90 pt-2">
                                  {s.weeklyContentPlan}
                                </AccordionContent>
                              </AccordionItem>
                              <AccordionItem value="algorithm">
                                <AccordionTrigger className="text-lg font-semibold">Algorithm Insights</AccordionTrigger>
                                <AccordionContent className="whitespace-pre-wrap text-base text-foreground/90 pt-2">
                                  {s.algorithmKnowledge}
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {!isLoading && !strategyOutput && (
                <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg h-[400px]">
                  <p className="text-muted-foreground">Your generated strategies will appear here once you fill out the form.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
