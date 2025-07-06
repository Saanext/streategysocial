"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Building2,
  Users,
  Goal,
  Share2,
  Instagram,
  Linkedin,
  Facebook,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
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
  const [strategyOutput, setStrategyOutput] = useState<GenerateSocialMediaStrategyOutput | null>(null);
  const { toast } = useToast();

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

  const getPlatformIcon = (platform: string) => {
    const p = platformOptions.find((opt) => opt.id === platform);
    return p ? p.icon : null;
  };

  return (
    <main className="container mx-auto px-4 py-8 md:py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-orange-400">
          SocialBoost AI
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Fuel your brand's growth. Input your business details, and our AI will craft tailored social media strategies for your chosen platforms.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
        <div className="lg:col-span-2">
          <Card className="shadow-2xl shadow-primary/10">
            <CardHeader>
              <CardTitle className="text-2xl">1. Define Your Business</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <FormField
                    control={form.control}
                    name="businessDetails"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-base">
                          <Building2 className="h-5 w-5 text-primary" /> Business Details
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., 'We are a startup selling eco-friendly handmade soaps...'"
                            className="min-h-[120px]"
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
                        <FormLabel className="flex items-center gap-2 text-base">
                          <Users className="h-5 w-5 text-primary" /> Target Audience
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., 'Eco-conscious millennials aged 25-40 who value sustainable products...'"
                            className="min-h-[120px]"
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
                        <FormLabel className="flex items-center gap-2 text-base">
                          <Goal className="h-5 w-5 text-primary" /> Your Goals
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., 'Increase online sales by 20% and grow our Instagram following.'"
                            className="min-h-[80px]"
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
                          <FormLabel className="flex items-center gap-2 text-base">
                            <Share2 className="h-5 w-5 text-primary" /> Select Platforms
                          </FormLabel>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {platformOptions.map((item) => (
                            <FormField
                              key={item.id}
                              control={form.control}
                              name="platforms"
                              render={({ field }) => (
                                <FormItem key={item.id} className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3 hover:bg-card/80 transition-colors">
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
          <div className="space-y-6 sticky top-12">
            <h2 className="text-3xl font-bold tracking-tight">2. Your AI-Generated Strategies</h2>
            {isLoading && (
              <div className="space-y-4">
                {[...Array(form.getValues("platforms").length || 2)].map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-8 w-1/2" />
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            
            {strategyOutput && strategyOutput.strategies.length > 0 && (
              <div className="space-y-4 animate-in fade-in-50 duration-500">
                {strategyOutput.strategies.map((s, index) => (
                  <Card key={index} className="shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-2xl text-primary">
                        {getPlatformIcon(s.platform)}
                        <span className="capitalize">{s.platform === 'x' ? 'X (Twitter)' : s.platform}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="whitespace-pre-wrap text-base text-foreground/90">{s.strategy}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!isLoading && !strategyOutput && (
              <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg min-h-[400px]">
                <p className="text-muted-foreground">Your generated strategies will appear here once you fill out the form.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
