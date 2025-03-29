"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUp, ArrowDown } from "lucide-react";
import { api } from "@/utils/api";
import { toast } from "react-toastify";
import {
  ArgsEmailTemplateIssueResolved,
  emailTemplateIssueResolved,
} from "@/lib/email/emailTemplates";

export function ReportManagement() {
  const api_reports_get = api.report.get.useQuery();
  const api_reports_mark_as_addressed =
    api.report.mark_as_addressed.useMutation();
  const api_reports_acknowledge_fixed =
    api.report.acknowledge_fixed.useMutation();
  const api_email_send = api.email.sendEmail.useMutation();
  const [selectedReportIndex, setSelectedReportIndex] = useState<number>();
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailContent, setEmailContent] =
    useState<ArgsEmailTemplateIssueResolved>({
      email: "",
      name: "",
      title: "",
      subject: "",
      body: "",
    });

  // Filtering and Sorting state
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("open");
  const [sortField, setSortField] = useState("created_at");
  const [sortDirection, setSortDirection] = useState("desc");

  const handleUpdateReport = async (id, data) => {
    await updateReport(id, data);
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    console.log(emailContent);
    toast.promise(
      api_email_send
        .mutateAsync({
          text: emailTemplateIssueResolved({
            ...emailContent,
          }),
          to: emailContent.email,
          subject: emailContent.subject,
        })
        .then(() => {
          toast.success("Email sent successfully");
        })
        .catch((e) => {
          toast.error(e.message ?? "Failed to send email");
          console.error(e);
        }),
      { pending: "Sending email..." },
    );
    setEmailDialogOpen(false);
  };

  const openEmailDialog = (reportIndex: number) => {
    if (!filteredAndSortedReports) {
      toast.error(`No reports`);
      return;
    }
    const report = filteredAndSortedReports[reportIndex];
    if (!report) {
      toast.error(`No report found at index ${reportIndex}`);
      return;
    }
    setSelectedReportIndex(reportIndex);

    const testLink = `https://wicf.maravian.com/`;
    const resolvedLink = `https://wicf.maravian.com/report/mark_done/${report.email}/${report.id}`;
    setEmailContent({
      title: report.title ?? "",
      subject: `Follow-up on your report: ${report.title}`,
      email: report.email,
      body: `We've addressed the issue you reported regarding "${report.title}". Could you please verify if the problem has been resolved?

To test if the issue you reported was fixed.

If the issue is resolved, please click the button below,
If you're still experiencing problems or have any questions, please do report.
Thank you for your patience and cooperation.`,
      name: report.name ?? "Member",
      testLink,
      resolvedLink,
    });
    setEmailDialogOpen(true);
  };

  // Filtering and Sorting logic
  const filteredAndSortedReports = useMemo(() => {
    return api_reports_get.data?.reports
      .filter((report) => {
        if (filterType !== "all" && report.type !== filterType) return false;
        if (filterStatus === "open" && report.is_closed_by_user) return false;
        if (filterStatus === "closed" && !report.is_closed_by_user)
          return false;
        if (filterStatus === "addressed" && !report.is_addressed) return false;
        return true;
      })
      .sort((a, b) => {
        if (a[sortField] < b[sortField])
          return sortDirection === "asc" ? -1 : 1;
        if (a[sortField] > b[sortField])
          return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
  }, [
    api_reports_get.data,
    filterType,
    filterStatus,
    sortField,
    sortDirection,
  ]);

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const updateReport = async (id, data) => {
    console.log("Updating report:", id, data);
    // Implement actual update logic here
    const report = api_reports_get.data?.reports?.find((r) => r.id === id);
    if (!report) {
      toast.error("Report not found");
      return;
    }
    console.log({ report });

    if (
      data?.is_addressed !== undefined &&
      report?.is_addressed !== data.is_addressed
    ) {
      console.log("is_addressed");
      toast.promise(
        api_reports_mark_as_addressed
          .mutateAsync({
            reportId: report.id,
            value: data.is_addressed ? true : false,
          })
          .then(() => {
            api_reports_get.refetch();
            toast.success("Report marked as updated!");
          })
          .catch((e) => {
            toast.error(e.message ?? "Failed to mark report as addressed");
          }),
        {
          pending: "Marking as addressed...",
        },
      );
      return;
    }

    if (
      data?.is_closed_by_user !== undefined &&
      report?.is_closed_by_user !== data.is_closed_by_user
    ) {
      console.log("is_closed_by_user");
      toast.promise(
        api_reports_acknowledge_fixed
          .mutateAsync({
            reportId: report.id,
            value: data.is_closed_by_user ? true : false,
            email: report.email,
            marked_on_system: true,
          })
          .then(() => {
            api_reports_get.refetch();
            toast.success("Report acknowledgement is updated!");
          })
          .catch((e) => {
            toast.error(e.message ?? "Failed to acknowledge report");
          }),
        {
          pending: "Acknowleging fixed...",
        },
      );
    }
  };
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Report Management</h1>

      {/* Analytics Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {api_reports_get.data?.stats.totalReports}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Open Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {api_reports_get.data?.stats.unaddressedReports}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Addressed Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {api_reports_get.data?.stats.addressedReports}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Reports Closed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {api_reports_get.data?.stats.closedReports}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Reports by Type</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={api_reports_get.data?.stats.uniqueTypes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create New Report Form */}
      {/* <form onSubmit={handleCreateReport} className="mb-8 space-y-4">
        <h2 className="text-xl font-semibold">Create New Report</h2>
        <Input
          placeholder="Title"
          value={newReport?.title}
          onChange={(e) =>
            setNewReport({ ...newReport, title: e.target.value })
          }
        />
        <Input
          placeholder="Name"
          value={newReport.name}
          onChange={(e) => setNewReport({ ...newReport, name: e.target.value })}
        />
        <Input
          placeholder="Email"
          type="email"
          value={newReport.email}
          onChange={(e) =>
            setNewReport({ ...newReport, email: e.target.value })
          }
        />
        <Input
          placeholder="Type"
          value={newReport.type}
          onChange={(e) => setNewReport({ ...newReport, type: e.target.value })}
        />
        <Input
          placeholder="URL"
          value={newReport.url}
          onChange={(e) => setNewReport({ ...newReport, url: e.target.value })}
        />
        <Textarea
          placeholder="Description"
          value={newReport.description}
          onChange={(e) =>
            setNewReport({ ...newReport, description: e.target.value })
          }
        />
        <Button type="submit">Create Report</Button>
      </form> */}

      {/* Filtering and Sorting Controls */}
      <div className="mb-4 flex flex-wrap gap-4">
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Type" />
          </SelectTrigger>

          <SelectContent style={{ backgroundColor: "black" }}>
            <SelectItem value="all">All Types</SelectItem>
            {api_reports_get.data?.stats.uniqueTypes.map((type) => (
              <SelectItem value={type.name}>
                {type.name.toUpperCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent style={{ backgroundColor: "black" }}>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="addressed">Addressed</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reports Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("id")}
            >
              ID{" "}
              {sortField === "id" &&
                (sortDirection === "asc" ? (
                  <ArrowUp className="inline" />
                ) : (
                  <ArrowDown className="inline" />
                ))}
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("title")}
            >
              Title{" "}
              {sortField === "title" &&
                (sortDirection === "asc" ? (
                  <ArrowUp className="inline" />
                ) : (
                  <ArrowDown className="inline" />
                ))}
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("title")}
            >
              Email{" "}
              {sortField === "title" &&
                (sortDirection === "asc" ? (
                  <ArrowUp className="inline" />
                ) : (
                  <ArrowDown className="inline" />
                ))}
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("type")}
            >
              Type{" "}
              {sortField === "type" &&
                (sortDirection === "asc" ? (
                  <ArrowUp className="inline" />
                ) : (
                  <ArrowDown className="inline" />
                ))}
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("is_closed_by_user")}
            >
              Status{" "}
              {sortField === "is_closed_by_user" &&
                (sortDirection === "asc" ? (
                  <ArrowUp className="inline" />
                ) : (
                  <ArrowDown className="inline" />
                ))}
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("created_at")}
            >
              Created At{" "}
              {sortField === "created_at" &&
                (sortDirection === "asc" ? (
                  <ArrowUp className="inline" />
                ) : (
                  <ArrowDown className="inline" />
                ))}
            </TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAndSortedReports?.map((report, index) => (
            <TableRow key={report.id}>
              <TableCell>{report.id}</TableCell>
              <TableCell>{report.title}</TableCell>
              <TableCell>{report.email}</TableCell>
              <TableCell>{report.type}</TableCell>
              <TableCell>
                {report.is_closed_by_user
                  ? "Closed"
                  : report.is_addressed
                    ? "Addressed"
                    : "Open"}
              </TableCell>
              <TableCell>{report?.created_at?.toLocaleDateString()}</TableCell>
              <TableCell>
                <Button
                  onClick={() => setSelectedReportIndex(index)}
                  className="mr-2"
                >
                  View
                </Button>
                <Button
                  onClick={() => openEmailDialog(index)}
                  // disabled={report.is_closed_by_user}
                >
                  Send Email
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Report Details Dialog */}
      {selectedReportIndex !== undefined &&
        filteredAndSortedReports &&
        filteredAndSortedReports[selectedReportIndex] && (
          <Dialog
            open={!!filteredAndSortedReports[selectedReportIndex]}
            onOpenChange={(open) => {
              // alert("Select Report");
              setSelectedReportIndex(undefined);
            }}
          >
            <DialogContent
              style={{
                backgroundColor: "black",
              }}
            >
              <DialogHeader>
                <DialogTitle>
                  {filteredAndSortedReports[selectedReportIndex]?.title}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p>
                  <strong>Id:</strong>{" "}
                  {filteredAndSortedReports[selectedReportIndex]?.id}
                </p>
                <p>
                  <strong>Description:</strong>{" "}
                  {filteredAndSortedReports[selectedReportIndex]?.description}
                </p>
                <p>
                  <strong>Email:</strong>{" "}
                  {filteredAndSortedReports[selectedReportIndex].email}
                </p>
                <p>
                  <strong>Name:</strong>{" "}
                  {filteredAndSortedReports[selectedReportIndex].name}
                </p>
                <p>
                  <strong>Type:</strong>{" "}
                  {filteredAndSortedReports[selectedReportIndex].type}
                </p>
                <p>
                  <strong>URL:</strong>{" "}
                  {filteredAndSortedReports[selectedReportIndex].url}
                </p>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_addressed"
                    disabled={api_reports_mark_as_addressed.isPending}
                    checked={
                      filteredAndSortedReports[selectedReportIndex]
                        ?.is_addressed
                        ? true
                        : false
                    }
                    onCheckedChange={(checked) =>
                      handleUpdateReport(
                        filteredAndSortedReports[selectedReportIndex]?.id,
                        {
                          is_addressed: checked ? new Date() : null,
                        },
                      )
                    }
                  />
                  <Label htmlFor="is_addressed">Mark as Addressed</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_closed_by_user"
                    disabled={api_reports_mark_as_addressed.isPending}
                    checked={
                      filteredAndSortedReports[selectedReportIndex]
                        ?.is_closed_by_user
                        ? true
                        : false
                    }
                    onCheckedChange={(checked) =>
                      handleUpdateReport(
                        filteredAndSortedReports[selectedReportIndex].id,
                        {
                          is_closed_by_user: checked ? new Date() : null,
                        },
                      )
                    }
                  />
                  <Label htmlFor="is_closed_by_user">Acknowledge (Close)</Label>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

      <Dialog
        open={emailDialogOpen}
        onOpenChange={() => setEmailDialogOpen(false)}
      >
        <DialogContent
          className="max-w-3xl"
          style={{ backgroundColor: "black" }}
        >
          <DialogHeader>
            <DialogTitle>Send Email to User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSendEmail} className="space-y-4">
            <div>
              <Label htmlFor="email-subject">Email</Label>
              <Input
                id="email"
                disabled
                value={emailContent.email}
                onChange={(e) =>
                  setEmailContent({ ...emailContent, email: e.target.value })
                }
              />
            </div>
            {/* <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                disabled
                value={emailContent.name}
                onChange={(e) =>
                  setEmailContent({ ...emailContent, name: e.target.value })
                }
              />
            </div> */}
            <div>
              <Label htmlFor="email-subject">Subject</Label>
              <Input
                id="email-subject"
                value={emailContent.subject}
                onChange={(e) =>
                  setEmailContent({ ...emailContent, subject: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="email-body">Email Body</Label>
              <Textarea
                id="email-body"
                value={emailContent.body}
                onChange={(e) =>
                  setEmailContent({ ...emailContent, body: e.target.value })
                }
                rows={7}
              />
            </div>
            <div>
              <Label htmlFor="name">Test Link</Label>
              <Input
                id="testLink"
                value={emailContent.testLink}
                onChange={(e) =>
                  setEmailContent({ ...emailContent, testLink: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="name">Resolved Link</Label>
              <Input
                id="resolvedLink"
                value={emailContent.resolvedLink}
                onChange={(e) =>
                  setEmailContent({
                    ...emailContent,
                    resolvedLink: e.target.value,
                  })
                }
              />
            </div>
            <Button type="submit">Send Email</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
