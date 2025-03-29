/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { api } from "@/utils/api";
import { toast } from "react-toastify";
// import { reportPostParams } from "@/server/api/routers/report";

export const reportPostParams = z.object({
  type: z.enum(["bug", "general", "appeal"]),
  title: z.string().min(1, "Title is required").optional(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  name: z.string().min(1, "Name is required").optional(),
  email: z.string().email("Invalid email address"),
  url: z.string().optional(),
  user_id: z.string().optional(),
});
const formSchema = reportPostParams;

type FormData = z.infer<typeof formSchema>;
export type TypeReportForm = FormData;

export function ReportPage() {
  const router = useRouter();
  const session = useSession();
  const { query } = router;
  const type_ = (query.type as string) || undefined;
  const [type, setType] = useState<string>(type_ ?? "general");
  const api_report_create = api.report.create.useMutation();
  const [isUrlEditable, setIsUrlEditable] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string>();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "general",
      url: isUrlEditable ? "" : `${process.env.NEXTAUTH_URL}/dashboard`,
    },
  });

  // const type = watch("type");

  const onSubmit = (data: FormData) => {
    setError(undefined);
    // console.log(data);
    // api_report_create.mutateAsync({ ...data }).then(()=>{
    //   toast.success("Thank you for your report");
    // })
    toast
      .promise(api_report_create.mutateAsync({ ...data }), {
        pending: "Submitting",
      })
      .then(() => {
        setIsSubmitted(true);
        toast.success("Thank you for your report");
      })
      .catch((e) => {
        toast.error("There was an error submitting your report");
        // console.log(e);
        setError(e.message);
      });
  };
  useEffect(() => {
    const query: any = router.query;
    if (query) {
      console.log(query);
      if (query.url) setValue("url", query.url);
      if (query.email) setValue("email", query.email);
      if (query.name) setValue("name", query.name);
      if (query.title) setValue("title", query.title);
      if (query.type) setType(query.type);
    }
  }, [router.query]);

  useEffect(() => {
    if (session) {
      session.data?.user?.wicf_member?.first_name &&
        setValue("name", `${session.data?.user?.wicf_member?.first_name}`);
      session.data?.user?.email && setValue("email", session.data?.user?.email);
      session.data?.user?.wicf_member?.email &&
        setValue("email", session.data?.user?.wicf_member?.email);
      session.data?.user?.id && setValue("user_id", session.data?.user?.id);
    }
  }, [session]);

  return (
    <div
      className="container mx-auto p-6 max-w-2xl"
      css={css({
        ["p"]: {
          color: "red !important",
        },
      })}
    >
      <h1 className="text-3xl font-bold mb-6">Submit a Report</h1>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label>Report Type</Label>
          <RadioGroup value={type} className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="general"
                id="general"
                {...register("type")}
                onClick={() => {
                  setType("general");
                }}
              />
              <Label htmlFor="general">General Report</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="bug"
                id="bug"
                {...register("type")}
                onClick={() => {
                  setType("bug");
                }}
              />
              <Label htmlFor="bug">Bug Report</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="appeal"
                id="appeal"
                {...register("type")}
                onClick={() => {
                  setType("appeal");
                }}
              />
              <Label htmlFor="appeal">Appeal</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="feature"
                id="feature"
                {...register("type")}
                onClick={() => {
                  setType("feature");
                }}
              />
              <Label htmlFor="feature">Feature Request</Label>
            </div>
          </RadioGroup>
        </div>
        {session.data?.user ? (
          <div className="space-y-2" style={{ display: "none" }}>
            <Label htmlFor="name">User Id</Label>
            <Input id="name" {...register("user_id")} />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.user_id?.message}</p>
            )}
          </div>
        ) : null}
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            {...register("title")}
            defaultValue={"Problem on the system"}
          />
          {errors.title && (
            <p className="text-red-500 text-sm">{errors.title.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="url">URL</Label>
          <div className="flex space-x-2">
            <Input
              id="url"
              type="text"
              {...register("url")}
              // defaultValue={query.url ?? undefined}
              disabled={!isUrlEditable}
              className={!isUrlEditable ? "bg-gray-100" : ""}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsUrlEditable(!isUrlEditable)}
            >
              {isUrlEditable ? "Save" : "Edit"}
            </Button>
          </div>
          {errors.url && (
            <p className="text-red-500 text-sm">{errors.url.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Your Name</Label>
          <Input id="name" {...register("name")} />
          {errors.name && (
            <p className="text-red-500 text-sm">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">{`Your Email (How to contact you back)`}</Label>
          <Input id="email" type="email" {...register("email")} />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            {...register("description")}
            placeholder="Explain the problem you are facing"
          />
          {errors.description && (
            <p className="text-red-500 text-sm">{errors.description.message}</p>
          )}
        </div>
        <Button
          type="submit"
          className="w-full"
          disabled={api_report_create.isPending}
        >
          {api_report_create.isPending ? `Submitting` : `Submit Report`}
        </Button>
      </form>

      <Dialog open={isSubmitted} onOpenChange={setIsSubmitted}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thank You!</DialogTitle>
            <DialogDescription>
              We have received your report and will get back to you soon.
            </DialogDescription>
          </DialogHeader>
          <Button
            onClick={() => {
              setIsSubmitted(false);
            }}
          >
            Submit another report
          </Button>
          <Button
            onClick={() => {
              router.push("/");
            }}
          >
            Go to home page
          </Button>
          {router.query.url ? (
            <Button
              onClick={() => {
                router.push(String(router.query.url));
              }}
            >
              Return to last page
            </Button>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
