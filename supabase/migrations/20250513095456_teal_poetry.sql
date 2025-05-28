/*
  # Fix database schema and relationships

  1. Changes
    - Drop duplicate tables if they exist
    - Recreate tables with proper relationships
    - Add missing foreign key constraints
    - Re-enable RLS and policies
    - Add INSERT policy for profiles

  2. Security
    - Maintain existing RLS policies
    - Ensure proper cascade behavior
    - Allow users to create their own profile
*/

-- Drop existing tables if they exist (in correct order due to dependencies)
DROP TABLE IF EXISTS public.posts;
DROP TABLE IF EXISTS public.campaigns;
DROP TABLE IF EXISTS public.profiles;

-- Create profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  email text
);

-- Create campaigns table
CREATE TABLE public.campaigns (
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

-- Create posts table with explicit foreign key relationship
CREATE TABLE public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL,
  post_date timestamptz NOT NULL,
  author_name text NOT NULL,
  post_link text NOT NULL,
  likes integer DEFAULT 0,
  comments integer DEFAULT 0,
  shares integer DEFAULT 0,
  hashtags text[] NOT NULL,
  content text NOT NULL,
  
  CONSTRAINT posts_campaign_id_fkey FOREIGN KEY (campaign_id)
    REFERENCES public.campaigns(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can create their own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

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