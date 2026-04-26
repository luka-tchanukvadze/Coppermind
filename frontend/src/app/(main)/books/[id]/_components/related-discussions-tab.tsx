import Link from "next/link";
import type { DiscussionWithCounts } from "@/types/schema";

export function RelatedDiscussionsTab({ discussions }: { discussions: DiscussionWithCounts[] }) {
  return (
    <ul className="divide-y">
      {discussions.map((d) => (
        <li key={d.id}>
          <Link
            href={`/discussions/${d.id}`}
            className="block py-4 transition-colors hover:bg-muted-bg/40"
          >
            <h3 className="font-serif text-lg font-medium text-accent">{d.title}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-muted">{d.description}</p>
            <div className="mt-2 text-xs text-muted">
              {d.commentCount} comments · {d.likeCount} likes
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
