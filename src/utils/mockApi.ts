import { Post } from '../types';
import { format, subDays } from 'date-fns';

interface MockPost {
  post_date: string;
  authorName: string;
  postLink: string;
  likes: number;
  comments: number;
  shares: number;
  hashtags: string[];
  content: string;
}

// Generate mock LinkedIn posts for testing
export const scrapeLinkedInPosts = async (hashtag: string): Promise<MockPost[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Generate 5-15 random posts with the hashtag
  const postCount = Math.floor(Math.random() * 10) + 5;
  const posts: MockPost[] = [];
  
  const authors = [
    'Elon Musk',
    'Sarah Johnson',
    'Mark Thompson',
    'Priya Patel',
    'Carlos Rodriguez',
    'Jennifer Wu',
    'Michael Davis',
    'Ana Silva',
    'Alex Morgan',
    'Emma Chen',
  ];
  
  const contents = [
    'Just launched an exciting new feature! The team has been working hard on this for months. #innovation',
    'Sharing insights from our latest market research. The results are fascinating! Check out the full report.',
    'Proud to announce we\'ve hit a major milestone. Thanks to our amazing customers and dedicated team.',
    'Great panel discussion today at #TechConf2025. So many brilliant minds sharing their vision for the future.',
    'Looking for talented developers to join our growing team. DM me if interested! #hiring #tech',
    'Just published a new article on AI trends in 2025. Would love your thoughts and feedback.',
    'Celebrating our team\'s success! We\'ve been recognized as a leader in our industry.',
    'Excited to share our latest case study. See how we helped clients achieve 300% ROI.',
    'Join me next week for a live webinar on digital transformation strategies.',
    'Big news coming soon! Stay tuned for our major announcement next week. 🚀',
  ];
  
  // Normalize the hashtag (remove # if present)
  const normalizedHashtag = hashtag.startsWith('#') ? hashtag.substring(1) : hashtag;
  
  for (let i = 0; i < postCount; i++) {
    const daysAgo = Math.floor(Math.random() * 30); // Random post date within last 30 days
    const post_date = format(subDays(new Date(), daysAgo), "yyyy-MM-dd'T'HH:mm:ss");
    
    const authorIndex = Math.floor(Math.random() * authors.length);
    const contentIndex = Math.floor(Math.random() * contents.length);
    
    // Random engagement counts with higher ranges for more realistic data
    const likes = Math.floor(Math.random() * 1000) + 50; // 50-1050 likes
    const comments = Math.floor(Math.random() * 200) + 10; // 10-210 comments
    const shares = Math.floor(Math.random() * 100) + 5;   // 5-105 shares
    
    // Generate additional random hashtags
    const additionalHashtags = [
      'marketing',
      'business',
      'leadership',
      'innovation',
      'technology',
      'career',
      'networking',
      'success',
      'startup',
      'growth',
    ];
    
    // Select 2-4 random additional hashtags
    const hashtagCount = Math.floor(Math.random() * 3) + 2;
    const selectedHashtags = new Set<string>([normalizedHashtag]);
    
    while (selectedHashtags.size < hashtagCount + 1) {
      const randomIndex = Math.floor(Math.random() * additionalHashtags.length);
      selectedHashtags.add(additionalHashtags[randomIndex]);
    }
    
    // Add the post with the specified hashtag
    const hashtagsArray = Array.from(selectedHashtags);
    const content = `${contents[contentIndex]} ${hashtagsArray.map(h => `#${h}`).join(' ')}`;
    
    posts.push({
      post_date,
      authorName: authors[authorIndex],
      postLink: `https://linkedin.com/post/${crypto.randomUUID().substring(0, 8)}`,
      likes,
      comments,
      shares,
      hashtags: hashtagsArray,
      content,
    });
  }
  
  // Sort by date (newest first)
  return posts.sort((a, b) => new Date(b.post_date).getTime() - new Date(a.post_date).getTime());
};

// Helper function to export posts as CSV
export const exportToCSV = (posts: Post[], campaignTitle: string) => {
  // Define CSV headers
  const headers = [
    'Post Date',
    'Author',
    'Post Link',
    'Likes',
    'Comments',
    'Shares',
    'Total Engagement',
    'Content',
    'Hashtags'
  ].join(',');
  
  // Format each post as a CSV row
  const rows = posts.map(post => {
    const totalEngagement = post.likes + post.comments + post.shares;
    const formattedDate = new Date(post.post_date).toLocaleDateString();
    
    // Escape content to prevent CSV issues with commas and quotes
    const escapedContent = post.content.replace(/"/g, '""');
    
    return [
      formattedDate,
      post.author_name,
      post.post_link,
      post.likes,
      post.comments,
      post.shares,
      totalEngagement,
      `"${escapedContent}"`,
      `"${post.hashtags.join(', ')}"`,
    ].join(',');
  });
  
  // Combine headers and rows
  const csv = [headers, ...rows].join('\n');
  
  // Create a download link
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  // Set filename with campaign title and date
  const date = new Date().toISOString().split('T')[0];
  const filename = `${campaignTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_report_${date}.csv`;
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};