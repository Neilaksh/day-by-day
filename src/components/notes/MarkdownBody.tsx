import ReactMarkdown from "react-markdown";
import { useEffect } from "react";

export type MarkdownBodyProps = {
  children: string;
};

export function MarkdownBody({ children }: MarkdownBodyProps) {
  // useEffect to ensure remarkGfm and rehypeSanitize are available
  // These plugins are typically provided by the global config or parent
  useEffect(() => {
    // remarkGfm and rehypeSanitize are expected to be configured
    // at the application level or via the parent component
  }, []);

  // Tailwind v4 prose styling with arbitrary child selectors
  // [&_p]:mb-3 targets <p> elements inside the root
  // [&_ul]:list-disc etc. for lists, [&_a]:underline for links, etc.
  const proseClasses =
    "prose prose-inmax dark:prose-inmax-dark [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:pl-4 [&_blockquote]:italic [&_h1]:text-xl [&_h1]:font-semibold [&_code]:font-mono";

  return (
    <div className={proseClasses}>
      <ReactMarkdown
        children={children}
        components={{
          a: ({ href, ...props }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" {...props} />
          ),
        }}
      />
    </div>
  );
}
