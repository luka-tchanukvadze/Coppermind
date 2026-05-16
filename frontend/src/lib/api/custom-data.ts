// Notes/entries on a UserBook: listForUserBook, create, update, delete
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";

type AddCustomDataInput = {
  title: string;
  content: string;
  isPrivate: boolean;
};

async function addCustomDataRequest(
  userBookId: string,
  input: AddCustomDataInput,
) {
  return apiClient.post(`/user-books/${userBookId}/custom-data`, input);
}

function useAddCustomData(userBookId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AddCustomDataInput) =>
      addCustomDataRequest(userBookId, input),
    onSuccess: () => {
      // user-book detail has customData embedded
      queryClient.invalidateQueries({ queryKey: ["user-book", userBookId] });
    },
  });
}

export { useAddCustomData };
