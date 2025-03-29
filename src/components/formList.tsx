"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { PlusCircle, Search, Edit, Trash2 } from "lucide-react";
import { api } from "@/utils/api";
import { form } from "@prisma/client";
import { toast } from "react-toastify";
import { useRouter } from "next/router";

type Form = form;

export function FormList() {
  const router = useRouter();

  const _create_from = api.forms.create_form.useMutation();
  const _get_forms = api.forms.get_forms.useQuery();
  const _delete_form = api.forms.delete_form.useMutation();
  const _edit_form = api.forms.edit_form.useMutation();

  // const [forms, setForms] = useState<Form[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newFormTitle, setNewFormTitle] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingForm, setEditingForm] = useState<Form | null>(null);

  const filteredForms = _get_forms?.data?.filter((form) =>
    form.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleCreateForm = () => {
    if (newFormTitle.trim()) {
      _create_from
        .mutateAsync({ title: newFormTitle })
        .then(() => {
          _get_forms.refetch();
          setNewFormTitle("");
          setIsModalOpen(false);
        })
        .catch((e) => {
          console.error(e);
          toast.error("Failed to create form");
        });
    }
  };

  const handleEditForm = () => {
    if (editingForm && editingForm.title.trim()) {
      _edit_form
        .mutateAsync({ id: editingForm.id, title: editingForm.title })
        .then(() => {
          _get_forms.refetch();
          setEditingForm(null);
          setIsModalOpen(false);
        })
        .catch((e) => {
          console.error(e);
          toast.error("Failed to edit form");
        });
    }
  };

  const handleDeleteForm = (id: string) => {
    _delete_form
      .mutateAsync({ id })
      .then(() => {
        _get_forms.refetch();
      })
      .catch((e) => {
        console.error(e);
        toast.error("Failed to delete form");
      });
  };

  return (
    <div
      className="container mx-auto p-4"
      style={{
        height: "100%",
      }}
    >
      <h1 className="text-2xl font-bold mb-4">Your Forms</h1>
      <div className="flex justify-between items-center mb-4">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search forms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Form
            </Button>
          </DialogTrigger>
          <DialogContent style={{ background: "black" }}>
            <DialogHeader>
              <DialogTitle>Create New Form</DialogTitle>
              <DialogDescription>
                Enter the title for your new form.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input
                  id="title"
                  value={newFormTitle}
                  onChange={(e) => setNewFormTitle(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleCreateForm}>
                Create Form
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created At
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody
            className="bg-white divide-y divide-gray-200"
            style={{ color: "black" }}
          >
            {_get_forms?.data?.map((form) => (
              <tr key={form.id}>
                <td className="px-6 py-4 whitespace-nowrap">{form.title}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {form.created_at.toDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Button
                    // variant="ghost"
                    size="sm"
                    onClick={() => {
                      router.push("/forms/" + form.id + "/edit");
                      return;
                    }}
                    className="mr-2"
                  >
                    View / Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingForm(form);
                    }}
                    className="mr-2"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteForm(form.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!editingForm} onOpenChange={() => setEditingForm(null)}>
        <DialogContent style={{ backgroundColor: "black" }}>
          <DialogHeader>
            <DialogTitle>Edit Form</DialogTitle>
            <DialogDescription>
              Update the title of your form.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-title" className="text-right">
                Title
              </Label>
              <Input
                id="edit-title"
                value={editingForm?.title || ""}
                onChange={(e) =>
                  setEditingForm((prev) =>
                    prev ? { ...prev, title: e.target.value } : null,
                  )
                }
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleEditForm}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
