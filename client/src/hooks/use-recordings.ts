import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

// Helper to validate and parse responses
async function parseResponse<T>(schema: z.ZodType<T>, response: Response): Promise<T> {
  const data = await response.json();
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error("Schema validation failed:", result.error);
    throw new Error("Invalid API response");
  }
  return result.data;
}

export function useRecordings() {
  return useQuery({
    queryKey: [api.recordings.list.path],
    queryFn: async () => {
      const res = await fetch(api.recordings.list.path);
      if (!res.ok) throw new Error("Failed to fetch recordings");
      return parseResponse(api.recordings.list.responses[200], res);
    },
  });
}

export function useRecording(id: number) {
  return useQuery({
    queryKey: [api.recordings.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.recordings.get.path, { id });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch recording");
      return parseResponse(api.recordings.get.responses[200], res);
    },
    enabled: !!id,
  });
}

export function useUploadRecording() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ file, title, duration, quality, hasWebcam }: { 
      file: Blob; 
      title: string; 
      duration: number;
      quality?: string;
      hasWebcam?: boolean;
    }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);
      formData.append("duration", duration.toString());
      if (quality) formData.append("quality", quality);
      if (hasWebcam !== undefined) formData.append("hasWebcam", hasWebcam.toString());

      const res = await fetch(api.recordings.upload.path, {
        method: api.recordings.upload.method,
        body: formData,
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = await parseResponse(api.recordings.upload.responses[400], res);
          throw new Error(error.message);
        }
        throw new Error("Failed to upload recording");
      }

      return parseResponse(api.recordings.upload.responses[201], res);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.recordings.list.path] });
    },
  });
}

export function useDeleteRecording() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.recordings.delete.path, { id });
      const res = await fetch(url, {
        method: api.recordings.delete.method,
      });

      if (!res.ok) {
        if (res.status === 404) throw new Error("Recording not found");
        throw new Error("Failed to delete recording");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.recordings.list.path] });
    },
  });
}
