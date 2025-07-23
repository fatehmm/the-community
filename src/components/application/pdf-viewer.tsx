"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import "react-pdf/dist/Page/TextLayer.css";

// Dynamically import react-pdf components with SSR disabled
const Document = dynamic(
  () => import("react-pdf").then((mod) => mod.Document),
  {
    ssr: false,
    loading: () => (
      <Skeleton className="h-[calc(100vh-theme(spacing.24))] w-full" />
    ),
  },
);

const Page = dynamic(() => import("react-pdf").then((mod) => mod.Page), {
  ssr: false,
});

interface PdfViewerProps {
  url: string;
  maxWidth?: number;
}

export function PdfViewer({ url, maxWidth }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number>();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Configure PDF.js worker only on client side
    void import("react-pdf").then((module) => {
      const pdfjs = module.pdfjs;
      if (pdfjs?.GlobalWorkerOptions) {
        pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@5.3.31/build/pdf.worker.min.mjs`;
      }
    });
  }, []);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  if (!isClient) {
    return <Skeleton className="h-[calc(100vh-theme(spacing.24))] w-full" />;
  }

  return (
    <div
      className={cn(
        "flex h-full max-w-2xl min-w-xs flex-col overflow-scroll border",
        numPages && "bg-white",
      )}
    >
      <div className="flex-1 overflow-y-auto">
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <Skeleton className="h-[calc(100vh-theme(spacing.24))] w-full" />
          }
        >
          {numPages &&
            Array.from(new Array(numPages), (_, index) => (
              <div
                key={`${url}_${index + 1}`}
                className="mb-4 flex justify-center"
              >
                <Page
                  width={maxWidth}
                  pageNumber={index + 1}
                  renderAnnotationLayer={false}
                  renderTextLayer={true}
                />
              </div>
            ))}
        </Document>
      </div>
    </div>
  );
}
