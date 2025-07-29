import { useState, useEffect, useRef } from "react";
import { FormField } from "./FormField";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Upload, Image as ImageIcon } from "lucide-react";

interface TestimonialsFormProps {
  register: any;
  errors: any;
  setValue?: any;
  watch?: any;
}

interface TestimonialData {
  id: string;
  text: string;
  userName: string;
  userImage?: string;
}

export const TestimonialsForm: React.FC<TestimonialsFormProps> = ({ register, errors, setValue, watch }) => {
  const [testimonials, setTestimonials] = useState<TestimonialData[]>([
    {
      id: "1",
      text: "XUTHORITY has transformed the way we manage customer feedback. With real-time tracking, seamless response management, and automation features, we can easily build trust and strengthen our reputation. The intuitive dashboard makes navigating reviews effortless, saving us valuable time.",
      userName: "Alice",
      userImage: "/api/placeholder/60/60", // Placeholder image
    },
    {
      id: "2",
      text: "",
      userName: "",
      userImage: undefined,
    },
  ]);

  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  // Update form value when testimonials change
  useEffect(() => {
    if (setValue) {
      setValue("testimonials", testimonials);
    }
  }, [testimonials, setValue]);

  const addTestimonial = () => {
    const newTestimonial: TestimonialData = {
      id: Date.now().toString(),
      text: "",
      userName: "",
      userImage: undefined,
    };
    setTestimonials([...testimonials, newTestimonial]);
  };

  const removeTestimonial = (testimonialId: string) => {
    setTestimonials(testimonials.filter((t) => t.id !== testimonialId));
  };

  const updateTestimonial = (testimonialId: string, field: keyof TestimonialData, value: string) => {
    setTestimonials(
      testimonials.map((t) => {
        if (t.id === testimonialId) {
          return { ...t, [field]: value };
        }
        return t;
      })
    );
  };

  const handleImageUpload = (testimonialId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real app, you would upload the file to a server and get a URL back
      // For now, we'll use a local object URL as a placeholder
      const imageUrl = URL.createObjectURL(file);
      updateTestimonial(testimonialId, "userImage", imageUrl);
    }
  };

  const triggerImageUpload = (testimonialId: string) => {
    fileInputRefs.current[testimonialId]?.click();
  };

  return (
    <>
      <FormField
        id="heading"
        label="Heading"
        placeholder="Write heading..."
        register={register}
        error={errors?.heading}
      />

      <div className="space-y-6">
        {testimonials.map((testimonial, index) => (
          <div key={testimonial.id} className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-gray-600">
                Testimonial {index + 1}
              </Label>
              {testimonials.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeTestimonial(testimonial.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>

            <Textarea
              value={testimonial.text}
              onChange={(e) => updateTestimonial(testimonial.id, "text", e.target.value)}
              placeholder="Write text here..."
              rows={5}
              className="w-full px-5 py-4 text-base border-gray-200 rounded-3xl resize-none focus:border-gray-300 focus:ring-0 placeholder:text-gray-400"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* User Image */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600">User Image</Label>
                <div className="flex items-center gap-4">
                  {testimonial.userImage ? (
                    <div className="relative">
                      <img
                        src={testimonial.userImage}
                        alt="User"
                        className="w-14 h-14 rounded-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => triggerImageUpload(testimonial.id)}
                    className="text-blue-600 hover:text-blue-700 p-0 h-auto font-normal"
                  >
                    {testimonial.userImage ? "Change User Image" : "Upload User Image"}
                  </Button>
                  <input
                    ref={(el) => (fileInputRefs.current[testimonial.id] = el)}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(testimonial.id, e)}
                    className="hidden"
                  />
                </div>
              </div>

              {/* User Name */}
              <div className="space-y-2">
                <Label htmlFor={`userName-${testimonial.id}`} className="text-sm font-medium text-gray-600">
                  User Name
                </Label>
                <Input
                  id={`userName-${testimonial.id}`}
                  type="text"
                  value={testimonial.userName}
                  onChange={(e) => updateTestimonial(testimonial.id, "userName", e.target.value)}
                  placeholder="Enter user name"
                  className="w-full h-14 px-5 text-base border-gray-200 rounded-full focus:border-gray-300 focus:ring-0 placeholder:text-gray-400"
                />
              </div>
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="ghost"
          onClick={addTestimonial}
          className="text-blue-500 hover:text-blue-600 font-medium flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add More
        </Button>
      </div>

      {errors?.testimonials && (
        <p className="text-sm text-red-500 mt-1">{errors.testimonials.message}</p>
      )}
    </>
  );
};