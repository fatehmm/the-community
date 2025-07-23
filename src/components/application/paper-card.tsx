import { Download, ExternalLink, Eye } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { PdfViewer } from "./pdf-viewer";

export function PaperCard({
  paper,
}: {
  paper: {
    id: number;
    course: string;
    title: string;
    year: string;
    semester: string;
    examType: string;
    url: string;
    department: string;
    professor: string;
    pages: number;
  };
}) {
  const handleDownload = async () => {
    try {
      const response = await fetch(paper.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${paper.course}-${paper.semester}-${paper.year}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error("Download failed, try again.");
    }
  };

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="font-tobias text-xl font-semibold text-gray-900">
              {paper.course}
            </CardTitle>
            <p className="mt-1 text-sm text-gray-600">{paper.title}</p>
          </div>
          <Badge variant="secondary" className="ml-2">
            {paper.examType}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="mb-4 space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Professor:</span>
            <span className="font-medium">{paper.professor}</span>
          </div>
          <div className="flex justify-between">
            <span>Semester:</span>
            <span>
              {paper.semester} {paper.year}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Department:</span>
            <span>{paper.department}</span>
          </div>
          <div className="flex justify-between">
            <span>Pages:</span>
            <span>{paper.pages}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" className="flex-1">
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="box-content h-[70vh]">
              <AlertDialogHeader>
                <AlertDialogTitle className="font-tobias text-xl font-light">
                  Preview
                </AlertDialogTitle>
              </AlertDialogHeader>

              <PdfViewer url={paper.url} maxWidth={400} />

              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <Button variant="outline" asChild>
                  <a
                    href={paper.url}
                    target="_blank"
                    className="flex items-center gap-2"
                  >
                    Open in new tab <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
                <AlertDialogAction>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button
            size="sm"
            variant="outline"
            className="flex-1 bg-transparent"
            onClick={handleDownload}
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
