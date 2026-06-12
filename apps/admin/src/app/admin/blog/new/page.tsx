import { BlogPostForm } from '../../../../components/admin/blog/blog-post-form';

export default function NewBlogPostPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">New blog post</h1>
      <BlogPostForm />
    </div>
  );
}
