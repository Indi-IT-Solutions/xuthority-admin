import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EnhancedLoader } from "@/components/common";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AdminProductService } from "@/services/adminProductService";
import { useQuery } from "@tanstack/react-query";
import ReadMoreText from "@/components/common/ReadMoreText";
import { useApproveProduct, useRejectProduct } from "@/hooks/useAdminProducts";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { Textarea } from "@/components/ui/textarea";

const ProductDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  // Declare all hooks before any return to keep hook order stable across renders
  const approveMutation = useApproveProduct();
  const rejectMutation = useRejectProduct();
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-product", slug],
    queryFn: async () => AdminProductService.getBySlug(slug as string),
    enabled: !!slug,
  });

  if (isLoading) return <EnhancedLoader loadingText="Loading product..." showText />;
  if (error || !data?.success || !data?.data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-4">The product you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/products')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  const product = data.data;

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
  };

  const getStatusBadgeProps = (
    status?: string
  ): { variant?: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string } => {
    switch ((status || '').toLowerCase()) {
      case 'published':
        return { variant: 'secondary', className: 'bg-green-100 text-green-800 border-green-200' };
      case 'pending':
        return { variant: 'secondary', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
      case 'update_pending':
        return { variant: 'secondary', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
      case 'rejected':
      case 'update_rejected':
        return { variant: 'destructive' };
      default:
        return { variant: 'outline', className: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6">
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center text-xs sm:text-sm text-gray-600">
          <button onClick={() => navigate('/products')} className="hover:text-gray-800 transition-colors cursor-pointer">
            Products
          </button>
          <span className="mx-2">/</span>
          <span className="text-gray-800 font-medium">
            {product.status === 'pending' || product.status === 'update_pending' ? 'Pending Product Details' : 'Product Details'}
          </span>
        </div>
        <div className="flex items-center flex-row-reverse gap-2">
          {(product.status === 'pending' || product.status === 'update_pending') ? (
            <>
              <Button
                onClick={() => setApproveModalOpen(true)}
                variant={'default'}
                className="rounded-full bg-blue-600 hover:bg-blue-500 text-xs sm:text-sm px-3 py-2 sm:px-4 sm:py-2 text-white"
              >
                Approve Product
              </Button>
              <Button
                onClick={() => { setRejectReason(''); setRejectModalOpen(true); }}
                variant={'destructive'}
                className="rounded-full bg-red-600 hover:bg-red-700 text-xs sm:text-sm px-3 py-2 sm:px-4 sm:py-2"
              >
                Reject Product
              </Button>
            </>
          ) : (
            product.status === 'published' && (
              <Button
                onClick={() => window.open(`https://xuthority.com/product-detail/${product.slug}`, '_blank')}
                variant={'default'}
                className="rounded-full bg-blue-600 hover:bg-blue-500 text-xs sm:text-sm px-3 py-2 sm:px-4 sm:py-2 text-white"
              >
                View Live
              </Button>
            )
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden p-3 sm:p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <div className="flex flex-col gap-4 lg:gap-6">
            <div className="w-full sm:w-88 h-40 sm:h-48 lg:h-56 bg-gray-900 flex items-center justify-center relative rounded-xl lg:rounded-2xl overflow-hidden">
              {product.logoUrl ? (
                <img src={product.logoUrl} alt={product.name} className="h-full w-full object-cover " />
              ) : (
                <div className="text-white text-6xl font-bold">
                  {product.name?.charAt(0) || 'P'}
                </div>
              )}
            </div>
          </div>

          {/* Right */}
          <div className="flex-1 p-0 ">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">
              <div>
                <label className="text-xs sm:text-sm text-gray-500 block mb-1">Product Name</label>
                <p className="line-clamp-2 break-words text-xs sm:text-sm md:text-base lg:text-base xl:text-lg font-medium" title={product.name}>
                  {product.name}
                </p>
              </div>
              <div>
                <label className="text-xs sm:text-sm text-gray-500 block mb-1">Vendor</label>
                <p className="line-clamp-2 break-words text-xs sm:text-sm md:text-base lg:text-base xl:text-lg" title={product.userId?.companyName || `${product.userId?.firstName || ''} ${product.userId?.lastName || ''}`.trim()}>
                  {product.userId?.companyName || `${product.userId?.firstName || ''} ${product.userId?.lastName || ''}`.trim() || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-xs sm:text-sm text-gray-500 block mb-1">Website</label>
                {product.websiteUrl ? (
                  <a href={product.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-xs sm:text-sm md:text-base lg:text-base xl:text-lg text-blue-600 hover:text-blue-800 flex items-center gap-1">
                    <span className="line-clamp-2 break-words" title={product.websiteUrl}>{product.websiteUrl}</span>
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  </a>
                ) : (
                  <p className="text-xs sm:text-sm md:text-base lg:text-base xl:text-lg text-gray-900">N/A</p>
                )}
              </div>
              <div>
                <label className="text-xs sm:text-sm text-gray-500 block mb-1">Status</label>
                <Badge className={`${getStatusBadgeProps(product.status).className} border-0 text-xs sm:text-sm capitalize`}>
                  {String(product.status).replace('_', ' ')}
                </Badge>
              </div>
              <div>
                <label className="text-xs sm:text-sm text-gray-500 block mb-1">Created On</label>
                <p className="text-gray-900">{formatDate(product.createdAt)}</p>
              </div>

              <div className="sm:col-span-2 lg:col-span-3 xl:col-span-5">
                <label className="text-xs sm:text-sm text-gray-500 block mb-1">Description</label>
                <p className="text-gray-700 leading-relaxed text-xs sm:text-sm lg:text-base whitespace-break-spaces whitespace-pre-line">
                  <ReadMoreText
          content={product.description}
          maxLines={4}
          className="mt-4 text-gray-600 leading-relaxed text-sm md:text-base whitespace-pre-line"
          buttonClassName="text-blue-600 hover:text-blue-800"
        >
          </ReadMoreText>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Attributes & Meta */}
      <div className="mt-6 bg-white rounded-lg sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden p-3 sm:p-4 lg:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Software */}
          <div>
            <label className="text-xs sm:text-sm text-gray-500 block mb-1">Software</label>
            <p className="text-xs sm:text-sm text-gray-800">
              {Array.isArray(product.softwareIds) && product.softwareIds.length > 0
                ? product.softwareIds.map((s: any) => (typeof s === 'string' ? s : s?.name)).filter(Boolean).join(', ')
                : '-'}
            </p>
          </div>

          {/* Solutions */}
          <div>
            <label className="text-xs sm:text-sm text-gray-500 block mb-1">Solutions</label>
            <p className="text-xs sm:text-sm text-gray-800">
              {Array.isArray(product.solutionIds) && product.solutionIds.length > 0
                ? product.solutionIds.map((s: any) => (typeof s === 'string' ? s : s?.name)).filter(Boolean).join(', ')
                : '-'}
            </p>
          </div>

          {/* Industries */}
          <div>
            <label className="text-xs sm:text-sm text-gray-500 block mb-1">Industries</label>
            <p className="text-xs sm:text-sm text-gray-800">
              {Array.isArray(product.industries) && product.industries.length > 0
                ? product.industries.map((i: any) => (typeof i === 'string' ? i : i?.name)).filter(Boolean).join(', ')
                : '-'}
            </p>
          </div>

          {/* Integrations */}
          <div>
            <label className="text-xs sm:text-sm text-gray-500 block mb-1">Integrations</label>
            <p className="text-xs sm:text-sm text-gray-800">
              {Array.isArray(product.integrations) && product.integrations.length > 0
                ? product.integrations.map((i: any) => (typeof i === 'string' ? i : i?.name)).filter(Boolean).join(', ')
                : '-'}
            </p>
          </div>

          {/* Languages */}
          <div>
            <label className="text-xs sm:text-sm text-gray-500 block mb-1">Languages</label>
            <p className="text-xs sm:text-sm text-gray-800">
              {Array.isArray(product.languages) && product.languages.length > 0
                ? product.languages.map((l: any) => (typeof l === 'string' ? l : l?.name)).filter(Boolean).join(', ')
                : '-'}
            </p>
          </div>

          {/* Market Segments */}
          <div>
            <label className="text-xs sm:text-sm text-gray-500 block mb-1">Market Segments</label>
            <p className="text-xs sm:text-sm text-gray-800">
              {Array.isArray(product.marketSegment) && product.marketSegment.length > 0
                ? product.marketSegment.map((m: any) => (typeof m === 'string' ? m : m?.name)).filter(Boolean).join(', ')
                : '-'}
            </p>
          </div>

          {/* Who Can Use */}
          <div>
            <label className="text-xs sm:text-sm text-gray-500 block mb-1">Who Can Use</label>
            <p className="text-xs sm:text-sm text-gray-800">
              {Array.isArray(product.whoCanUse) && product.whoCanUse.length > 0
                ? product.whoCanUse.map((w: any) => (typeof w === 'string' ? w : w?.name)).filter(Boolean).join(', ')
                : '-'}
            </p>
          </div>

          {/* Contact Email */}
          <div>
            <label className="text-xs sm:text-sm text-gray-500 block mb-1">Contact Email</label>
            <p className="text-xs sm:text-sm text-gray-800">{product.contactEmail || '-'}</p>
          </div>

          {/* Free / Brand Color */}
          <div>
            <label className="text-xs sm:text-sm text-gray-500 block mb-1">Available for Trial</label>
            <p className="text-xs sm:text-sm text-gray-800">{product.isFree ? 'Yes' : 'No'}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-500 block mb-1">Brand Color</label>
            <div className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 rounded" style={{ backgroundColor: product.brandColors || '#e5e7eb' }} />
              <span className="text-xs sm:text-sm text-gray-800">{product.brandColors || '-'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Media */}
      {Array.isArray(product.mediaUrls) && product.mediaUrls.length > 0 && (
        <div className="mt-6 bg-white rounded-lg sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden p-3 sm:p-4 lg:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Media</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {product.mediaUrls.map((url: string, idx: number) => {
              const isVideo = /\.(mp4|webm|mov|avi|mkv|flv|wmv|m4v|3gp|ogv)(\?.*)?$/i.test(url);
              return (
                <div key={idx} className="rounded-lg overflow-hidden border">
                  {isVideo ? (
                    <video src={url} controls preload="metadata" className="w-full h-full object-cover" />
                  ) : (
                    <img src={url} alt={`media-${idx}`} className="w-full h-full object-cover" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pricing */}
      {Array.isArray(product.pricing) && product.pricing.length > 0 && (
        <div className="mt-6 bg-white rounded-lg sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden p-3 sm:p-4 lg:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {product.pricing.map((plan: any, idx: number) => (
              <div key={idx} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{plan.name || `Plan ${idx + 1}`}</h4>
                  <span className="text-sm text-gray-700">${Number(plan.price || 0)}</span>
                </div>
                <div className="text-xs text-gray-600 mb-2">Seats: {plan.seats ?? '-'}</div>
                {plan.description && (
                  <div className="text-sm text-gray-700 mb-2">{plan.description}</div>
                )}
                {Array.isArray(plan.features) && plan.features.length > 0 && (
                  <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                    {plan.features.map((f: any, i: number) => (
                      <li key={i}>{typeof f === 'string' ? f : f?.value}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Modals */}
      <ConfirmationModal
        isOpen={approveModalOpen}
        onOpenChange={setApproveModalOpen}
        onConfirm={async () => {
          try {
            await approveMutation.mutateAsync(product._id);
            setApproveModalOpen(false);
            await refetch();
          } catch {}
        }}
        title="Approve Product"
        description="Are you sure you want to approve this product?"
        confirmText="Approve"
        confirmVariant="default"
        isLoading={approveMutation.isPending}
      />

      <ConfirmationModal
        isOpen={rejectModalOpen}
        onOpenChange={setRejectModalOpen}
        onConfirm={async () => {
          try {
            await rejectMutation.mutateAsync({ productId: product._id, reason: rejectReason.trim() || undefined });
            setRejectModalOpen(false);
            setRejectReason('');
            navigate('/products');
          } catch {}
        }}
        title="Reject Product"
        description="Are you sure you want to reject this product?"
        confirmText="Reject"
        confirmVariant="destructive"
        isLoading={rejectMutation.isPending}
        body={
          <div>
            <label>Reason (Optional)</label>
            <Textarea
              placeholder="Add a brief reason (optional)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full mt-2"
              maxLength={200}
            />
          </div>
        }
      />
    </div>
  );
};

export default ProductDetailPage;

