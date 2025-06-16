import React, { useState } from 'react';
import { Post } from '../../types';
import { useBootstrapDataStore } from '../../states/stores/useBootstrapDataStore';
import { format, parseISO } from 'date-fns';
import { Heart, MessageSquare, Share2, ExternalLink, ChevronDown, ChevronUp, ArrowUpDown } from 'lucide-react';

type SortField = 'date' | 'likes' | 'comments' | 'shares' | 'engagement';
type SortDirection = 'asc' | 'desc';

export const PostList: React.FC = () => {
  const { posts = [], isLoading } = useBootstrapDataStore() ?? {};
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const togglePost = (postId: string) => {
    const newExpanded = new Set(expandedPosts);
    if (expandedPosts.has(postId)) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
    }
    setExpandedPosts(newExpanded);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedPosts = [...posts].sort((a: Post, b: Post) => {
    const getValue = (post: Post): number => {
      switch (sortField) {
        case 'date':
          return new Date(post.post_date).getTime();
        case 'likes':
          return post.likes || 0;
        case 'comments':
          return post.comments || 0;
        case 'shares':
          return post.shares || 0;
        case 'engagement':
          return (post.likes || 0) + (post.comments || 0) + (post.shares || 0);
      }
    };
    const aVal = getValue(a);
    const bVal = getValue(b);
    return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
  });

  const SortButton: React.FC<{ field: SortField; label: string }> = ({ field, label }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center space-x-1 text-xs font-medium uppercase tracking-wider text-neutral-600"
    >
      <span>{label}</span>
      <ArrowUpDown className="h-3 w-3" />
    </button>
  );

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, idx) => (
            <div key={idx} className="h-10 bg-neutral-200 rounded" />
          ))}
        </div>
      </div>
    );
  }
  if (posts.length === 0) {
    return (
      <div className="p-4 text-center text-neutral-500">
        No posts available. Start tracking your LinkedIn engagement!
      </div>
    );
  }
  if (!posts || posts.length === 0) {
    return (
      <div className="p-4 text-center text-neutral-500">
        No posts available. Start tracking your LinkedIn engagement!
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full divide-y divide-neutral-200">
        <thead>
          <tr className="bg-neutral-50">
            <th className="px-4 py-3 text-left">
              <SortButton field="date" label="Date" />
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-600">
              Author
            </th>
            <th className="px-4 py-3 text-left">
              <SortButton field="likes" label="Likes" />
            </th>
            <th className="px-4 py-3 text-left">
              <SortButton field="comments" label="Comments" />
            </th>
            <th className="px-4 py-3 text-left">
              <SortButton field="shares" label="Shares" />
            </th>
            <th className="px-4 py-3 text-left">
              <SortButton field="engagement" label="Total Engagement" />
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-600">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200 bg-white">
          {sortedPosts.map(post => {
            const totalEngagement = post.likes + post.comments + post.shares;
            const isExpanded = expandedPosts.has(post.id);
            const authorName = String(post.author_name || '');
            const authorInitial = authorName.charAt(0);
            
            return (
              <React.Fragment key={post.id}>
                <tr className="hover:bg-neutral-50">
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-neutral-900">
                    {post.post_date ? format(parseISO(post.post_date), 'MMM d, yyyy') : 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-900">
                    <div className="flex items-center">
                      <div className="h-8 w-8 flex-shrink-0 rounded-full bg-neutral-200 text-center flex items-center justify-center text-neutral-500 font-semibold">
                        {authorInitial}
                      </div>
                      <div className="ml-3">
                        <div className="font-medium">{authorName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center text-primary-600">
                      <Heart className="mr-1 h-4 w-4" />
                      {post.likes}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center text-secondary-600">
                      <MessageSquare className="mr-1 h-4 w-4" />
                      {post.comments}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center text-accent-600">
                      <Share2 className="mr-1 h-4 w-4" />
                      {post.shares}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-neutral-900">
                    {totalEngagement}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => window.open(post.post_link, '_blank', 'noopener,noreferrer')}
                        className="flex items-center text-primary-600 hover:text-primary-700"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span className="ml-1">View</span>
                      </button>
                      <button
                        onClick={() => togglePost(post.id)}
                        className="flex items-center text-neutral-600 hover:text-neutral-900"
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                        <span className="ml-1">
                          {isExpanded ? 'Less' : 'More'}
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
                {isExpanded && (
                  <tr className="bg-neutral-50">
                    <td colSpan={7} className="px-4 py-4">
                      <div className="space-y-3">
                        <div className="text-neutral-700">
                          {post.content}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {post.hashtags.map((tag: string) => (
                            <span
                              key={tag}
                              className="inline-flex rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-800"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};