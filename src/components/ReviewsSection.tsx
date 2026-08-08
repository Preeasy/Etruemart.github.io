import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import {
  Star,
  Edit3,
  Trash2,
  Check,
  X,
  MessageCircle,
  ShieldAlert,
  Loader2,
} from 'lucide-react';

interface ReviewUser {
  id: string;
  name: string | null;
  avatar?: string | null;
}

interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  title: string;
  content: string;
  isApproved: boolean;
  isEdited: boolean;
  editedBy?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: ReviewUser;
}

interface ReviewsSectionProps {
  productId: string | number;
  fallbackRating: number;
  fallbackReviewCount: number;
}

export default function ReviewsSection({
  productId,
  fallbackRating,
  fallbackReviewCount,
}: ReviewsSectionProps) {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Write-review form state
  const [showForm, setShowForm] = useState(false);
  const [formRating, setFormRating] = useState(5);
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Admin edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editApproved, setEditApproved] = useState(true);
  const [savingEdit, setSavingEdit] = useState(false);

  const isAdmin = session?.user?.role === 'ADMIN';
  const isAuthenticated = sessionStatus === 'authenticated' && !!session?.user;

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/reviews/${productId}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setReviews(Array.isArray(data) ? data : []);
      } else {
        setError('Failed to load reviews');
      }
    } catch (e: any) { if (typeof console !== 'undefined') console.warn('[ReviewsSection] silent catch:', e);
      setError('Network error loading reviews');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!formTitle.trim() || !formContent.trim()) {
      setFormError('Title and content are required');
      return;
    }
    setSubmitting(true);
    setFormError('');
    try {
      const res = await fetch(`/api/reviews/${productId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: formRating,
          title: formTitle.trim(),
          content: formContent.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setShowForm(false);
        setFormTitle('');
        setFormContent('');
        setFormRating(5);
        await fetchReviews();
      } else {
        setFormError(data.error || 'Failed to submit review');
      }
    } catch (e: any) { if (typeof console !== 'undefined') console.warn('[ReviewsSection] silent catch:', e);
      setFormError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (review: Review) => {
    setEditingId(review.id);
    setEditRating(review.rating);
    setEditTitle(review.title);
    setEditContent(review.content);
    setEditApproved(review.isApproved);
    setFormError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (reviewId: string) => {
    if (!editTitle.trim() || !editContent.trim()) {
      setFormError('Title and content are required');
      return;
    }
    setSavingEdit(true);
    setFormError('');
    try {
      const res = await fetch(`/api/reviews/manage/${reviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: editRating,
          title: editTitle.trim(),
          content: editContent.trim(),
          isApproved: editApproved,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setEditingId(null);
        await fetchReviews();
      } else {
        setFormError(data.error || 'Failed to save changes');
      }
    } catch (e: any) { if (typeof console !== 'undefined') console.warn('[ReviewsSection] silent catch:', e);
      setFormError('Network error. Please try again.');
    } finally {
      setSavingEdit(false);
    }
  };

  const deleteReview = async (reviewId: string) => {
    if (!window.confirm('Delete this review? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/reviews/manage/${reviewId}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchReviews();
      } else {
        const data = await res.json().catch(() => ({}));
        window.alert(data.error || 'Failed to delete review');
      }
    } catch (e: any) { if (typeof console !== 'undefined') console.warn('[ReviewsSection] silent catch:', e);
      window.alert('Network error. Please try again.');
    }
  };

  // Aggregate stats from loaded reviews — NO fake fallbacks (SEO compliant)
  const totalCount = reviews.length;
  const hasRealReviews = totalCount > 0;
  const avgRating = hasRealReviews
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalCount
    : 0;
  const displayCount = totalCount;

  const distribution = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((r) => r.rating === stars).length;
    const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
    return { stars, count, pct };
  });

  return (
    <div>
      <h2 className="text-lg font-bold text-navy-900 mb-4">Customer Reviews</h2>

      {/* Summary */}
      <div className="grid md:grid-cols-3 gap-4 mb-6 pb-5 border-b border-ink-200">
        <div className="text-center md:border-r md:border-ink-200">
          <div className="text-4xl font-bold text-navy-800 mb-1">{avgRating.toFixed(1)}</div>
          <div className="flex gap-0.5 justify-center mb-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${
                  i < Math.floor(avgRating) ? 'text-accent-500 fill-accent-500' : 'text-ink-200'
                }`}
              />
            ))}
          </div>
          {hasRealReviews && (
            <p className="text-xs text-ink-500 font-medium">Based on {displayCount} reviews</p>
          )}
          {!hasRealReviews && (
            <p className="text-xs text-ink-400 font-medium italic">No customer reviews yet</p>
          )}
        </div>
        <div className="md:col-span-2 space-y-1.5">
          {distribution.map((row) => (
            <div key={row.stars} className="flex items-center gap-2">
              <div className="flex gap-0.5 w-14 flex-shrink-0">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < row.stars ? 'text-accent-500 fill-accent-500' : 'text-ink-200'
                    }`}
                  />
                ))}
              </div>
              <div className="flex-1 h-1.5 bg-ink-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent-500 rounded-full transition-all"
                  style={{ width: `${row.pct}%` }}
                />
              </div>
              <span className="text-xs text-ink-500 w-8 text-right font-semibold">{row.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Write a review button */}
      <div className="mb-5 flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm text-ink-600">
          {totalCount > 0
            ? `Showing ${totalCount} review${totalCount === 1 ? '' : 's'}`
            : 'Be the first to review this product'}
        </p>
        {!showForm && (
          <button
            onClick={() => {
              if (!isAuthenticated) {
                router.push('/login');
                return;
              }
              setShowForm(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-accent-600 hover:bg-accent-700 text-white text-xs font-bold rounded-lg transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            Write a Review
          </button>
        )}
      </div>

      {/* Write review form */}
      {showForm && (
        <div className="mb-5 p-4 bg-ink-50/50 border border-ink-200 rounded-xl">
          <h3 className="text-sm font-bold text-navy-800 mb-3">Write a Review</h3>
          {formError && (
            <div className="mb-3 px-3 py-2 rounded-lg text-xs font-medium bg-red-50 text-red-700 border border-red-200">
              {formError}
            </div>
          )}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-ink-600 mb-1.5">Your Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setFormRating(s)}
                    aria-label={`${s} stars`}
                    className="p-0.5"
                  >
                    <Star
                      className={`w-6 h-6 transition-colors ${
                        s <= formRating
                          ? 'text-accent-500 fill-accent-500'
                          : 'text-ink-200 hover:text-ink-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-600 mb-1.5">Title</label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                maxLength={120}
                placeholder="Summarize your experience"
                className="w-full px-3 py-2 text-sm border border-ink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-accent-400 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-600 mb-1.5">Review</label>
              <textarea
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                rows={4}
                maxLength={2000}
                placeholder="Share details about quality, shipping, value, etc."
                className="w-full px-3 py-2 text-sm border border-ink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-accent-400 bg-white resize-y"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-accent-600 hover:bg-accent-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Submitting...
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" /> Submit Review
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  setFormError('');
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-ink-200 hover:bg-ink-50 text-ink-700 text-xs font-bold rounded-lg transition-colors"
              >
                <X className="w-3.5 h-3.5" /> Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="py-8 text-center text-sm text-ink-500 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading reviews...
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="py-6 text-center text-sm text-ink-500">
          {error}{' '}
          <button onClick={fetchReviews} className="text-accent-600 font-semibold hover:underline">
            Retry
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && reviews.length === 0 && (
        <div className="py-10 text-center">
          <MessageCircle className="w-10 h-10 text-ink-300 mx-auto mb-2" />
          <p className="text-sm text-ink-500">No reviews yet</p>
          <p className="text-xs text-ink-400 mt-1">
            Purchased this product? Share your experience with other buyers.
          </p>
        </div>
      )}

      {/* Reviews list */}
      {!loading && !error && reviews.length > 0 && (
        <div className="space-y-4">
          {reviews.map((review) => {
            const isEditing = editingId === review.id;
            const userName = review.user?.name || 'Anonymous Buyer';
            const initials = (userName || 'U').charAt(0).toUpperCase();
            return (
              <div key={review.id} className="pb-4 border-b border-ink-100 last:border-0">
                {isEditing ? (
                  // Admin inline edit form
                  <div className="p-3 bg-accent-50/40 border border-accent-200/40 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-accent-700 inline-flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5" /> Admin Edit
                      </span>
                      <label className="inline-flex items-center gap-1.5 text-xs text-ink-600">
                        <input
                          type="checkbox"
                          checked={editApproved}
                          onChange={(e) => setEditApproved(e.target.checked)}
                          className="rounded border-ink-300"
                        />
                        Approved
                      </label>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setEditRating(s)}
                          aria-label={`${s} stars`}
                          className="p-0.5"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              s <= editRating
                                ? 'text-accent-500 fill-accent-500'
                                : 'text-ink-200'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      maxLength={120}
                      className="w-full px-3 py-2 text-sm border border-ink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400 bg-white"
                    />
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={3}
                      maxLength={2000}
                      className="w-full px-3 py-2 text-sm border border-ink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400 bg-white resize-y"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => saveEdit(review.id)}
                        disabled={savingEdit}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent-600 hover:bg-accent-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors"
                      >
                        {savingEdit ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-ink-200 hover:bg-ink-50 text-ink-700 text-xs font-bold rounded-lg transition-colors"
                      >
                        <X className="w-3.5 h-3.5" /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // Display review
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-navy-50 flex items-center justify-center text-navy-800 font-bold text-sm border border-ink-200">
                          {initials}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-navy-800 inline-flex items-center gap-1.5">
                            {userName}
                            {review.isEdited && (
                              <span className="text-[10px] font-medium text-ink-400 italic">
                                (edited)
                              </span>
                            )}
                            {!review.isApproved && (
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                                Pending
                              </span>
                            )}
                          </p>
                          <div className="flex items-center gap-2">
                            <div className="flex gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < review.rating
                                      ? 'text-accent-500 fill-accent-500'
                                      : 'text-ink-200'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-[10px] text-ink-500 font-medium">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      {isAdmin && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => startEdit(review)}
                            aria-label="Edit review"
                            className="w-7 h-7 rounded-md flex items-center justify-center text-ink-500 hover:text-accent-600 hover:bg-accent-50 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteReview(review.id)}
                            aria-label="Delete review"
                            className="w-7 h-7 rounded-md flex items-center justify-center text-ink-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                    <h4 className="text-sm font-semibold text-navy-800 mb-1">{review.title}</h4>
                    <p className="text-sm text-ink-600 leading-relaxed whitespace-pre-wrap">
                      {review.content}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Admin moderation hint */}
      {isAdmin && reviews.some((r) => !r.isApproved) && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 flex-shrink-0" />
          <span>
            Some reviews are pending approval. Toggle the &quot;Approved&quot; checkbox when editing
            to publish or hide them.
          </span>
        </div>
      )}
    </div>
  );
}
