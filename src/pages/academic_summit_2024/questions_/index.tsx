"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { api } from "@/utils/api";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
// import { getQuestions, markAsAddressed, toggleAnswered } from "./actions";

type Question = {
  id: number;
  full_name: string;
  topic: string | null;
  question: string;
  answer: string | null;
  created_at: Date;
  is_addressed: boolean;
};

export default function QuestionList() {
  const router = useRouter();
  const _questions = api.prayer.academic_summit_question_getAll.useQuery(
    undefined,
    { refetchInterval: 10000 },
  );
  const _action = api.prayer.academic_summit_question.useMutation();
  //   const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    fetchQuestions();
  }, []);

  async function fetchQuestions() {
    // const fetchedQuestions = await getQuestions();
    // setQuestions(fetchedQuestions);
  }

  async function handleMarkAsRead(id: number) {
    toast.promise(
      _action
        .mutateAsync({
          id,
          action: "mark_as_read",
        })
        .then(() => {
          toast.success("Successfully Marked");
          _questions.refetch();
        }),
      {
        pending: "Marking",
      },
    );
  }

  async function handleToggleAnswered(id: number, isAnswered: boolean) {
    // await toggleAnswered(id, isAnswered);
    // fetchQuestions();
  }

  return (
    <div className="container mx-auto p-4" style={{ height: "100%" }}>
      <h1 className="text-2xl font-bold mb-4">Academic Summit Questions</h1>
      <Button
        variant="secondary"
        style={{
          marginBottom: 10,
        }}
        onClick={() => {
          router.push(`/academic_summit_2024`);
        }}
      >
        Academic Summit Home
      </Button>
      <div className="space-y-4">
        {!_questions.data
          ? "Loading..."
          : _questions.data?.map((question) => (
              <div key={question.id} className="border p-4 rounded-lg shadow">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold">
                    Question {question.id}: {question.question}
                  </h2>
                  <span className="text-sm text-gray-500">
                    {new Date(question.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700 mb-2">
                  {question.topic ? `Topic: ${question.topic}` : undefined}
                </p>
                <p className="text-gray-700 mb-2">
                  From: {question.full_name || "No topic"}
                </p>
                <div className="flex justify-between items-center">
                  <Dialog>
                    {/* <DialogTrigger asChild> */}
                    <Button
                      variant="secondary"
                      onClick={() => {
                        router.push(
                          `/academic_summit_2024/question/${question.id}`,
                        );
                      }}
                    >
                      View Question
                    </Button>
                    {/* </DialogTrigger> */}
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {question.full_name}&apos;s Question
                        </DialogTitle>
                      </DialogHeader>
                      <p className="mt-2">{question.question}</p>
                      {question.answer && (
                        <div className="mt-4">
                          <h3 className="font-semibold">Answer:</h3>
                          <p>{question.answer}</p>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="secondary"
                    onClick={() => handleMarkAsRead(question.id)}
                    disabled={question.is_addressed}
                  >
                    {question.is_addressed ? "Read" : "Mark as Read"}
                  </Button>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`answered-${question.id}`}
                      checked={question.is_addressed ? true : false}
                    />
                    <label
                      htmlFor={`answered-${question.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {`Is Answered?`}
                    </label>
                  </div>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
}
