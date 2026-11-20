import React from 'react';
import { db } from '../../services/db';
import { Profile } from '../../types/database';
import {
  X,
  UserPlus,
  UserCheck,
  Users,
  MapPin,
  BookOpen,
  MessageSquare,
  Heart,
  Pencil,
} from 'lucide-react';

interface ProfileViewModalProps {
  profile: Profile | null;
  onClose: () => void;
  onEditOwnProfile?: () => void;
}

export const ProfileViewModal: React.FC<ProfileViewModalProps> = ({
  profile,
  onClose,
  onEditOwnProfile,
}) => {
  if (!profile) return null;

  const currentUser = db.getCurrentUser();
  const isOwn = currentUser?.id === profile.id;
  const following = db.isFollowing(profile.id);
  const followedBy = db.isFollowedBy(profile.id);
  const isFriend = db.isMutualFriend(profile.id);

  const followersCount = db.getFollowers(profile.id).length;
  const followingCount = db.getFollowing(profile.id).length;
  const friendsCount = db.getFriends(profile.id).length;
  const visiblePosts = db.getVisiblePosts('all', profile.id);

  const handleToggleFollow = () => {
    try {
      db.toggleFollow(profile.id);
    } catch {
      // Handled gracefully
    }
  };

  const roleLabel =
    profile.role === 'admin'
      ? 'Residence Manager'
      : profile.role === 'staff'
      ? 'Maintenance Staff'
      : 'Student Resident';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col"
        role="dialog"
        aria-label={`${profile.full_name} profile`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Profile Header */}
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0">
            <div className="w-14 h-14 rounded-full bg-sky-900 text-white font-bold text-lg flex items-center justify-center shrink-0 overflow-hidden">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                profile.full_name.slice(0, 2).toUpperCase()
              )}
            </div>
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 truncate">
                  {profile.full_name}
                </h2>
                {isFriend && !isOwn && (
                  <span className="text-xs font-semibold text-emerald-700 inline-flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>Friends</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="font-medium text-slate-700">{roleLabel}</span>
                {profile.building && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {profile.building}
                      {profile.room_number ? `, ${profile.room_number}` : ''}
                    </span>
                  </>
                )}
                {profile.course && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-slate-400" />
                      {profile.course}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isOwn && onEditOwnProfile ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEditOwnProfile();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sky-900 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-md transition-colors whitespace-nowrap"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            ) : !isOwn ? (
              <button
                type="button"
                onClick={handleToggleFollow}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                  following
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
                    : 'bg-sky-900 hover:bg-sky-800 text-white'
                }`}
              >
                {following ? (
                  <>
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>{isFriend ? 'Friends' : 'Following'}</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>{followedBy ? 'Follow Back' : 'Follow'}</span>
                  </>
                )}
              </button>
            ) : null}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-200/60"
              aria-label="Close profile"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Stats Strip */}
          <div className="grid grid-cols-3 gap-4 py-3 px-4 bg-slate-50 border border-slate-200 rounded-lg text-center">
            <div>
              <span className="text-lg font-bold text-slate-900 tabular-nums block">
                {friendsCount}
              </span>
              <span className="text-xs text-slate-500">Mutual Friends</span>
            </div>
            <div>
              <span className="text-lg font-bold text-slate-900 tabular-nums block">
                {followersCount}
              </span>
              <span className="text-xs text-slate-500">Followers</span>
            </div>
            <div>
              <span className="text-lg font-bold text-slate-900 tabular-nums block">
                {followingCount}
              </span>
              <span className="text-xs text-slate-500">Following</span>
            </div>
          </div>

          {/* Bio & Interests */}
          {(profile.bio || (profile.interests && profile.interests.length > 0)) && (
            <div className="space-y-2.5">
              {profile.bio && (
                <p className="text-sm text-slate-700 leading-relaxed">{profile.bio}</p>
              )}
              {profile.interests && profile.interests.length > 0 && (
                <p className="text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">Interests: </span>
                  {profile.interests.join(' · ')}
                </p>
              )}
            </div>
          )}

          {/* Visible Forum Posts */}
          <div className="pt-3 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Recent Forum Posts ({visiblePosts.length})
              </h3>
              {!isOwn && !isFriend && (
                <span className="text-[11px] text-slate-400">
                  Follow each other to see Friends-only posts
                </span>
              )}
            </div>

            {visiblePosts.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center border border-slate-200 rounded-lg bg-slate-50/50">
                No visible posts from {profile.full_name} yet.
              </p>
            ) : (
              <div className="space-y-3">
                {visiblePosts.map((post) => {
                  const likesCount = db.getPostLikesCount(post.id);
                  const commentsCount = db.getPostComments(post.id).length;
                  return (
                    <div
                      key={post.id}
                      className="p-4 border border-slate-200 rounded-lg bg-white space-y-2"
                    >
                      <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-slate-700">{post.category}</span>
                        <span aria-hidden="true">·</span>
                        <span>
                          {post.visibility === 'announcement'
                            ? 'Announcement'
                            : post.visibility === 'friends'
                            ? 'Friends Only'
                            : 'Everyone'}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">
                          {new Date(post.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {post.title && (
                        <h4 className="text-sm font-bold text-slate-900">{post.title}</h4>
                      )}
                      <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-line">
                        {post.content}
                      </p>
                      <div className="flex items-center gap-4 pt-1 text-xs text-slate-500 tabular-nums">
                        <span className="inline-flex items-center gap-1">
                          <Heart className="w-3.5 h-3.5" />
                          {likesCount}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5" />
                          {commentsCount}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
