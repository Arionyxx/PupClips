"use client";

import { useState } from "react";
import { signOut } from "@/app/auth/actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2, LogOut } from "lucide-react";

interface SignOutButtonProps {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  className?: string;
  children?: React.ReactNode;
}

export function SignOutButton({
  variant = "ghost",
  className,
  children,
}: SignOutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      const result = await signOut();
      if (result?.error) {
        toast.error(result.error);
        setIsLoading(false);
      }
      // Success will redirect
    } catch {
      toast.error("Failed to sign out");
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      className={className}
      onClick={handleSignOut}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <LogOut className="mr-2 h-4 w-4" />
      )}
      {children || "Sign Out"}
    </Button>
  );
}
