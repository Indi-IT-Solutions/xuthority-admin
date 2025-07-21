import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Search, Filter, MoreVertical } from 'lucide-react';

const ReviewsPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reviews</h1>
          <p className="text-gray-600">
            Monitor and moderate user reviews.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">8,921</div>
            <p className="text-sm text-gray-600">Total Reviews</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">8,654</div>
            <p className="text-sm text-gray-600">Published</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">267</div>
            <p className="text-sm text-gray-600">Pending Review</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">4.2</div>
            <p className="text-sm text-gray-600">Avg Rating</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Reviews</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search reviews..."
                  className="pl-10 pr-4 py-2 border rounded-md text-sm"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Reviews management coming soon...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReviewsPage; 