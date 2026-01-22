import { useNavigate } from "react-router-dom";
import { OldGoldForm } from "@/components/billing/OldGoldForm";
import { useCreateOldGoldPurchase } from "@/hooks/useOldGold";
import type { OldGoldFormData } from "@/types/billing";

export default function OldGoldPage() {
  const navigate = useNavigate();
  const createPurchase = useCreateOldGoldPurchase();

  const handleSubmit = async (data: OldGoldFormData) => {
    await createPurchase.mutateAsync(data);
    navigate("/billing/invoices");
  };

  return (
    <div className="container mx-auto py-6 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Old Gold Purchase</h1>
      <OldGoldForm onSubmit={handleSubmit} isLoading={createPurchase.isPending} />
    </div>
  );
}
