import React, { useState, useRef } from 'react';
import { db } from '../../services/db';
import { PostCategory, PostVisibility, Profile } from '../../types/database';
import {
  Megaphone,
  Globe,
  Users,
  Heart,
  MessageSquare,
  Pin,
  Trash2,
  Send,
  Upload,
  X,
  Search,
  UserPlus,
} from 'lucide-react';
import { ProfileViewModal } from './ProfileViewModal';

interface ResidenceForumProps {
  onOpenOwnProfileModal: () => void;
}

const POST_CATEGORIES: PostCategory[] = [
  'General',
  'Study & Academics',
  'Events & Social',
  'Marketplace',
  'Lost & Found',
  'Residence Notice',
  'Maintenance Advisory',
];

export const ResidenceForum: React.FC<ResidenceForumProps> = ({
  onOpenOwnProfileModal,
}) => {
  const currentUser = db.getCurrentUser();
  const isStaffOrManager =
    currentUser?.role === 'staff' || currentUser?.role === 'admin';

  const [feedFilter, setFeedFilter] = useState<
    'all' | 'announcements' | 'everyone' | 'friends'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Composer state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<PostCategory>(
    isStaffOrManager ? 'Residence Notice' : 'General'
  );
  const [visibility, setVisibility] = useState<PostVisibility>(
    isStaffOrManager ? 'announcement' : 'everyone'
  );
  const [isPinned, setIsPinned] = useState<boolean>(isStaffOrManager);
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [composeError, setComposeError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Comments & profile inspection
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  if (!currentUser) return null;

  const friendsCount = db.getFriends(currentUser.id).length;
  const rawPosts = db.getVisiblePosts(feedFilter);

  const visiblePosts = rawPosts.filter((post) => {
    if (categoryFilter !== 'all' && post.category !== categoryFilter) return false;
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      return (
        (post.title || '').toLowerCase().includes(q) ||
        post.content.toLowerCase().includes(q) ||
        (post.author_name || '').toLowerCase().includes(q) ||
        post.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setComposeError('Please choose a valid image file (JPG, PNG, WEBP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setComposeError('Image exceeds the 5 MB size limit.');
      return;
    }
    setComposeError(null);
    const reader = new FileReader();
    reader.onload = () => {
      setImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePublishPost = (e: React.FormEvent) => {
    e.preventDefault();
    setComposeError(null);

    if (!content.trim()) {
      setComposeError('Please write a message before publishing.');
      return;
    }

    try {
      db.createForumPost({
        title,
        content,
        category,
        visibility,
        is_pinned: visibility === 'announcement' ? isPinned : false,
        image_url: imageUrl,
      });
      setTitle('');
      setContent('');
      setImageUrl(undefined);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      setComposeError(err.message || 'Could not publish post.');
    }
  };

  const handleAddComment = (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    const draft = (commentDrafts[postId] || '').trim();
    if (!draft) return;
    db.addPostComment(postId, draft);
    setCommentDrafts((prev) => ({ ...prev, [postId]: '' }));
    setExpandedComments((prev) => ({ ...prev, [postId]: true }));
  };

  const formatRoleLabel = (role?: Profile['role']) =>
    role === 'admin'
      ? 'Residence Manager'
      : role === 'staff'
      ? 'Maintenance Staff'
      : 'Student';

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Residence Forum & Announcements
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isStaffOrManager
              ? 'Publish official residence notices, maintenance advisories, and community updates.'
              : 'Share updates with everyone or friends only, and stay updated with residence announcements.'}
          </p>
        </div>
        <span className="text-xs text-slate-500 tabular-nums">
          {friendsCount} mutual {friendsCount === 1 ? 'friend' : 'friends'}
        </span>
      </div>

      {/* Post / Announcement Composer */}
      <form
        onSubmit={handlePublishPost}
        className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-xs"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {visibility === 'announcement' ? 'Publish Official Announcement' : 'Create Forum Post'}
          </span>

          {/* Visibility Segmented Selector */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
            {isStaffOrManager && (
              <button
                type="button"
                onClick={() => {
                  setVisibility('announcement');
                  setCategory('Residence Notice');
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  visibility === 'announcement'
                    ? 'bg-sky-900 text-white shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Megaphone className="w-3.5 h-3.5" />
                <span>Announcement</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setVisibility('everyone')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                visibility === 'everyone'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Everyone</span>
            </button>
            <button
              type="button"
              onClick={() => setVisibility('friends')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                visibility === 'friends'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Friends Only</span>
            </button>
          </div>
        </div>

        {composeError && (
          <div className="p-2.5 text-xs text-red-800 bg-red-50 border border-red-200 rounded-md">
            {composeError}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={
              visibility === 'announcement'
                ? 'Announcement headline (e.g. Scheduled Water Shutoff Block B)...'
                : 'Optional post headline...'
            }
            className="sm:col-span-2 px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-sky-600"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as PostCategory)}
            className="px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-md bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-600"
          >
            {POST_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <textarea
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={
            visibility === 'announcement'
              ? 'Write the notice for all Corridor Hill residents...'
              : visibility === 'friends'
              ? `Share an update visible only to your ${friendsCount} mutual friends...`
              : 'Ask a question, organize a study group, or share an update with everyone...'
          }
          className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-sky-600"
        />

        {imageUrl && (
          <div className="relative inline-block border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
            <img
              src={imageUrl}
              alt="Post attachment preview"
              className="max-h-48 object-contain"
              referrerPolicy="no-referrer"
            />
            <button
              type="button"
              onClick={() => {
                setImageUrl(undefined);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="absolute top-2 right-2 p-1 bg-slate-900/75 text-white rounded-md hover:bg-slate-900"
              aria-label="Remove image"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md cursor-pointer transition-colors whitespace-nowrap">
              <Upload className="w-3.5 h-3.5" />
              <span>Attach Photo</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="sr-only"
              />
            </label>

            {isStaffOrManager && visibility === 'announcement' && (
              <label className="inline-flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="rounded border-slate-300 text-sky-900 focus:ring-sky-600"
                />
                <span>Pin to top of feed & student dashboard</span>
              </label>
            )}
          </div>

          <button
            type="submit"
            disabled={!content.trim()}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-sky-900 hover:bg-sky-800 rounded-md transition-colors disabled:opacity-50 whitespace-nowrap shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{visibility === 'announcement' ? 'Post Announcement' : 'Publish Post'}</span>
          </button>
        </div>
      </form>

      {/* Feed Filters */}
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg overflow-x-auto">
          {(
            [
              { key: 'all', label: 'All Feed' },
              { key: 'announcements', label: 'Announcements' },
              { key: 'everyone', label: 'Everyone' },
              { key: 'friends', label: 'Friends Only' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFeedFilter(tab.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                feedFilter === tab.key
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-600"
          >
            <option value="all">All Categories</option>
            {POST_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search forum..."
              className="w-full sm:w-48 pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-sky-600"
            />
          </div>
        </div>
      </div>

      {/* Posts Feed */}
      {visiblePosts.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center space-y-2">
          <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-sm font-semibold text-slate-800">No posts match this view</p>
          <p className="text-xs text-slate-500">
            {feedFilter === 'friends'
              ? 'Follow students back in the People directory to become Friends and share private updates.'
              : 'Be the first to start a conversation or share an update above.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {visiblePosts.map((post) => {
            const authorProfile = db.getProfileById(post.author_id);
            const isOwnPost = post.author_id === currentUser.id;
            const isFollowingAuthor = !isOwnPost && db.isFollowing(post.author_id);
            const isAnnouncement = post.visibility === 'announcement';
            const likesCount = db.getPostLikesCount(post.id);
            const liked = db.hasLikedPost(post.id);
            const postComments = db.getPostComments(post.id);
            const isCommentsOpen = !!expandedComments[post.id] || postComments.length > 0;

            return (
              <article
                key={post.id}
                className={`rounded-lg border p-5 space-y-3 transition-colors ${
                  isAnnouncement
                    ? 'bg-sky-50/40 border-sky-200'
                    : 'bg-white border-slate-200'
                }`}
              >
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={() => authorProfile && setSelectedProfile(authorProfile)}
                      className={`w-10 h-10 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${
                        isAnnouncement
                          ? 'bg-sky-900 text-white'
                          : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                      }`}
                      title="View author profile"
                    >
                      {(post.author_name || 'U').slice(0, 2).toUpperCase()}
                    </button>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => authorProfile && setSelectedProfile(authorProfile)}
                          className="text-sm font-bold text-slate-900 hover:text-sky-800 truncate"
                        >
                          {post.author_name || 'Residence Member'}
                        </button>
                        {!isOwnPost && !isFollowingAuthor && authorProfile && (
                          <button
                            type="button"
                            onClick={() => db.toggleFollow(post.author_id)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-800 hover:text-sky-950"
                          >
                            <UserPlus className="w-3 h-3" />
                            <span>Follow</span>
                          </button>
                        )}
                      </div>

                      {/* Clean Unboxed Zero-Pill Metadata Line */}
                      <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                        <span className={isAnnouncement ? 'font-semibold text-sky-900' : ''}>
                          {formatRoleLabel(post.author_role)}
                        </span>
                        {post.author_building && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>{post.author_building}</span>
                          </>
                        )}
                        <span aria-hidden="true">·</span>
                        <span>{post.category}</span>
                        <span aria-hidden="true">·</span>
                        <span
                          className={`font-medium ${
                            post.visibility === 'announcement'
                              ? 'text-sky-800'
                              : post.visibility === 'friends'
                              ? 'text-emerald-700'
                              : 'text-slate-600'
                          }`}
                        >
                          {post.visibility === 'announcement'
                            ? 'Official Announcement'
                            : post.visibility === 'friends'
                            ? 'Friends Only'
                            : 'Everyone'}
                        </span>
                        {post.is_pinned && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-semibold text-amber-700 inline-flex items-center gap-0.5">
                              <Pin className="w-3 h-3" />
                              Pinned
                            </span>
                          </>
                        )}
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">
                          {new Date(post.created_at).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Author / Staff Moderation Controls */}
                  <div className="flex items-center gap-1 shrink-0">
                    {isStaffOrManager && isAnnouncement && (
                      <button
                        type="button"
                        onClick={() => db.togglePinPost(post.id)}
                        className={`p-1.5 rounded-md transition-colors ${
                          post.is_pinned
                            ? 'text-amber-700 bg-amber-50 hover:bg-amber-100'
                            : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                        }`}
                        title={post.is_pinned ? 'Unpin announcement' : 'Pin announcement'}
                        aria-label={post.is_pinned ? 'Unpin announcement' : 'Pin announcement'}
                      >
                        <Pin className="w-4 h-4" />
                      </button>
                    )}

                    {(isOwnPost || isStaffOrManager) && (
                      <button
                        type="button"
                        onClick={() => db.deleteForumPost(post.id)}
                        className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                        title="Delete post"
                        aria-label="Delete post"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Title & Content */}
                <div className="space-y-1.5">
                  {post.title && (
                    <h2 className="text-base font-bold text-slate-900">{post.title}</h2>
                  )}
                  <p className="text-sm text-slate-800 whitespace-pre-line leading-relaxed">
                    {post.content}
                  </p>
                </div>

                {post.image_url && (
                  <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-100 max-h-80">
                    <img
                      src={post.image_url}
                      alt={post.title || 'Forum attachment'}
                      className="w-full max-h-80 object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                {/* Interactions Bar */}
                <div className="pt-2 border-t border-slate-200/80 flex items-center gap-4 text-xs">
                  <button
                    type="button"
                    onClick={() => db.togglePostLike(post.id)}
                    className={`inline-flex items-center gap-1.5 font-medium transition-colors tabular-nums ${
                      liked ? 'text-red-600 font-semibold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${liked ? 'fill-red-600 text-red-600' : ''}`} />
                    <span>{likesCount}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setExpandedComments((prev) => ({ ...prev, [post.id]: !isCommentsOpen }))
                    }
                    className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-medium tabular-nums"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>
                      {postComments.length} {postComments.length === 1 ? 'Reply' : 'Replies'}
                    </span>
                  </button>
                </div>

                {/* Comments Section */}
                {isCommentsOpen && (
                  <div className="pt-3 border-t border-slate-100 space-y-2.5">
                    {postComments.map((c) => {
                      const commentAuthor = db.getProfileById(c.author_id);
                      return (
                        <div
                          key={c.id}
                          className="p-2.5 rounded-md bg-slate-50 border border-slate-200/80 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => commentAuthor && setSelectedProfile(commentAuthor)}
                              className="font-semibold text-slate-900 hover:text-sky-800"
                            >
                              {c.author_name || 'Member'}
                              {c.author_role !== 'student' && (
                                <span className="text-sky-800 font-medium">
                                  {' '}
                                  · {formatRoleLabel(c.author_role)}
                                </span>
                              )}
                            </button>
                            <span className="text-[11px] text-slate-400 tabular-nums">
                              {new Date(c.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="text-slate-700 whitespace-pre-line">{c.content}</p>
                        </div>
                      );
                    })}

                    <form
                      onSubmit={(e) => handleAddComment(e, post.id)}
                      className="flex gap-2 pt-1"
                    >
                      <input
                        type="text"
                        value={commentDrafts[post.id] || ''}
                        onChange={(e) =>
                          setCommentDrafts((prev) => ({ ...prev, [post.id]: e.target.value }))
                        }
                        placeholder="Write a reply..."
                        className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-600"
                      />
                      <button
                        type="submit"
                        disabled={!(commentDrafts[post.id] || '').trim()}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-sky-900 hover:bg-sky-800 rounded-md disabled:opacity-50 whitespace-nowrap"
                      >
                        Reply
                      </button>
                    </form>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      <ProfileViewModal
        profile={selectedProfile}
        onClose={() => setSelectedProfile(null)}
        onEditOwnProfile={onOpenOwnProfileModal}
      />
    </div>
  );
};
