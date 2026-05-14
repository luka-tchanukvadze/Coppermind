import { MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddToShelfButton } from "@/components/shelf/add-to-shelf-button";
import { NewDiscussionDialog } from "@/components/discussions/new-discussion-dialog";
import type { BookSearchResult } from "@/types/schema";

interface BookActionsProps {
  book: BookSearchResult;
}

export function BookActions({ book }: BookActionsProps) {
  return (
    <div className="mt-5 space-y-2.5">
      <AddToShelfButton book={book} />
      <NewDiscussionDialog
        trigger={
          <Button variant="outline" className="w-full">
            <MessageSquarePlus className="h-4 w-4" /> Start discussion
          </Button>
        }
      />
    </div>
  );
}
