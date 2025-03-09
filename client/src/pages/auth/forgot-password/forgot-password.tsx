import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { OTPInput, SlotProps } from "input-otp";
import { BadgeAlert } from "lucide-react";
import React, { useEffect, useId, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link } from "react-router-dom";

function forgotPassword() {
  const id = useId();
  const [timer, setTimer] = useState(0);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const onSubmit = (data: { otp: string }) => {
    console.log("OTP submitted:", data.otp);
    setIsButtonDisabled(true);
    setTimer(10);

    // Start the countdown
    timerRef.current = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer === 1) {
          clearInterval(timerRef.current!);
          setIsButtonDisabled(false);
        }
        return prevTimer - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => {
      timerRef.current && clearInterval(timerRef.current);
    };
  }, []);

  const { control, handleSubmit } = useForm({
    defaultValues: {
      otp: "",
    },
  });

  const formId = "otp-form"; // Add a form ID

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4 md:p-8">
      <Card className="w-[700px] max-w-4xl overflow-hidden">
        <div className="p-6 md:p-8">
          <CardHeader className="p-0 mb-6">
            <CardTitle>OTP Verification</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="*:not-first:mt-2 flex items-center justify-center">
              <form id={formId} onSubmit={handleSubmit(onSubmit)}>
                <Controller
                  name="otp"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <OTPInput
                      id={id}
                      value={value}
                      onChange={onChange}
                      containerClassName="flex items-center gap-3 has-disabled:opacity-50"
                      maxLength={4}
                      inputMode={"numeric"}
                      render={({ slots }) => (
                        <div className="flex gap-2">
                          {slots.map((slot, idx) => (
                            <Slot key={idx} {...slot} />
                          ))}
                        </div>
                      )}
                    />
                  )}
                />
              </form>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-center gap-2 p-0 mt-6">
            <Button className="w-full" type="submit" form={formId} disabled={isButtonDisabled}>
              {isButtonDisabled ? `Resend OTP in ${timer}s` : "Send OTP"}
            </Button>
            {isButtonDisabled && (
              <span className="flex space-x-2">
                <BadgeAlert fill="green" className="text-white" />
                <p className="text-sm text-muted-foreground">Otp has been sent to your registered email</p>
              </span>
            )}
            <p className="mt-4 text-sm text-muted-foreground">
              <Link to="/login" className="underline underline-offset-4 hover:text-primary">
                Back to login
              </Link>
            </p>
          </CardFooter>
        </div>
      </Card>
    </div>
  );
}

function Slot(props: SlotProps) {
  return (
    <div
      className={cn("border-input bg-background text-foreground flex size-9 items-center justify-center rounded-md border font-medium shadow-xs transition-[color,box-shadow]", {
        "border border-input outline-none ring-1 ring-ring": props.isActive,
      })}>
      {props.char !== null && <div>{props.char}</div>}
    </div>
  );
}

export default forgotPassword;
