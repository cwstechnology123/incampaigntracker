import React from 'react';
import { Post } from '../../types';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { format, parseISO } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface EngagementChartProps {
  posts: Post[];
}

export const EngagementChart: React.FC<EngagementChartProps> = ({ posts }) => {
  const sortedPosts = [...posts].sort((a, b) => 
    new Date(a.postDate).getTime() - new Date(b.postDate).getTime()
  );
  
  const labels = sortedPosts.map(post => format(parseISO(post.postDate), 'MMM d'));
  
  const data = {
    labels,
    datasets: [
      {
        label: 'Likes',
        data: sortedPosts.map(post => post.likes),
        backgroundColor: 'rgba(10, 102, 194, 0.7)',
        borderColor: 'rgba(10, 102, 194, 1)',
        borderWidth: 1,
      },
      {
        label: 'Comments',
        data: sortedPosts.map(post => post.comments),
        backgroundColor: 'rgba(0, 115, 177, 0.7)',
        borderColor: 'rgba(0, 115, 177, 1)',
        borderWidth: 1,
      },
      {
        label: 'Shares',
        data: sortedPosts.map(post => post.shares),
        backgroundColor: 'rgba(245, 127, 0, 0.7)',
        borderColor: 'rgba(245, 127, 0, 1)',
        borderWidth: 1,
      },
    ],
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          afterTitle: (tooltipItems: any) => {
            const index = tooltipItems[0].dataIndex;
            return sortedPosts[index].authorName;
          },
          footer: (tooltipItems: any) => {
            const index = tooltipItems[0].dataIndex;
            const post = sortedPosts[index];
            const total = post.likes + post.comments + post.shares;
            return `Total Engagement: ${total}`;
          },
        },
      },
    },
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
        beginAtZero: true,
      },
    },
  };
  
  return <Bar data={data} options={options} />;
};