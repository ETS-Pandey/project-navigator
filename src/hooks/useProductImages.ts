import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ImageData {
  url: string;
  isPrimary: boolean;
}

export function useSaveProductImages() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ productId, images }: { productId: string; images: ImageData[] }) => {
      // First, delete existing images for this product
      const { error: deleteError } = await supabase
        .from("product_images")
        .delete()
        .eq("product_id", productId);

      if (deleteError) throw deleteError;

      // Insert new images
      if (images.length > 0) {
        const imageRecords = images.map((img, index) => ({
          product_id: productId,
          image_url: img.url,
          is_primary: img.isPrimary,
          display_order: index,
        }));

        const { error: insertError } = await supabase
          .from("product_images")
          .insert(imageRecords);

        if (insertError) throw insertError;
      }

      return images;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["product", variables.productId] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error saving images",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteProductImage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ imageId, imagePath }: { imageId: string; imagePath: string }) => {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("product-images")
        .remove([imagePath]);

      if (storageError) {
        console.warn("Failed to delete from storage:", storageError);
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from("product_images")
        .delete()
        .eq("id", imageId);

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "Image deleted" });
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting image",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
