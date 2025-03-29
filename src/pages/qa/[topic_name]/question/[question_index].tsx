"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "@/utils/api";

export default function FullScreenQuestion() {
  const router = useRouter();
  const query = router.query;
  const { question_index, topic_name, question_id } = query;

  const _questions = api.qa.getQuestions.useQuery(
    { topicName: topic_name as string },
    { refetchInterval: 10000 },
  );

  const [currentIndex, setCurrentIndex] = useState(Number(question_index));
  const question = _questions.data?.[currentIndex];

  useEffect(() => {
    const questions = _questions.data;
    if (question_index && questions) {
      setCurrentIndex(Number(question_index));
    }
  }, [question_index, _questions.data]);

  useEffect(() => {
    const questions = _questions.data;
    if (question_id && questions) {
      setCurrentIndex(
        questions.findIndex((question) => question.id === Number(question_id)),
      );
    }
  }, [question_id, _questions.data]);

  async function handleNavigation(direction: "next" | "previous") {
    if (!_questions.data) return;
    const newIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;
    if (newIndex >= 0 && newIndex < _questions.data?.length) {
      setCurrentIndex(newIndex);
      router.push({
        query: {
          topic_name: topic_name,
          question_id: _questions.data?.[newIndex].id,
          question_index: newIndex,
        },
      });
    }
  }

  return (
    <>
      {!question && _questions.isPending ? (
        "Loading.."
      ) : !question && _questions.isFetched && !_questions.data ? (
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
        <div
          className="flex flex-col h-screen w-full p-2"
          style={{
            height: "90%",
          }}
        >
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary">
              {currentIndex + 1}/{_questions.data?.length}
              <br></br>
              {question?.qa_topic.Label}
            </h1>
          </header>
          <Card className="flex flex-col h-full w-full text-center">
            <CardHeader>
              <CardTitle className="text-3xl font-bold">
                {question?.full_name
                  ? question?.full_name + "'s Question"
                  : "Question"}
              </CardTitle>
              <div className="text-xl text-muted-foreground">
                Subject: {question?.subject || ""}
              </div>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col">
              <div className="text-6xl font-semibold mb-8">
                {question?.question}
              </div>
              {question?.qa_answers && question.qa_answers.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-2xl font-semibold mb-4">Answer:</h3>
                  <p className="text-3xl">{question?.qa_answers[0].answer}</p>
                </div>
              )}
            </CardContent>
          </Card>
          <div className="flex justify-between mt-8 w-full flex-wrap gap-2">
            <Button
              size="lg"
              variant="secondary"
              onClick={() => {
                router.push(`/qa/${topic_name}`);
              }}
              className="text-2xl py-8 px-12 flex-grow"
            >
              <ChevronLeft className="mr-2 h-8 w-8" /> Question List
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => handleNavigation("previous")}
              className="text-2xl py-8 px-12 flex-grow"
            >
              <ChevronLeft className="mr-2 h-8 w-8" /> Previous
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => handleNavigation("next")}
              className="text-2xl py-8 px-12 flex-grow"
            >
              Next <ChevronRight className="ml-2 h-8 w-8" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
