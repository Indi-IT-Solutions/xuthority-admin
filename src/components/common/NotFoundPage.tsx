import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";

interface NotFoundPageProps {
  /** Custom title for the not found message */
  title?: string;
  /** Custom description/subtitle */
  description?: string;
  /** Custom image source - defaults to 404.svg */
  imageSrc?: string;
  /** Custom image alt text */
  imageAlt?: string;
  /** Custom button text */
  buttonText?: string;
  /** Custom navigation path - defaults to home */
  navigateTo?: string;
  /** Custom button icon */
  buttonIcon?: React.ComponentType<any>;
  /** Custom container height classes */
  containerHeight?: string;
  /** Show back button instead of home button */
  showBackButton?: boolean;
  /** Custom callback function instead of navigation */
  onButtonClick?: () => void;
}

export default function NotFoundPage({
  title = "Oops! Not found.",
  description,
  imageSrc = "/svg/404.svg",
  imageAlt = "Not found",
  buttonText = "Go Back Home",
  navigateTo = "/",
  buttonIcon: ButtonIcon = ArrowLeft,
  containerHeight = "min-h-[80vh]",
  showBackButton = false,
  onButtonClick,
}: NotFoundPageProps) {
  const navigate = useNavigate();

  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick();
    } else if (showBackButton) {
      navigate(-1);
    } else {
      navigate(navigateTo);
    }
  };

  const defaultButtonIcon = showBackButton ? ArrowLeft : Home;
  const IconComponent = ButtonIcon || defaultButtonIcon;

  return (
    <div className={`text-center text-gray-700 ${containerHeight} flex flex-col items-center justify-center px-4`}>
      <img 
        src={imageSrc} 
        alt={imageAlt} 
        className="w-64 h-64 sm:w-96 sm:h-96 mb-6" 
      />
      <div className="text-xl font-bold text-gray-700 mb-2">
        {title}
      </div>
      {description && (
        <div className="text-gray-600 mb-6 max-w-md">
          {description}
        </div>
      )}
      <Button 
        variant="default" 
        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-full py-2 shadow-none" 
        onClick={handleButtonClick}
      >
        <IconComponent className="w-4 h-4 mr-2" />
        {buttonText}
      </Button>
    </div>
  );
} 