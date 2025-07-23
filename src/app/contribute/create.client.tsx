"use client";

import { Button } from "@/components/ui/button";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadItemProgress,
  FileUploadList,
  type FileUploadProps,
  FileUploadTrigger,
} from "@/components/ui/file-upload";
import { uploadFiles } from "@/lib/uploadthing";
import { Upload, X } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { UploadThingError } from "uploadthing/server";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  courseName: z.string().min(2, {
    message: "Course name must be at least 2 characters.",
  }),
  paperPdfUrl: z.string().min(1, {
    message: "Paper PDF is required.",
  }),
  professorName: z.string().min(2, {
    message: "Professor name must be at least 2 characters.",
  }),
  semester: z.string().min(1, {
    message: "Please select a semester.",
  }),
  department: z.string().min(1, {
    message: "Please select a department.",
  }),
  paperType: z.string().min(1, {
    message: "Please select a paper type.",
  }),
  courseCode: z.string().min(1, {
    message: "Course code is required.",
  }),
});

export default function CreatePaper() {
  const router = useRouter();
  const createPaperMutation = api.paper.create.useMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      courseName: "",
      professorName: "",
      semester: "",
      department: "",
      paperType: "",
      courseCode: "",
    },
  });

  const [isUploading, setIsUploading] = React.useState(false);
  const [files, setFiles] = React.useState<File[]>([]);
  const [, setUploadedUrl] = React.useState<string>("");

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Call the tRPC mutation
    createPaperMutation.mutate(
      {
        courseName: values.courseName,
        courseCode: values.courseCode,
        professorName: values.professorName,
        semester: values.semester,
        department: values.department,
        paperType: values.paperType as "midterm" | "final",
        paperPdfUrl: values.paperPdfUrl,
      },
      {
        onSuccess: () => {
          toast.success("Paper created successfully!");
          router.push("/browse");
        },
        onError: (error) => {
          toast.error(
            `Failed to create paper: ${error.message ?? "Unknown error"}`,
          );
        },
      },
    );
  };

  const onUpload: NonNullable<FileUploadProps["onUpload"]> = React.useCallback(
    async (files, { onProgress }) => {
      try {
        setIsUploading(true);
        const res = await uploadFiles("pdfUploader", {
          files,
          onUploadProgress: ({ file, progress }) => {
            onProgress(file, progress);
          },
        });

        // Set the uploaded URL for the first file
        if (res.length > 0 && res[0]?.url) {
          setUploadedUrl(res[0].url);
          form.setValue("paperPdfUrl", res[0].url);
        }

        toast.success("Uploaded files:", {
          description: (
            <pre className="bg-accent/30 text-accent-foreground mt-2 w-80 rounded-md p-4">
              <code>
                {JSON.stringify(
                  res.map((file) =>
                    file.name.length > 25
                      ? `${file.name.slice(0, 25)}...`
                      : file.name,
                  ),
                  null,
                  2,
                )}
              </code>
            </pre>
          ),
        });
      } catch (error) {
        setIsUploading(false);

        if (error instanceof UploadThingError) {
          const errorMessage =
            (error?.data as { error: string })?.error ?? "Upload failed";
          toast.error(errorMessage);
          return;
        }

        toast.error(
          error instanceof Error ? error.message : "An unknown error occurred",
        );
      } finally {
        setIsUploading(false);
      }
    },
    [form],
  );

  const onFileReject = React.useCallback((file: File, message: string) => {
    toast(message, {
      description: `"${file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name}" has been rejected`,
    });
  }, []);

  const isLoading = isUploading || createPaperMutation.isPending || false;

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 p-5">
          <FormField
            control={form.control}
            name="courseName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Course Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Introduction to Computer Science"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Enter the full name of the course.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="courseCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Course Code</FormLabel>
                <FormControl>
                  <Input placeholder="CS101" {...field} />
                </FormControl>
                <FormDescription>
                  Enter the course code (e.g., CS101, MATH201).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="professorName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Professor Name</FormLabel>
                <FormControl>
                  <Input placeholder="Dr. John Smith" {...field} />
                </FormControl>
                <FormDescription>
                  Enter the professor&apos;s full name.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="semester"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Semester</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a semester" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="fall-2024">Fall 2024</SelectItem>
                    <SelectItem value="spring-2024">Spring 2024</SelectItem>
                    <SelectItem value="summer-2024">Summer 2024</SelectItem>
                    <SelectItem value="fall-2023">Fall 2023</SelectItem>
                    <SelectItem value="spring-2023">Spring 2023</SelectItem>
                    <SelectItem value="summer-2023">Summer 2023</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Select the semester when this paper was given.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Department</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a department" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="computer-science">
                      Computer Science
                    </SelectItem>
                    <SelectItem value="mathematics">Mathematics</SelectItem>
                    <SelectItem value="physics">Physics</SelectItem>
                    <SelectItem value="chemistry">Chemistry</SelectItem>
                    <SelectItem value="biology">Biology</SelectItem>
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="economics">Economics</SelectItem>
                    <SelectItem value="psychology">Psychology</SelectItem>
                    <SelectItem value="history">History</SelectItem>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Select the department that offers this course.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="paperType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Paper Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select paper type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="midterm">Midterm</SelectItem>
                    <SelectItem value="final">Final</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Select whether this is a midterm or final exam.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="paperPdfUrl"
            render={() => (
              <FormItem>
                <FormLabel>Paper PDF</FormLabel>
                <FormControl>
                  <FileUpload
                    accept="application/pdf"
                    maxFiles={1}
                    maxSize={4 * 1024 * 1024}
                    className="w-full max-w-md"
                    onAccept={(files) => setFiles(files)}
                    onUpload={onUpload}
                    onFileReject={onFileReject}
                    disabled={isUploading}
                  >
                    <FileUploadDropzone>
                      <div className="flex flex-col items-center gap-1 text-center">
                        <div className="flex items-center justify-center rounded-full border p-2.5">
                          <Upload className="text-muted-foreground size-6" />
                        </div>
                        <p className="text-sm font-medium">
                          Drag & drop PDF here
                        </p>
                        <p className="text-muted-foreground text-xs">
                          Or click to browse (max 1 file, up to 4MB)
                        </p>
                      </div>
                      <FileUploadTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 w-fit"
                        >
                          Browse files
                        </Button>
                      </FileUploadTrigger>
                    </FileUploadDropzone>
                    <FileUploadList>
                      {files.map((file, index) => (
                        <FileUploadItem key={index} value={file}>
                          <div className="flex w-full items-center gap-2">
                            <FileUploadItemPreview />
                            <FileUploadItemMetadata />
                            <FileUploadItemDelete asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-7"
                              >
                                <X />
                              </Button>
                            </FileUploadItemDelete>
                          </div>
                          <FileUploadItemProgress />
                        </FileUploadItem>
                      ))}
                    </FileUploadList>
                  </FileUpload>
                </FormControl>
                <FormDescription>
                  Upload the PDF file of the past paper.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Creating Paper..." : "Create Paper"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
