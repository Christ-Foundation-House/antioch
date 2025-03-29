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
import { Statistic } from "antd";
import { TypeSession } from "@/shared/shared_types";
import { permissionReturnRedirectionOrProps } from "@/utils/permission";
import { getSession } from "next-auth/react";
// import { getQuestions, markAsAddressed, toggleAnswered } from "./actions";

export default function QuestionList() {
  const [showAnswered, setShowAnswered] = useState(false);
  const router = useRouter();
  const { topic_name } = router.query;
  const _questions = api.qa.getQuestions.useQuery(
    { topicName: topic_name as string },
    { refetchInterval: 10000 },
  );
  const _action = api.qa.markAsRead.useMutation();
  //   const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    fetchQuestions();
  }, []);

  async function fetchQuestions() {
    // const fetchedQuestions = await getQuestions();
    // setQuestions(fetchedQuestions);
  }

  async function handleMarkAsRead(id: number, isAnswered: boolean) {
    toast.promise(
      _action
        .mutateAsync({
          id,
          is_addressed: isAnswered,
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

  return (
    <div className="container mx-auto p-4" style={{ height: "100%" }}>
      <h1 className="text-2xl font-bold mb-4">{`Questions & Answers - ${_questions?.data?.[0]?.qa_topic?.Label ?? String(topic_name).toLocaleUpperCase()}`}</h1>
      <div className="flex justify-between items-center mb-4 flex-wrap">
        <Button
          variant="secondary"
          style={{
            marginBottom: 10,
          }}
          onClick={() => {
            router.push(`/qa`);
          }}
        >
          Questions & Answers Home
        </Button>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">{`Questions: ${_questions.data?.length ?? ""}`}</span>
          <span className="text-sm text-gray-500">{`Unanswered: ${_questions.data?.filter((question) => !question.is_addressed).length ?? ""}`}</span>
        </div>
        <div className="flex items-center space-x-2 p-2 rounded-md bg-black-500">
          <Checkbox
            id="answered"
            checked={showAnswered}
            onCheckedChange={() => setShowAnswered(!showAnswered)}
          />
          <label htmlFor="answered">{`Include Answered Questions?`}</label>
        </div>
      </div>
      <div className="space-y-4">
        {!_questions.data
          ? "Loading..."
          : _questions.data
              ?.filter(
                (question) => (showAnswered ? true : !question.is_addressed), // show all if showAnswered is true
              )
              .map((question, index) => {
                const questionIndex = _questions.data?.findIndex(
                  (q) => q.id === question.id,
                );
                return (
                  <div
                    key={question.id}
                    className="border p-4 rounded-lg shadow"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h2 className="text-lg font-semibold">
                        Question {questionIndex + 1}: {question.question}
                      </h2>
                      <span className="text-sm text-gray-500">
                        {new Date(question.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-2">
                      {question.subject
                        ? `Subject: ${question.subject}`
                        : undefined}
                    </p>
                    <p className="text-gray-700 mb-2">
                      From: {question.full_name || "No topic"}
                    </p>
                    <div className="flex justify-between items-center flex-wrap">
                      <Dialog>
                        {/* <DialogTrigger asChild> */}
                        <Button
                          variant="secondary"
                          onClick={() => {
                            router.push(
                              `/qa/${topic_name}/question/${questionIndex}`,
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
                          {question.qa_answers.length > 0 && (
                            <div className="mt-4">
                              <h3 className="font-semibold">Answer:</h3>
                              <p>{question.qa_answers[0].answer}</p>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="secondary"
                        onClick={() =>
                          handleMarkAsRead(question.id, !question.is_addressed)
                        }
                        disabled={question.is_addressed}
                      >
                        {question.is_addressed ? "Read" : "Mark as Read"}
                      </Button>
                      <div className="flex items-center space-x-2 p-2 rounded-md bg-black-500">
                        <Checkbox
                          id={`answered-${question.id}`}
                          checked={question.is_addressed ? true : false}
                          onClick={() =>
                            handleMarkAsRead(
                              question.id,
                              !question.is_addressed,
                            )
                          }
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
                );
              })}
      </div>
    </div>
  );
}

export async function getServerSideProps(context) {
  return permissionReturnRedirectionOrProps({
    session: (await getSession(context.res)) as TypeSession | null,
    routeUrl: context.resolvedUrl,
  });
}
