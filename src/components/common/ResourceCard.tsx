import React from 'react';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Edit2, ExternalLink, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResourceCardAuthor {
  name: string;
  title: string;
  avatar?: string;
}

interface ResourceCardProps {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  status: 'On Demand' | 'Upcoming';
  contentType: string;
  author: ResourceCardAuthor;
  onEdit?: () => void;
  onDelete?: () => void;
  onClick?: () => void;
  className?: string;
}

const ResourceCard: React.FC<ResourceCardProps> = ({
  id,
  title,
  description,
  imageUrl,
  status,
  contentType,
  author,
  onEdit,
  onDelete,
  onClick,
  className
}) => {
  const getContentTypeBadge = () => {
    const contentTypeVariants = {
      'On Demand': 'text-red-600 bg-red-50',
      'Upcoming': 'text-blue-600 bg-blue-50',
      'EBook': 'text-green-600 bg-green-50',
      'Marketing': 'text-purple-600 bg-purple-50',
      'Sales': 'text-orange-600 bg-orange-50'
    };

    // Only show badge if it's one of the valid content types
    if (!contentTypeVariants[contentType]) {
      return null;
    }

    return (
      <Badge 
        className={cn(
          'px-2 py-1 text-xs font-medium rounded-md border-0',
          contentTypeVariants[contentType]
        )}
      >
        {contentType}
      </Badge>
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div 
      className={cn(
        'group relative bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-md',
        className
      )}
    >
      {/* Image Container */}
      <div 
        className="relative aspect-video overflow-hidden bg-gray-100 cursor-pointer"
        onClick={onClick}
      >
        <img
          src={imageUrl}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=500&q=80';
          }}
        />
        

      </div>

      {/* Content */}
      <div 
        className="p-4 cursor-pointer"
        onClick={onClick}
      >
        {/* Content Type Badge */}
        <div className="mb-3 flex justify-between items-center">
          {getContentTypeBadge()}

                  {/* Action Icons */}
        <div className=" flex gap-2  group-hover:opacity-100 transition-opacity duration-200">
            {onEdit && (
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 bg-blue-100 hover:bg-bg-blue-100/50"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Edit className="h-4 w-4 text-blue-600" />
            </Button>
          )}
          {onDelete && (
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 bg-red-100 hover:bg-red-100/50"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
          )}
        </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 leading-tight">
          {title}
        </h3>


        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};

export default ResourceCard; 