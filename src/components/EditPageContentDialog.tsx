import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const pageContentFormSchema = z.object({
  content: z.string().min(1, "Page content is required"),
});

type PageContentFormValues = z.infer<typeof pageContentFormSchema>;

interface EditPageContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialContent: string;
  onUpdate: (content: string) => void;
  title: string;
  description: string;
  contentLabel?: string;
  isLoading?: boolean;
}

export function EditPageContentDialog({
  open,
  onOpenChange,
  initialContent,
  onUpdate,
  title,
  description,
  contentLabel = "Content",
  isLoading = false,
}: EditPageContentDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PageContentFormValues>({
    resolver: zodResolver(pageContentFormSchema),
    defaultValues: {
      content: initialContent,
    },
  });

  // Reset form when modal opens with new content
  useEffect(() => {
    if (open) {
      reset({ content: initialContent });
    }
  }, [open, initialContent, reset]);

  const onSubmit = (data: PageContentFormValues) => {
    onUpdate(data.content);
    onOpenChange(false);
  };

  const handleCancel = () => {
    reset({ content: initialContent });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {title}
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            {description}
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto px-1">
            <div className="space-y-4">
              <div>
                <Label htmlFor="content" className="text-base font-medium">
                  Content
                </Label>
                <div className="mt-2">
                  <Textarea
                    {...register("content")}
                    id="content"
                    className="min-h-[300px]  text-sm resize-none max-h-[400px]"
                    placeholder="Enter page content..."
                  />
                  {errors.content && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.content.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              className="flex-1 h-12 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full disabled:opacity-50"
            >
              {isLoading ? "Updating..." : "Update Now"}
            </Button>
          </div>
        
        </form>
      </DialogContent>
    </Dialog>
  );
}