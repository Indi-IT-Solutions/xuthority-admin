import React from "react";
import NotFoundPage from "./NotFoundPage";
import { Search, RefreshCw } from "lucide-react";

interface EmptyStateProps {
  /** Custom title for the empty state */
  title?: string;
  /** Custom description */
  description?: string;
  /** Custom image source - defaults to no_data.svg */
  imageSrc?: string;
  /** Custom button text */
  buttonText?: string;
  /** Custom callback function */
  onButtonClick?: () => void;
  /** Show refresh button */
  showRefreshButton?: boolean;
  /** Custom container height classes */
  containerHeight?: string;
}

export default function EmptyState({
  title = "No data found",
  description = "There's nothing to display here yet.",
  imageSrc = "/svg/no_data.svg",
  buttonText = "Refresh",
  onButtonClick,
  showRefreshButton = true,
  containerHeight = "min-h-[40vh]",
}: EmptyStateProps) {
  const handleRefresh = () => {
    if (onButtonClick) {
      onButtonClick();
    } else {
      window.location.reload();
    }
  };

  return (
    <NotFoundPage
      title={title}
      description={description}
      imageSrc={imageSrc}
      imageAlt="No data"
      buttonText={buttonText}
      buttonIcon={showRefreshButton ? RefreshCw : Search}
      containerHeight={containerHeight}
      onButtonClick={handleRefresh}
    />
  );
} 