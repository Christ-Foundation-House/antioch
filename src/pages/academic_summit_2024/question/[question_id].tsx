"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
// import {
//   getQuestion,
//   getNextQuestionId,
//   getPreviousQuestionId,
//   Question,
// } from "./actions";
import { academic_summit_questions } from "@prisma/client";
import { api } from "@/utils/api";
import { toast } from "react-toastify";
type Question = academic_summit_questions;

export default function FullScreenQuestion({
  initialId,
}: {
  initialId: number;
}) {
  //   const [question, setQuestion] = useState<Question | null>(null);
  const router = useRouter();
  const query = router;
  const { question_id } = router.query;

  const id: number | undefined = question_id ? Number(question_id) : undefined;
  const _question_action = api.prayer.academic_summit_question.useMutation();
  const _question = api.prayer.academic_summit_question_getOne.useQuery(
    { id: id ?? 0 },
    { enabled: id ? true : false },
  );
  const _questions = api.prayer.academic_summit_question_getAll.useQuery();
  const question = _question.data ?? undefined;

  useEffect(() => {
    fetchQuestion(initialId);
  }, [initialId]);

  async function fetchQuestion(id: number) {
    // const fetchedQuestion = await getQuestion(id);
    // setQuestion(fetchedQuestion);
  }

  async function handleNavigation(direction: "next" | "previous") {
    if (!question) return;
    if (!id) {
      toast.error("No Id");
      return;
    }
    const newId = await (direction === "next" ? id + 1 : id - 1);

    if (newId) {
      router.push(`/academic_summit_2024/question/${newId}`);
    }
  }

  if (!question) {
    return (
      <div className="flex items-center justify-center h-screen text-4xl">
        {_question.isFetched && !_question.data ? (
          <>
            No Question
            <br />
            <Button
              onClick={() => {
                router.back();
              }}
            >
              Return
            </Button>
          </>
        ) : (
          "Loading.."
        )}
      </div>
    );
  }

  return (
    <div
      className="flex flex-col h-screen p-8"
      style={{
        height: "90%",
        // width: "100%",
        // border: "1px solid red",
      }}
    >
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-primary">
          {id}/{_questions.data?.length}
          <br></br>
          Academic Summit 2024
        </h1>
      </header>
      <Card className="flex-grow flex flex-col">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">
            {question.full_name}&apos;s Question
          </CardTitle>
          <div className="text-xl text-muted-foreground">
            Topic: {question.topic || "Not specified"}
          </div>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col justify-center">
          <div className="text-4xl font-semibold mb-8">{question.question}</div>
          {question.answer && (
            <div className="mt-8">
              <h3 className="text-2xl font-semibold mb-4">Answer:</h3>
              <p className="text-3xl">{question.answer}</p>
            </div>
          )}
        </CardContent>
      </Card>
      <div className="flex justify-between mt-8">
        <Button
          size="lg"
          variant="secondary"
          onClick={() => {
            router.push("/academic_summit_2024/questions_");
          }}
          className="text-2xl py-8 px-12"
        >
          <ChevronLeft className="mr-2 h-8 w-8" /> Question List
        </Button>
        <Button
          size="lg"
          variant="secondary"
          onClick={() => handleNavigation("previous")}
          className="text-2xl py-8 px-12"
        >
          <ChevronLeft className="mr-2 h-8 w-8" /> Previous
        </Button>
        <Button
          size="lg"
          variant="secondary"
          onClick={() => handleNavigation("next")}
          className="text-2xl py-8 px-12"
        >
          Next <ChevronRight className="ml-2 h-8 w-8" />
        </Button>
      </div>
    </div>
  );
}
