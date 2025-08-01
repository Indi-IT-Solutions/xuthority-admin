import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageBySlug, useUpdatePage } from "@/hooks/usePages";
import { EditPageContentDialog } from "@/components/EditPageContentDialog";
import { toast } from "react-hot-toast";
import { Skeleton } from "@/components/ui/skeleton";

// Skeleton loading component for page view
const PageViewSkeleton = () => (
  <div className="mx-auto">
    {/* Header Skeleton */}
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <Skeleton className="h-10 w-10 rounded-lg" />
    </div>

    {/* Content Skeleton */}
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
      <div className="space-y-6">
        {/* Title skeleton */}
        <Skeleton className="h-8 w-3/4" />
        
        {/* Paragraph skeletons */}
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        ))}
        
        {/* Additional content skeletons */}
        <div className="space-y-4 mt-8">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    </div>
  </div>
);

const PageViewPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const updatePage = useUpdatePage();
  
  // Modal state for system pages
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Fetch page data by slug
  const { data: pageData, isLoading, error, refetch } = usePageBySlug(slug || '');

  const handleBack = () => {
    navigate('/pages');
  };

  const handleEdit = () => {
    console.log('slug', slug)
    // For system pages, open the modal instead
    const systemPages = ['terms-conditions', 'privacy-policy', 'about-us'];
    if (slug && systemPages.includes(slug)) {
      setIsModalOpen(true);
      return;
    }
    
    // For other pages, navigate to edit page
    navigate(`/pages/${slug}/edit`);
  };

  const handleContentUpdate = async (newContent: string) => {
    if (!pageData?.data?._id) {
      toast.error('Page data not loaded');
      return;
    }



    try {
      await updatePage.mutateAsync({
        pageId: pageData.data._id,
        data: {
          name: pageData.data.name,
          content: newContent
        }
      });
      
      // Refetch page data to show updated content
      refetch();
      toast.dismiss()
      toast.success('Page updated successfully');
    } catch (error) {
      // Error is handled by the mutation hook
      console.error('Failed to update page:', error);
    }
  };

  // Get modal configuration based on page slug
  const getModalConfig = () => {
    switch (slug) {
      case 'terms-conditions':
        return {
          title: 'Edit Terms & Conditions',
          description: 'Update the rules and policies that govern how users and vendors interact with your platform.',
        };
      case 'privacy-policy':
        return {
          title: 'Edit Privacy Policy',
          description: 'Update your privacy policy to explain how you collect, use, and protect user data.',
        };
      case 'about-us':
        return {
          title: 'Edit About Us',
          description: 'Update information about your company, mission, and values.',
         
        };
      default:
        return {
          title: 'Edit Page Content',
          description: 'Update the content for this page.',
        };
    }
  };

  // Loading state
  if (isLoading) {
    return <PageViewSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <div className="mx-auto">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-red-500 text-center mb-4">
            <p className="text-lg font-medium">Failed to load page</p>
            <p className="text-sm mt-1">{(error as any)?.message}</p>
          </div>
          <Button onClick={handleBack} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // No page found
  if (!pageData?.data) {
    return (
      <div className="mx-auto">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-gray-500 text-center mb-4">
            <p className="text-lg font-medium">Page not found</p>
          </div>
          <Button onClick={handleBack} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const page = pageData.data;
  console.log('Updating page with data:',pageData);
  return (
    <div className=" mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">

          <div className="flex items-center space-x-2 text-gray-600">
            <span onClick={()=>navigate('/pages')} className="cursor-pointer">Pages</span>
            <span>/</span>
            <span className="font-medium text-gray-900">{page.name}</span>
          </div>
        </div>
        <button
          onClick={handleEdit}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-blue-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Edit page"
          disabled={updatePage.isPending}
        >
          {updatePage.isPending ? (
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Edit className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 relative">
        {updatePage.isPending && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-2xl">
            <div className="flex items-center space-x-2 text-blue-600">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium">Updating page...</span>
            </div>
          </div>
        )}
        <div className="prose prose-gray max-w-none">
          {/* Render content based on page type */}
          {page.content ? (
            <div  className="whitespace-pre-wrap" >
              {page.content}
            </div>
          ) : (
            <div className="space-y-6 text-gray-700 leading-relaxed">
              {slug === 'about-us' && (
                <>
                  <p className="text-lg">
                    Xuthority is a trusted review and discovery platform that empowers businesses to showcase their software and digital solutions through verified reviews, transparent ratings, and achievement-based badges. Whether you're a startup, enterprise, or service provider, Xuthority helps you stand out and build credibility through real user feedback.
                  </p>
                  
                  <p className="text-lg">
                    We believe that the best decisions are informed decisions. That's why we've built a community-driven ecosystem where users can explore, compare, and evaluate tools based on authentic experiences — not just marketing claims. Every review is vetted for quality, every badge earned through performance, and every profile crafted to reflect real-world impact.
                  </p>
                  
                  <p className="text-lg">
                    For vendors, Xuthority offers a powerful suite of features to gain visibility, engage with users, track performance, and earn recognition in their category. From emerging tools to established platforms, we help brands grow through trust, not tactics.
                  </p>
                  
                  <p className="text-lg">
                    For users, we simplify the search for the right solution — whether you're looking for a CRM, project management tool, HR platform, or anything in between. Filter by category, industry, features, or business size to find what works best for your needs.
                  </p>
                  
                  <p className="text-lg">
                    At Xuthority, we connect the right tools with the right audiences — making discovery smarter, feedback stronger, and decisions easier.
                  </p>
                </>
              )}
              
              {slug === 'privacy-policy' && (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Privacy Policy</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">1. Information We Collect</h3>
                      <p>We collect information you provide directly to us, such as when you create an account, submit a review, or contact us for support.</p>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">2. How We Use Your Information</h3>
                      <p>We use the information we collect to provide, maintain, and improve our services, to communicate with you, and to comply with legal obligations.</p>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">3. Information Sharing</h3>
                      <p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.</p>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">4. Data Security</h3>
                      <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">5. Your Rights</h3>
                      <p>You have the right to access, update, or delete your personal information. You may also opt out of certain communications from us.</p>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">6. Contact Us</h3>
                      <p>If you have any questions about this Privacy Policy, please contact us at privacy@xuthority.com.</p>
                    </div>
                  </div>
                </>
              )}
              
              {slug === 'terms-and-conditions' && (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Terms and Conditions</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">1. Acceptance of Terms</h3>
                      <p>By accessing and using Xuthority, you accept and agree to be bound by these Terms and Conditions.</p>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">2. Use of Service</h3>
                      <p>You may use our service only for lawful purposes and in accordance with these Terms. You agree not to use our service in any way that violates any applicable federal, state, local, or international law or regulation.</p>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">3. User Accounts</h3>
                      <p>When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities that occur under your account.</p>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">4. Content Standards</h3>
                      <p>All user-generated content must be accurate, genuine, and comply with our community guidelines. We reserve the right to remove any content that violates these standards.</p>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">5. Intellectual Property</h3>
                      <p>The service and its original content, features, and functionality are and will remain the exclusive property of Xuthority and its licensors.</p>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">6. Limitation of Liability</h3>
                      <p>In no event shall Xuthority, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages.</p>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">7. Changes to Terms</h3>
                      <p>We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>


      {/* Page Content Edit Modal */}
      <EditPageContentDialog
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        initialContent={pageData?.data?.content || ''}
        onUpdate={handleContentUpdate}
        isLoading={updatePage.isPending}
        {...getModalConfig()}
      />
    </div>
  );
};

export default PageViewPage;