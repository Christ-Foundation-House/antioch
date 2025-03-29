"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2, QrCode } from "lucide-react";
import QRCode from "react-qr-code";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { api } from "@/utils/api";
import { link } from "@prisma/client";
import { toast } from "react-toastify";
// interface Link {
//   id: number;
//   url: string;
//   label: string;
//   image_url: string;
// }
type Link = link;

export function LinkManager() {
  const api_links_get = api.link.get.useQuery({ show_hidden: true });
  const api_links_create = api.link.create.useMutation();
  const api_links_edit = api.link.edit.useMutation();
  const api_links_show = api.link.show.useMutation();
  const api_links_hide = api.link.hide.useMutation();

  // const [links, setLinks] = useState<Link[]>(sampleLinks);
  const [formData, setFormData] = useState<
    Omit<Link, "id" | "updated_at" | "user_id" | "deleted_at">
  >({
    url: "",
    label: "",
    image_url: "",
    description: "",
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId !== null) {
        await api_links_edit.mutateAsync({ id: editingId, ...formData });
        setEditingId(null);
      } else {
        // setLinks([...links, { id: Date.now(), ...formData }]);
        await api_links_create.mutateAsync(formData);
      }
      setFormData({ url: "", label: "", image_url: "", description: "" });
      api_links_get.refetch();
    } catch (err) {
      if (err.message.includes("link_url_key")) {
        toast.error("Url already exists, please use unique one");
      } else if (err.message.includes("link_label_key")) {
        toast.error("Label already exists, please use unique one");
      } else {
        toast.error("Failed to Create / Edit Link");
        console.error(err);
      }
    }
  };
  const handleEdit = async (link: Link) => {
    setFormData(link);
    setEditingId(link.id);
    // const {id, url, label, image_url} = link
    // await api_links_edit.mutateAsync(link).then(() => {
    //   api_links_get.refetch();
    // });
  };

  const handleShow = async (id: number) => {
    await api_links_show.mutateAsync({ id }).then(() => {
      api_links_get.refetch();
    });
  };
  const handleHide = async (id: number) => {
    await api_links_hide.mutateAsync({ id }).then(() => {
      api_links_get.refetch();
    });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Link Manager</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>
            {editingId !== null ? "Edit Link" : "Add New Link"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                name="url"
                value={formData.url}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="label">Label</Label>
              <Input
                id="label"
                name="label"
                value={formData.label}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                name="description"
                value={formData.description ?? ""}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="image_url"
                name="image_url"
                value={formData.image_url ?? ""}
                onChange={handleInputChange}
              />
            </div>
            <div
              style={{
                width: "100%",
                display: "flex",
                gap: 10,
                // justifyContent: "space-between",
              }}
            >
              <Button
                disabled={
                  api_links_create.isPending || api_links_edit.isPending
                }
                type="submit"
              >
                {editingId !== null ? "Update" : "Add"} Link
              </Button>
              {editingId !== null && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingId(null);
                    setFormData({
                      url: "",
                      label: "",
                      image_url: "",
                      description: "",
                    });
                  }}
                >
                  Cancel Edit
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            Existing Links
            {` ${api_links_get.isFetching ? "(Loading...)" : ""}`}
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                api_links_get.refetch();
              }}
            >
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Label</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Description</TableHead>
                {/* <TableHead>Image</TableHead> */}
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {api_links_get?.data?.map((link) => (
                <TableRow key={link.id}>
                  <TableCell>{link.label}</TableCell>
                  <TableCell>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {link.url}
                    </a>
                  </TableCell>
                  <TableCell>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {link.description}
                    </a>
                  </TableCell>
                  {/* <TableCell>
                    <img
                      src={
                        link.image_url && link.image_url !== ""
                          ? link.image_url
                          : "https://maravianwebservices.com/images/wicf/assets/logo.png"
                      }
                      alt={link.label}
                      className="w-10 h-10 object-cover rounded"
                    />
                  </TableCell> */}
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(link)}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <QrCode className="h-4 w-4 mr-2" />
                            QR Code
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>QR Code for {link.label}</DialogTitle>
                          </DialogHeader>
                          <div className="flex items-center justify-center p-6">
                            <QRCode value={link.url} size={256} />
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          link.deleted_at
                            ? handleShow(link.id)
                            : handleHide(link.id);
                        }}
                      >
                        {link.deleted_at ? (
                          "(Hidden) Show"
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Hide
                          </>
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
