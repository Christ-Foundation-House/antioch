"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/utils/api";
import { useRouter } from "next/router";
import { form_field } from "@prisma/client";
import { toast } from "react-toastify";

type FieldType = "text" | "number" | "email" | "date" | "select";

interface FormField {
  id: string;
  label: string;
  type: FieldType;
  options?: string[]; // For select fields
}

interface Submission {
  id: string;
  createdAt: string;
  responses: Record<string, string>;
}

export function FormBuilder() {
  const router = useRouter();

  const form_id_ = router.query.form_id;
  const form_id = form_id_ ? String(form_id_) : "";
  const _get_one_form = api.forms.get_one_form.useQuery(
    {
      id: form_id,
    },
    {
      enabled: !!form_id,
    },
  );
  const _form_fields_actions = api.forms.form_fields_actions.useMutation();

  const [formTitle, setFormTitle] = useState("Untitled Form");
  const [fields, setFields] = useState<FormField[]>([]);
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldType, setNewFieldType] = useState<FieldType>("text");

  // Mock submissions data
  const [submissions, setSubmissions] = useState<Submission[]>([
    {
      id: "1",
      createdAt: "2023-05-01T12:00:00Z",
      responses: { Name: "John Doe", Email: "john@example.com" },
    },
    {
      id: "2",
      createdAt: "2023-05-02T14:30:00Z",
      responses: { Name: "Jane Smith", Email: "jane@example.com" },
    },
  ]);

  const addField = (args: {}) => {
    if (!form_id || !formTitle || !newFieldType) {
      toast.error("Missing values to create field");
    }
    _form_fields_actions.mutateAsync({
      form_id: form_id,
      action: "add",
    });

    return;
    if (newFieldLabel) {
      const newField: FormField = {
        id: Date.now().toString(),
        label: newFieldLabel,
        type: newFieldType,
        options: newFieldType === "select" ? ["Option 1"] : undefined,
      };
      setFields([...fields, newField]);
      setNewFieldLabel("");
      setNewFieldType("text");
    }
  };

  const updateField = (id: string, updates: Partial<form_field>) => {
    console.log("update field", { id, updates });
    // setFields(
    //   fields.map((field) =>
    //     field.id === id ? { ...field, ...updates } : field,
    //   ),
    // );
  };

  const deleteField = (id: string) => {
    setFields(fields.filter((field) => field.id !== id));
  };

  const addOption = (args: { fieldId: string }) => {
    console.log("addOptions", args);
    // setFields(
    //   fields.map((field) =>
    //     field.id === fieldId
    //       ? {
    //           ...field,
    //           options: [
    //             ...(field.options || []),
    //             `Option ${(field.options?.length || 0) + 1}`,
    //           ],
    //         }
    //       : field,
    //   ),
    // );
  };

  // Calculate some basic stats
  const totalSubmissions = submissions.length;
  const submissionDates = submissions.map((s) =>
    new Date(s.createdAt).toLocaleDateString(),
  );
  const latestSubmission = submissionDates[0];
  const uniqueSubmitters = new Set(submissions.map((s) => s.responses["Email"]))
    .size;

  return (
    <div
      className="container mx-auto p-4"
      style={{
        // border: "1px solid red",
        height: "100%",
      }}
    >
      <h1 className="text-2xl font-bold mb-4">Form Builder</h1>
      <Input
        disabled
        value={_get_one_form.data?.title}
        onChange={(e) => setFormTitle(e.target.value)}
        className="text-xl font-bold mb-4"
      />
      <Tabs defaultValue="editor">
        <TabsList>
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="entries">Entries & Stats</TabsTrigger>
        </TabsList>
        <TabsContent value="editor">
          <Card>
            <CardHeader>
              <CardTitle>Add New Field</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  value={newFieldLabel}
                  onChange={(e) => setNewFieldLabel(e.target.value)}
                  placeholder="Field Label"
                  className="flex-grow"
                />
                <Select
                  value={newFieldType}
                  onValueChange={(value: FieldType) => setNewFieldType(value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Field Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="select">Select</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={addField}>Add Field</Button>
              </div>
            </CardContent>
          </Card>
          <div className="mt-4 space-y-4">
            {_get_one_form?.data?.fields.map((field) => (
              <Card key={field.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <Input
                      value={field.label}
                      onChange={(e) =>
                        updateField(field.id, { label: e.target.value })
                      }
                      className="flex-grow"
                    />
                    <Select
                      value={field.type}
                      // onValueChange={(value: FieldType) =>
                      //   updateField(field.id, { type: value })
                      // }
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="select">Select</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="destructive"
                      onClick={() => deleteField(field.id)}
                    >
                      Delete
                    </Button>
                  </div>
                  {field.type === "SELECT" && (
                    <div className="mt-2">
                      <Label>Options:</Label>
                      {field.options?.map((option, index) => (
                        <Input
                          key={index}
                          value={option.value}
                          // onChange={(e) =>
                          //   updateField(field.id, {
                          //     options: field.options?.map((opt, i) =>
                          //       i === index ? e.target.value : opt,
                          //     ),
                          //   })
                          // }
                          className="mt-1"
                        />
                      ))}
                      <Button
                        onClick={() => addOption({ fieldId: field.id })}
                        className="mt-2"
                      >
                        Add Option
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>{formTitle}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label>{field.label}</Label>
                  {field.type === "select" ? (
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options?.map((option, index) => (
                          <SelectItem key={index} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      type={field.type}
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                    />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="entries">
          <Card>
            <CardHeader>
              <CardTitle>Entries & Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Total Submissions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{totalSubmissions}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Latest Submission</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{latestSubmission}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Unique Submitters</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{uniqueSubmitters}</p>
                  </CardContent>
                </Card>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Submission Date</TableHead>
                    {fields.map((field) => (
                      <TableHead key={field.id}>{field.label}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell>
                        {new Date(submission.createdAt).toLocaleDateString()}
                      </TableCell>
                      {fields.map((field) => (
                        <TableCell key={field.id}>
                          {submission.responses[field.label] || "-"}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
