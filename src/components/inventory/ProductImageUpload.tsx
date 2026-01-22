import { useState, useCallback } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProductImage {
  id?: string;
  url: string;
  file?: File;
  isPrimary: boolean;
  isUploading?: boolean;
}

interface ProductImageUploadProps {
  images: ProductImage[];
  onChange: (images: ProductImage[]) => void;
  productId?: string;
  maxImages?: number;
}

export function ProductImageUpload({
  images,
  onChange,
  productId,
  maxImages = 5,
}: ProductImageUploadProps) {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files) return;

      const newFiles = Array.from(files).slice(0, maxImages - images.length);
      if (newFiles.length === 0) {
        toast({
          title: "Maximum images reached",
          description: `You can upload up to ${maxImages} images per product.`,
          variant: "destructive",
        });
        return;
      }

      // Validate file types
      const validTypes = ["image/jpeg", "image/png", "image/webp"];
      const invalidFiles = newFiles.filter(f => !validTypes.includes(f.type));
      if (invalidFiles.length > 0) {
        toast({
          title: "Invalid file type",
          description: "Only JPG, PNG, and WebP images are allowed.",
          variant: "destructive",
        });
        return;
      }

      // Validate file sizes (max 5MB)
      const oversizedFiles = newFiles.filter(f => f.size > 5 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        toast({
          title: "File too large",
          description: "Each image must be under 5MB.",
          variant: "destructive",
        });
        return;
      }

      // Create preview URLs
      const newImages: ProductImage[] = newFiles.map((file, index) => ({
        url: URL.createObjectURL(file),
        file,
        isPrimary: images.length === 0 && index === 0,
        isUploading: false,
      }));

      onChange([...images, ...newImages]);
    },
    [images, maxImages, onChange, toast]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const removeImage = useCallback(
    (index: number) => {
      const newImages = images.filter((_, i) => i !== index);
      // If we removed the primary image, make the first remaining image primary
      if (images[index].isPrimary && newImages.length > 0) {
        newImages[0].isPrimary = true;
      }
      onChange(newImages);
    },
    [images, onChange]
  );

  const setPrimaryImage = useCallback(
    (index: number) => {
      const newImages = images.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      }));
      onChange(newImages);
    },
    [images, onChange]
  );

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "relative rounded-lg border-2 border-dashed p-6 transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50",
          images.length >= maxImages && "pointer-events-none opacity-50"
        )}
      >
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
          className="absolute inset-0 cursor-pointer opacity-0"
          disabled={images.length >= maxImages}
        />
        <div className="flex flex-col items-center gap-2 text-center">
          <Upload className="h-8 w-8 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">
              Drag & drop images or click to upload
            </p>
            <p className="text-xs text-muted-foreground">
              JPG, PNG, WebP up to 5MB ({images.length}/{maxImages})
            </p>
          </div>
        </div>
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {images.map((image, index) => (
            <div
              key={image.url}
              className={cn(
                "group relative aspect-square overflow-hidden rounded-lg border bg-muted",
                image.isPrimary && "ring-2 ring-primary ring-offset-2"
              )}
            >
              <img
                src={image.url}
                alt={`Product image ${index + 1}`}
                className="h-full w-full object-cover"
              />

              {/* Loading overlay */}
              {image.isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              )}

              {/* Actions overlay */}
              <div className="absolute inset-0 flex items-center justify-center gap-1 bg-background/80 opacity-0 transition-opacity group-hover:opacity-100">
                {!image.isPrimary && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setPrimaryImage(index)}
                  >
                    Set Primary
                  </Button>
                )}
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => removeImage(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Primary badge */}
              {image.isPrimary && (
                <div className="absolute left-1 top-1 rounded bg-primary px-1.5 py-0.5 text-xs font-medium text-primary-foreground">
                  Primary
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Helper to upload images to Supabase storage
export async function uploadProductImages(
  productId: string,
  images: ProductImage[]
): Promise<{ url: string; isPrimary: boolean }[]> {
  const uploadedImages: { url: string; isPrimary: boolean }[] = [];

  for (const image of images) {
    if (image.file) {
      // Upload new file
      const fileExt = image.file.name.split(".").pop();
      const fileName = `${productId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from("product-images")
        .upload(fileName, image.file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error("Failed to upload image:", error);
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("product-images")
        .getPublicUrl(data.path);

      uploadedImages.push({
        url: publicUrl,
        isPrimary: image.isPrimary,
      });
    } else if (image.id) {
      // Existing image
      uploadedImages.push({
        url: image.url,
        isPrimary: image.isPrimary,
      });
    }
  }

  return uploadedImages;
}
