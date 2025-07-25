import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import ResourceCard from '@/components/common/ResourceCard';
import { cn } from '@/lib/utils';
import AdminLayout from '@/components/layout/AdminLayout';

interface ResourceItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  status: 'On Demand' | 'Upcoming';
  author: {
    name: string;
    title: string;
    avatar?: string;
  };
}

type TabType = 'All' | 'Webinars' | 'XUTHORITY Edge' | 'Guides and Tips' | 'Success Hub';

const ResourceCenterPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('All');

  // Mock data for different sections
  const webinarsData: ResourceItem[] = [
    {
      id: 'webinar-1',
      title: 'Unlock Revenue Growth: Exclusive Fireside Chat',
      description: 'Facts: Sales is harder than ever. Sales cycles are longer, shortlists are shorter.',
      imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=500&q=80',
      status: 'On Demand',
      author: {
        name: 'Eric Gilpin',
        title: 'Chief Revenue Officer',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=32&q=80'
      }
    },
    {
      id: 'webinar-2',
      title: 'Intent to revenue: Leveraging intent...',
      description: 'Why waste money on prospects who aren\'t actively in-market? Join speaker...',
      imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=500&q=80',
      status: 'On Demand',
      author: {
        name: 'Sarah Johnson',
        title: 'VP of Marketing',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=32&q=80'
      }
    },
    {
      id: 'webinar-3',
      title: 'Building a Unified GTM with Eric Gil...',
      description: 'Facts: Sales is harder than ever. Sales cycles are longer, shortlists are shorter...',
      imageUrl: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=500&q=80',
      status: 'On Demand',
      author: {
        name: 'Eric Gilpin',
        title: 'Chief Revenue Officer',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=32&q=80'
      }
    }
  ];

  const xuthorityEdgeData: ResourceItem[] = [
    {
      id: 'edge-1',
      title: 'Better social content started with ...',
      description: 'Facts: Sales is harder than ever. Sales cycles are longer, shortlists are shorter...',
      imageUrl: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?auto=format&fit=crop&w=500&q=80',
      status: 'Upcoming',
      author: {
        name: 'Jessica Smith',
        title: 'Content Marketing Lead',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=32&q=80'
      }
    },
    {
      id: 'edge-2',
      title: 'Replay Ready: Churn No More, Kee...',
      description: 'Why waste money on prospects who aren\'t actively in-market? Join speaker...',
      imageUrl: 'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=500&q=80',
      status: 'On Demand',
      author: {
        name: 'David Chen',
        title: 'Customer Success Manager',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=32&q=80'
      }
    },
    {
      id: 'edge-3',
      title: 'How To Prepare for Reports Season...',
      description: 'Facts: Sales is harder than ever. Sales cycles are longer, shortlists are shorter...',
      imageUrl: 'https://images.unsplash.com/photo-1553484771-cc0d63b8cd96?auto=format&fit=crop&w=500&q=80',
      status: 'On Demand',
      author: {
        name: 'Maria Rodriguez',
        title: 'Financial Analyst',
        avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?auto=format&fit=crop&w=32&q=80'
      }
    }
  ];

  const guidesData: ResourceItem[] = [
    {
      id: 'guide-1',
      title: 'Complete Guide to B2B Sales Automation',
      description: 'Learn how to implement sales automation that actually works for your team...',
      imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=500&q=80',
      status: 'On Demand',
      author: {
        name: 'Michael Brown',
        title: 'Sales Operations Director',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=32&q=80'
      }
    },
    {
      id: 'guide-2',
      title: 'Lead Scoring Best Practices Guide',
      description: 'Master the art of lead scoring to prioritize your most valuable prospects...',
      imageUrl: 'https://images.unsplash.com/photo-1552664688-cf412ec27db2?auto=format&fit=crop&w=500&q=80',
      status: 'On Demand',
      author: {
        name: 'Lisa Wang',
        title: 'Marketing Automation Expert',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=32&q=80'
      }
    },
    {
      id: 'guide-3',
      title: 'Customer Retention Strategies That Work',
      description: 'Proven strategies to reduce churn and increase customer lifetime value...',
      imageUrl: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=500&q=80',
      status: 'On Demand',
      author: {
        name: 'Alex Thompson',
        title: 'Customer Success Lead',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=32&q=80'
      }
    }
  ];

  const tabs: TabType[] = ['All', 'Webinars', 'XUTHORITY Edge', 'Guides and Tips', 'Success Hub'];

  const handleShare = (id: string) => {
    console.log('Share resource:', id);
    // Implement share functionality
  };

  const handleDelete = (id: string) => {
    console.log('Delete resource:', id);
    // Implement delete functionality
  };

  const handleResourceClick = (id: string) => {
    console.log('Open resource:', id);
    // Implement navigation to resource detail
  };

  const handleEdit = (id: string) => {
    console.log('Edit resource:', id);
    // Implement edit functionality
  };

  const handleAddNewResource = () => {
    navigate('/resource-center/add');
  };

  const filteredData = () => {
    switch (activeTab) {
      case 'Webinars':
        return { webinars: webinarsData, xuthorityEdge: [], guides: [] };
      case 'XUTHORITY Edge':
        return { webinars: [], xuthorityEdge: xuthorityEdgeData, guides: [] };
      case 'Guides and Tips':
        return { webinars: [], xuthorityEdge: [], guides: guidesData };
      case 'Success Hub':
        return { webinars: [], xuthorityEdge: [], guides: [] };
      default:
        return { webinars: webinarsData, xuthorityEdge: xuthorityEdgeData, guides: guidesData };
    }
  };

  const { webinars, xuthorityEdge, guides } = filteredData();

  return (
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">
            Resource Center
          </h1>
          <Button 
            onClick={handleAddNewResource}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full  flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add New Resource
          </Button>
        </div>

        {/* Filter Tabs */}
        <div className="mb-8">
          <div className="bg-gray-100 p-1 rounded-full w-fit max-w-full overflow-hidden">
            <div className="flex gap-1 overflow-x-auto scrollbar-hide scroll-smooth">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    'px-6 py-2 text-sm font-medium rounded-full h-12 transition-all duration-200 cursor-pointer whitespace-nowrap flex-shrink-0',
                    activeTab === tab
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-12">
          {/* Webinars Section */}
          {webinars.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Webinars</h2>
                <button className="text-red-600 hover:text-red-700 font-medium text-sm underline cursor-pointer">
                  View All
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {webinars.map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    {...resource}
                    onEdit={() => handleEdit(resource.id)}
                    onDelete={() => handleDelete(resource.id)}
                    onClick={() => handleResourceClick(resource.id)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* XUTHORITY Edge Section */}
          {xuthorityEdge.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">XUTHORITY Edge</h2>
                <button className="text-red-600 hover:text-red-700 font-medium text-sm underline cursor-pointer">
                  View All
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {xuthorityEdge.map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    {...resource}
                        onEdit={() => handleEdit(resource.id)}
                    onDelete={() => handleDelete(resource.id)}
                    onClick={() => handleResourceClick(resource.id)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Guides and Tips Section */}
          {guides.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Guides and Tips</h2>
                    <button className="text-red-600 hover:text-red-700 font-medium text-sm underline cursor-pointer">
                  View All
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {guides.map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    {...resource}
                    onEdit={() => handleEdit(resource.id)}
                    onDelete={() => handleDelete(resource.id)}
                    onClick={() => handleResourceClick(resource.id)}
                  />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Empty State for Success Hub */}
        {activeTab === 'Success Hub' && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Success Hub Coming Soon</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              We're working on exciting success hub content. Check back soon for updates.
            </p>
          </div>
        )}
      </div>
  );
};

export default ResourceCenterPage; 