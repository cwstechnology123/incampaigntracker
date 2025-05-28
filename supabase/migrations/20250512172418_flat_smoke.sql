/*
  # Create campaigns and posts tables

  1. New Tables
    - `campaigns`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `title` (text)
      - `description` (text)
      - `hashtag` (text)
      - `created_at` (timestamptz)
      - `last_run` (timestamptz)
      - `status` (text)

    - `posts`
      - `id` (uuid, primary key)
      - `campaign_id` (uuid, references campaigns)
      - `post_date` (timestamptz)
      - `author_name` (text)
      - `post_link` (text)
      - `likes` (integer)
      - `comments` (integer)
      - `shares` (integer)
      - `hashtags` (text[])
      - `content` (text)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data
*/

-- Create campaigns table
CREATE TABLE IF NOT EXISTS public.campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  hashtag text NOT NULL,
  created_at timestamptz DEFAULT now(),
  last_run timestamptz,
  status text DEFAULT 'idle' CHECK (status IN ('idle', 'running', 'completed', 'failed', 'no_posts_found')),
  
  CONSTRAINT campaigns_hashtag_check CHECK (length(hashtag) > 0)
);

-- Create posts table
CREATE TABLE IF NOT EXISTS public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  post_date timestamptz NOT NULL,
  author_name text NOT NULL,
  post_link text NOT NULL,
  likes integer DEFAULT 0,
  comments integer DEFAULT 0,
  shares integer DEFAULT 0,
  hashtags text[] NOT NULL,
  content text NOT NULL
);

-- Enable RLS
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Campaigns policies
CREATE POLICY "Users can create their own campaigns"
  ON public.campaigns
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own campaigns"
  ON public.campaigns
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own campaigns"
  ON public.campaigns
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own campaigns"
  ON public.campaigns
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Posts policies
CREATE POLICY "Users can create posts for their campaigns"
  ON public.posts
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.campaigns
    WHERE id = campaign_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can view posts from their campaigns"
  ON public.posts
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.campaigns
    WHERE id = campaign_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can update posts from their campaigns"
  ON public.posts
  FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.campaigns
    WHERE id = campaign_id AND user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.campaigns
    WHERE id = campaign_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can delete posts from their campaigns"
  ON public.posts
  FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.campaigns
    WHERE id = campaign_id AND user_id = auth.uid()
  ));