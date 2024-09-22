import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DevTool } from "@hookform/devtools";
import React from "react";
import { useNavigate } from "react-router-dom";
import { FormProvider, useForm } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent } from "@/components/ui/popover";
import { PopoverTrigger } from "@radix-ui/react-popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

type FormObj = {
  username: string;
  // password: string;
  email: string;
  status: boolean;
  date: Date;
  // phone: string;
  // address: string;
  // website: string;
  // company: string;
  // tags: string[];
  // skills: string[];
  // hobbies: string[];
  // languages: string[];
  // interests: string[];
  // education: string[];
  // experience: string[];
  // projects: string[];
  // references: string[];
  // portfolio: string[];
};
function FormBuilder() {
  const navigate = useNavigate();
  const form = useForm<FormObj>({
    defaultValues: { username: "", email: "", status: true, date: new Date() },
  });
  const onSubmit = (res: FormObj) => {
    console.log(res);
    navigate("/table");
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8">
      <Card className="w-full">
        <CardHeader className="space-y-1">
          <CardTitle>Create User</CardTitle>
          <CardDescription>Please fill in your details to register.</CardDescription>
        </CardHeader>
        <CardContent>
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* <TextComponent form={form} /> */}
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="name">Username</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                    <FormLabel htmlFor="email">Email</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between space-x-2">
                      <FormControl>
                        <Switch id="status" checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <Label className="flex-grow m-0" htmlFor="status">
                        Currently works
                      </Label>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DevTool control={form.control} />
            </form>
          </FormProvider>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" onClick={form.handleSubmit(onSubmit)}>
            Submit
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default FormBuilder;
