// Notes/entries on a UserBook: listForUserBook, create, update, delete
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";

type AddCustomDataInput = {
  title: string;
  content: string;
  isPrivate: boolean;
};

type UpdateCustomDataInput = {
  title?: string;
  content?: string;
  isPrivate?: boolean;
};

async function addCustomDataRequest(
  userBookId: string,
  input: AddCustomDataInput,
) {
  return apiClient.post(`/user-books/${userBookId}/custom-data`, input);
}

async function updateCustomDataRequest(
  userBookId: string,
  dataId: string,
  input: UpdateCustomDataInput,
) {
  return apiClient.patch(
    `/user-books/${userBookId}/custom-data/${dataId}`,
    input,
  );
}

async function deleteCustomDataRequest(userBookId: string, dataId: string) {
  return apiClient.delete<void>(
    `/user-books/${userBookId}/custom-data/${dataId}`,
  );
}

function useAddCustomData(userBookId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AddCustomDataInput) =>
      addCustomDataRequest(userBookId, input),
    onSuccess: () => {
      // user-book detail has customData embedded
      queryClient.invalidateQueries({ queryKey: ["user-book", userBookId] });
      // shelf list shows entry count per book
      queryClient.invalidateQueries({ queryKey: ["user-books"] });
      // public notes feed in a new entry
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });
}

function useUpdateCustomData(userBookId: string, dataId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateCustomDataInput) =>
      updateCustomDataRequest(userBookId, dataId, input),
    onSuccess: () => {
      // entry body changed in detail. count is unchanged so user-books stays
      queryClient.invalidateQueries({ queryKey: ["user-book", userBookId] });
    },
  });
}

function useDeleteCustomData(userBookId: string, dataId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteCustomDataRequest(userBookId, dataId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-book", userBookId] });
      // entry count on the shelf row drops
      queryClient.invalidateQueries({ queryKey: ["user-books"] });
      // Activity row for the public-note cascades on delete -> feed shifts
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });
}

export { useAddCustomData, useUpdateCustomData, useDeleteCustomData };
