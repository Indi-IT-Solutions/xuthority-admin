import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Save } from 'lucide-react';

const SettingsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-gray-600">
          Configure admin panel and platform settings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="siteName">Site Name</Label>
              <Input id="siteName" placeholder="Xuthority" />
            </div>
            <div>
              <Label htmlFor="siteDescription">Site Description</Label>
              <Input id="siteDescription" placeholder="Professional software reviews and comparisons" />
            </div>
            <div>
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input id="contactEmail" type="email" placeholder="admin@xuthority.com" />
            </div>
            <Button>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Admin Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="itemsPerPage">Items Per Page</Label>
              <Input id="itemsPerPage" type="number" placeholder="20" />
            </div>
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Input id="timezone" placeholder="UTC" />
            </div>
            <Button>
              <Save className="w-4 h-4 mr-2" />
              Save Preferences
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Version:</strong> 1.0.0
            </div>
            <div>
              <strong>Environment:</strong> Development
            </div>
            <div>
              <strong>Database:</strong> Connected
            </div>
            <div>
              <strong>Storage:</strong> Available
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage; 