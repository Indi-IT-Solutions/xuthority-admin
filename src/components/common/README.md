# Reusable Components

## ReviewsTable

A reusable table component for displaying reviews with dynamic action menus based on review status, checkbox selection functionality, and bulk delete operations.

### Features

- ✅ **Select All checkbox** in header with indeterminate state
- ✅ **Individual checkboxes** for each row
- ✅ **Bulk selection tracking** with callback support
- ✅ **Bulk delete button** that appears when reviews are selected
- ✅ Profile images and names for reviewers  
- ✅ Star ratings display
- ✅ Status badges (Published, Pending, Dispute)
- ✅ Dynamic action menus based on status
- ✅ "See All" button in header
- ✅ Mobile responsive design
- ✅ Hover effects and transitions

### Checkbox Functionality

#### Select All Checkbox
- **Checked**: When all reviews are selected
- **Indeterminate**: When some (but not all) reviews are selected  
- **Unchecked**: When no reviews are selected
- **Click behavior**: Toggles between select all / deselect all

#### Individual Checkboxes
- **Controlled state**: Each checkbox reflects selection status
- **Auto-sync**: Automatically updates "Select All" state
- **Callback support**: Triggers `onSelectedReviewsChange` when selection changes

### Bulk Delete Functionality

#### Bulk Delete Button
- **Visibility**: Appears next to table title when reviews are selected
- **Design**: Red button with trash icon and count `Delete (3)`
- **Position**: In table header, left side next to title
- **Responsive**: Proper sizing for mobile and desktop
- **Auto-clear**: Clears selection after successful bulk delete

#### Bulk Delete Process
1. **Select reviews** using checkboxes
2. **Click "Delete (X)" button** in table header
3. **Confirmation dialog** shows selected count
4. **Bulk delete operation** executes if confirmed
5. **Selection cleared** automatically after operation

### Action Menus by Status

#### Published Reviews
- 👁️ **View Details** (Blue eye icon)
- 🗑️ **Delete Review** (Red trash icon)

#### Pending Reviews  
- 👁️ **View Details** (Blue eye icon)
- ✅ **Approve** (Green check icon)
- ❌ **Reject** (Red X icon)

#### Dispute Reviews
- 👁️ **View Details** (Blue eye icon) 
- ✅ **Resolve** (Green check icon)
- 🗑️ **Delete** (Red X icon)

### Usage

```tsx
import { useState } from 'react';
import { ReviewsTable } from '@/components/common';

const [selectedReviews, setSelectedReviews] = useState<number[]>([]);

const sampleReviews = [
  {
    id: 1,
    reviewer: {
      name: 'Regina Pacheco',
      avatar: 'https://example.com/avatar.jpg'
    },
    product: 'Freshbook',
    review: 'Super intuitive and easy to manage invoices...',
    rating: 5,
    date: 'Jul 10, 2025',
    status: 'Published' as const
  },
  // ... more reviews
];

// Action handlers
const handleViewDetails = (reviewId: number) => {
  console.log('View details for review:', reviewId);
};

const handleDeleteReview = (reviewId: number) => {
  console.log('Delete review:', reviewId);
};

const handleApproveReview = (reviewId: number) => {
  console.log('Approve review:', reviewId);
};

const handleRejectReview = (reviewId: number) => {
  console.log('Reject review:', reviewId);
};

const handleResolveDispute = (reviewId: number) => {
  console.log('Resolve dispute for review:', reviewId);
};

const handleSelectedReviewsChange = (selectedIds: number[]) => {
  setSelectedReviews(selectedIds);
  console.log('Selected reviews:', selectedIds);
};

const handleBulkDelete = (selectedIds: number[]) => {
  console.log('Bulk delete reviews:', selectedIds);
  
  // Show confirmation dialog
  const reviewCount = selectedIds.length;
  const confirmed = confirm(
    `Are you sure you want to delete ${reviewCount} selected review${reviewCount > 1 ? 's' : ''}?`
  );
  
  if (confirmed) {
    // Perform bulk delete operation
    selectedIds.forEach(id => handleDeleteReview(id));
    setSelectedReviews([]); // Clear selection
    alert(`Successfully deleted ${reviewCount} review${reviewCount > 1 ? 's' : ''}.`);
  }
};

<ReviewsTable 
  reviews={sampleReviews} 
  onSeeAll={() => console.log('Navigate to all reviews')}
  onViewDetails={handleViewDetails}
  onDeleteReview={handleDeleteReview}
  onApproveReview={handleApproveReview}
  onRejectReview={handleRejectReview}
  onResolveDispute={handleResolveDispute}
  onSelectedReviewsChange={handleSelectedReviewsChange}
  onBulkDelete={handleBulkDelete}
/>

{/* Show selected count */}
{selectedReviews.length > 0 && (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
    <p className="text-blue-800 text-sm">
      <strong>{selectedReviews.length}</strong> review{selectedReviews.length > 1 ? 's' : ''} selected.
      Use the bulk delete button in the table header to delete multiple reviews at once.
    </p>
  </div>
)}
```

### Props

- `reviews`: Array of review objects
- `onSeeAll`: Optional callback for "See All" button
- `onViewDetails`: Optional callback for viewing review details
- `onDeleteReview`: Optional callback for deleting reviews
- `onApproveReview`: Optional callback for approving pending reviews
- `onRejectReview`: Optional callback for rejecting pending reviews  
- `onResolveDispute`: Optional callback for resolving disputed reviews
- `onSelectedReviewsChange`: Optional callback when checkbox selection changes
- `onBulkDelete`: Optional callback for bulk delete operations

### Review Object Structure

```typescript
interface Review {
  id: number;
  reviewer: {
    name: string;
    avatar: string;
  };
  product: string;
  review: string;
  rating: number; // 1-5 stars
  date: string;
  status: 'Published' | 'Pending' | 'Dispute';
}
```

### Advanced Bulk Operations

```tsx
// Example: Bulk approve pending reviews
const handleBulkApprove = () => {
  if (selectedReviews.length > 0) {
    const pendingReviews = selectedReviews.filter(id => {
      const review = reviews.find(r => r.id === id);
      return review?.status === 'Pending';
    });
    
    if (pendingReviews.length > 0) {
      const confirmed = confirm(`Approve ${pendingReviews.length} pending reviews?`);
      if (confirmed) {
        pendingReviews.forEach(id => handleApproveReview(id));
        setSelectedReviews([]);
      }
    } else {
      alert('No pending reviews selected.');
    }
  }
};

// Example: Bulk operations based on status
const handleBulkActions = () => {
  const groupedByStatus = selectedReviews.reduce((acc, id) => {
    const review = reviews.find(r => r.id === id);
    if (review) {
      if (!acc[review.status]) acc[review.status] = [];
      acc[review.status].push(id);
    }
    return acc;
  }, {} as Record<string, number[]>);
  
  console.log('Selected by status:', groupedByStatus);
  // Perform different actions based on status
};
```

## Other Components

- **StatsCard**: Displays key metrics with icons
- **TimeFilter**: Filter buttons for Weekly/Monthly/Yearly views 