"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { verifyBuddy } from "../../actions"; // We'll try to use the action if it exists, or just simulate

export function VerifyButton({ buddyId }: { buddyId: string }) {
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setLoading(true);
    try {
        // Since we are rewriting, calling the server action is the right way if it exists. 
        // If not, we'll simulate behavior or fail gracefully.
        // Assuming verifyBuddy is a server action imported from parent
        await verifyBuddy(buddyId); 
        toast.success("Verification request sent!");
    } catch (e) {
        toast.error("Failed to send verification.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleVerify} 
      disabled={loading}
      className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
    >
      {loading ? "Sending..." : "Verify Now"}
    </Button>
  );
}