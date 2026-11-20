import React, { useState } from 'react';
import { db } from '../../services/db';
import { Profile } from '../../types/database';
import {
  Search,
  UserPlus,
  UserCheck,
  Users,
  MapPin,
  BookOpen,
  Pencil,
} from 'lucide-react';
import { ProfileViewModal } from './ProfileViewModal';

interface PeopleDirectoryProps {
  onOpenOwnProfileModal: () => void;
}

export const PeopleDirectory: React.FC<PeopleDirectoryProps> = ({
  onOpenOwnProfileModal,
}) => {
  const currentUser = db.getCurrentUser();
  const allProfiles = db.getAllProfiles();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<
    'all' | 'friends' | 'following' | 'followers' | 'staff'
  >('all');
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  if (!currentUser) return null;

  const friendsCount = db.getFriends(currentUser.id).length;
  const followingCount = db.getFollowing(currentUser.id).length;
  const followersCount = db.getFollowers(currentUser.id).length;

  const filteredProfiles = allProfiles
    .filter((p) => p.id !== currentUser.id)
    .filter((p) => {
      const q = searchQuery.trim().toLowerCase();
      if (q) {
        const matches =
          p.full_name.toLowerCase().includes(q) ||
          (p.building || '').toLowerCase().includes(q) ||
          (p.room_number || '').toLowerCase().includes(q) ||
          (p.course || '').toLowerCase().includes(q) ||
          (p.bio || '').toLowerCase().includes(q) ||
          (p.interests || []).some((i) => i.toLowerCase().includes(q));
        if (!matches) return false;
      }

      if (filterTab === 'friends') return db.isMutualFriend(p.id, currentUser.id);
      if (filterTab === 'following') return db.isFollowing(p.id, currentUser.id);
      if (filterTab === 'followers') return db.isFollowedBy(p.id, currentUser.id);
      if (filterTab === 'staff') return p.role === 'staff' || p.role === 'admin';
      return true;
    })
    .sort((a, b) => a.full_name.localeCompare(b.full_name));

  const roleLabel = (role: Profile['role']) =>
    role === 'admin' ? 'Residence Manager' : role === 'staff' ? 'Maintenance Staff' : 'Student';

  return (
    <div className="space-y-6">
      {/* Own Profile Summary Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-sky-900 text-white font-bold text-base flex items-center justify-center shrink-0">
            {currentUser.full_name.slice(0, 2).toUpperCase()}
          </div>
          <div className="space-y-1">
            <h1 className="text-lg font-bold text-slate-900">
              Residence Profiles & Friends
            </h1>
            <p className="text-xs text-slate-500 flex flex-wrap items-center gap-x-2 gap-y-1 tabular-nums">
              <span className="font-semibold text-slate-700">{currentUser.full_name}</span>
              <span aria-hidden="true">·</span>
              <span>{friendsCount} Mutual Friends</span>
              <span aria-hidden="true">·</span>
              <span>{followingCount} Following</span>
              <span aria-hidden="true">·</span>
              <span>{followersCount} Followers</span>
            </p>
            {currentUser.bio ? (
              <p className="text-xs text-slate-600 max-w-2xl">{currentUser.bio}</p>
            ) : (
              <p className="text-xs text-slate-400">
                Add your course, bio, and interests so floor mates can find and follow you.
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenOwnProfileModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-sky-900 hover:bg-sky-800 rounded-md transition-colors whitespace-nowrap shrink-0 self-start md:self-center"
        >
          <Pencil className="w-3.5 h-3.5" />
          <span>Edit My Profile</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg overflow-x-auto">
          {(
            [
              { key: 'all', label: 'All Residents' },
              { key: 'friends', label: `Friends (${friendsCount})` },
              { key: 'following', label: `Following (${followingCount})` },
              { key: 'followers', label: `Followers (${followersCount})` },
              { key: 'staff', label: 'Staff & Manager' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilterTab(tab.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 tabular-nums ${
                filterTab === tab.key
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, block, course..."
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm border border-slate-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-sky-600"
          />
        </div>
      </div>

      {/* Profiles Grid */}
      {filteredProfiles.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center space-y-2">
          <Users className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-sm font-semibold text-slate-800">No matching profiles found</p>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {filterTab === 'friends'
              ? 'Mutual follows become Friends. Follow fellow students in All Residents and have them follow you back.'
              : 'Try clearing your search or switching tabs.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProfiles.map((person) => {
            const following = db.isFollowing(person.id, currentUser.id);
            const followedBy = db.isFollowedBy(person.id, currentUser.id);
            const isFriend = db.isMutualFriend(person.id, currentUser.id);
            const followers = db.getFollowers(person.id).length;

            return (
              <div
                key={person.id}
                className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between gap-4 hover:border-slate-300 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedProfile(person)}
                      className="flex items-start gap-3 text-left min-w-0 group"
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center shrink-0">
                        {person.full_name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-sky-800 truncate">
                          {person.full_name}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {roleLabel(person.role)}
                          {isFriend && ' · Friend'}
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => db.toggleFollow(person.id)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                        following
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
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
                  </div>

                  <div className="space-y-1 text-xs text-slate-600">
                    {person.building && (
                      <p className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">
                          {person.building}
                          {person.room_number ? ` · ${person.room_number}` : ''}
                        </span>
                      </p>
                    )}
                    {person.course && (
                      <p className="flex items-center gap-1.5 truncate">
                        <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{person.course}</span>
                      </p>
                    )}
                  </div>

                  {person.bio && (
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {person.bio}
                    </p>
                  )}

                  {person.interests && person.interests.length > 0 && (
                    <p className="text-[11px] text-slate-400 truncate">
                      {person.interests.join(' · ')}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 tabular-nums">
                    {followers} {followers === 1 ? 'follower' : 'followers'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedProfile(person)}
                    className="text-sky-800 hover:text-sky-950 font-semibold whitespace-nowrap"
                  >
                    View Profile
                  </button>
                </div>
              </div>
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
