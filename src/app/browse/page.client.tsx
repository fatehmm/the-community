"use client";

import { PaperCard } from "@/components/application/paper-card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { api } from "@/trpc/react";
import { Filter, Search } from "lucide-react";
import { useState } from "react";
import { Skeleton } from "../../components/ui/skeleton";

// const DynamicPdfViewer = dynamic(
//   () =>
//     import("@/components/application/pdf-viewer").then((mod) => mod.PdfViewer),
//   { loading: () => <Skeleton className="h-full w-full" /> },
// );

const departments = [
  "All",
  "computer-science",
  "mathematics",
  "physics",
  "chemistry",
  "biology",
  "engineering",
  "business",
  "economics",
  "psychology",
  "history",
  "english",
  "other",
];

const semesters = [
  "All",
  "fall-2024",
  "spring-2024",
  "summer-2024",
  "fall-2023",
  "spring-2023",
  "summer-2023",
];

const examTypes = ["All", "midterm", "final"];

export default function Component() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [selectedSemester, setSelectedSemester] = useState("All");
  const [selectedExamType, setSelectedExamType] = useState("All");

  const { data: papers, isLoading } = api.paper.search.useQuery({
    searchTerm: searchTerm || undefined,
    department: selectedDepartment !== "All" ? selectedDepartment : undefined,
    semester: selectedSemester !== "All" ? selectedSemester : undefined,
    paperType: selectedExamType !== "All" ? selectedExamType : undefined,
  });

  const filteredPapers = papers ?? [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-tobias text-3xl font-light text-gray-900">
                Past Papers Directory
              </h1>
            </div>
            <div className="text-sm text-gray-500">
              {isLoading
                ? "Loading..."
                : `${filteredPapers.length} papers available`}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Search and Filters */}
        <div className="mb-8 rounded-lg border bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <Input
                  placeholder="Search courses, titles, or professors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select
              value={selectedDepartment}
              onValueChange={setSelectedDepartment}
            >
              <SelectTrigger>
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept === "All"
                      ? "All Departments"
                      : dept
                          .replace("-", " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedSemester}
              onValueChange={setSelectedSemester}
            >
              <SelectTrigger>
                <SelectValue placeholder="Semester" />
              </SelectTrigger>
              <SelectContent>
                {semesters.map((semester) => (
                  <SelectItem key={semester} value={semester}>
                    {semester === "All"
                      ? "All Semesters"
                      : semester
                          .replace("-", " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedExamType}
              onValueChange={setSelectedExamType}
            >
              <SelectTrigger>
                <SelectValue placeholder="Exam Type" />
              </SelectTrigger>
              <SelectContent>
                {examTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type === "All"
                      ? "All Types"
                      : type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Papers Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPapers.map((paper) => (
              <PaperCard
                key={paper.id}
                paper={{
                  id: paper.id,
                  course: paper.courseCode,
                  title: paper.courseName,
                  url: paper.paperPdfUrl,
                  year: paper.semester.split("-")[1] ?? "2024",
                  semester: (() => {
                    const parts = paper.semester.split("-");
                    return parts[0]
                      ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1)
                      : "Fall";
                  })(),
                  examType:
                    paper.paperType.charAt(0).toUpperCase() +
                    paper.paperType.slice(1),
                  department: paper.department
                    .replace("-", " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase()),
                  professor: paper.professorName,
                  pages: 4, // Default value since we don't store this
                }}
              />
            ))}
          </div>
        )}

        {!isLoading && filteredPapers.length === 0 && (
          <div className="py-12 text-center">
            <div className="text-gray-500">
              <Filter className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <h3 className="mb-2 text-lg font-medium">No papers found</h3>
              <p>Try adjusting your search criteria or filters.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
