import { useState } from "react";
import Head from "next/head";

interface Objective {
  description: string;
  isDone: boolean;
}

interface ReleaseNote {
  version: string;
  branchName: string;
  startDate: string;
  objectives: Objective[];
}

const todo = [
  {
    description: "QA Asnwers",
    isDone: true,
  },
  {
    description: "FTP Image Upload",
    isDone: true,
  },
  {
    description: "Image Selector",
    isDone: true,
  },
];
export const releaseNotes: ReleaseNote[] = [
  {
    version: "20250225",
    branchName: "2025.02.25-leadership_tenure_managment",
    startDate: "2025.02.25",
    objectives: [
      { description: "Leadership Tenure", isDone: true },
      {
        description: "Manage leadership tenure and leadership appointments",
        isDone: true,
      },
    ],
  },
  {
    version: "20241119",
    branchName: "2024.11.19-qa_system",
    startDate: "2024.11.19",
    objectives: [
      { description: "General QA System", isDone: true },
      {
        description: "More filters & fields on Registration Manage",
        isDone: false,
      },
      {
        description: "Release notes page",
        isDone: true,
      },
      {
        description: "/reg2 Filter Buttons [Verified Members, In China]",
        isDone: false,
      },
      {
        description: "verified members only for those completed registration",
        isDone: true,
      },
    ],
  },
  {
    version: "requests",
    branchName: "Feature Request",
    startDate: "",
    objectives: [
      {
        description: "2 Step Registration",
        isDone: false,
      },

      {
        description: "Birthday(s) Page",
        isDone: false,
      },

      {
        description:
          "Leavers page, marking when left, graduated, graduating this year",
        isDone: false,
      },
      {
        description: "Finance System",
        isDone: false,
      },
    ],
  },
];

export default function ReleaseNotes() {
  const [notes, setNotes] = useState<ReleaseNote[]>(releaseNotes);

  const toggleObjective = (noteIndex: number, objectiveIndex: number) => {
    const updatedNotes = [...notes];
    updatedNotes[noteIndex].objectives[objectiveIndex].isDone =
      !updatedNotes[noteIndex].objectives[objectiveIndex].isDone;
    setNotes(updatedNotes);
  };

  return (
    <div className="min-h-screen  py-6 flex flex-col justify-center sm:py-12">
      <Head>
        <title>Release Notes</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div
          className="relative px-4 py-10 shadow-lg sm:rounded-3xl sm:p-20"
          style={{
            backgroundColor: "#19212A",
          }}
        >
          <div className="max-w-md mx-auto">
            <h1 className="text-2xl font-semibold mb-6">Release Notes</h1>
            {notes.map((note, noteIndex) => (
              <div key={noteIndex} className="mb-8" id={note.version}>
                <h2 className="text-xl font-semibold mb-2">
                  {note.branchName}
                </h2>
                <p className="text-sm text-gray-600 mb-2">
                  Start Date: {note.startDate}
                </p>
                <ul>
                  {note.objectives.map((objective, objectiveIndex) => (
                    <li key={objectiveIndex} className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        disabled
                        checked={objective.isDone}
                        onChange={() =>
                          toggleObjective(noteIndex, objectiveIndex)
                        }
                        className="mr-2"
                      />
                      <span
                        className={
                          objective.isDone ? "line-through text-gray-500" : ""
                        }
                      >
                        {objective.description}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
