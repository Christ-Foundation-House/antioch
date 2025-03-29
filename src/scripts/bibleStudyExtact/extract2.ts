// const fs = require("fs");
// const pdf = require("pdf-parse");

// interface Lesson {
//   title: string;
//   discussion: string;
//   // Add other properties as needed
// }

// const extractPatternsToJson = async (filePath: string) => {
//   const dataBuffer = fs.readFileSync(filePath);
//   const data = await pdf(dataBuffer);
//   const text = data.text;

//   // Define regex patterns for the sections you're interested in
//   const lessonPattern = /LESSON \d+: ([^\n]+)/g;
//   const discussionPattern = /DISCUSSION}([\s\S]*?)\\section\*/g;
//   // Add more patterns as needed

//   const lessons: Lesson[] = [];

//   // Extract lessons
//   let match: RegExpExecArray | null;
//   while ((match = lessonPattern.exec(text)) !== null) {
//     lessons.push({
//       title: match[1],
//       discussion: "",
//       // Initialize other properties as needed
//     });
//   }

//   // Extract discussions (assuming each lesson has one discussion for simplicity)
//   lessons.forEach((lesson) => {
//     const discussionMatch = discussionPattern.exec(text);
//     if (discussionMatch) {
//       lesson.discussion = discussionMatch[1].trim();
//     }
//     // Reset the regex lastIndex to ensure subsequent matches
//     discussionPattern.lastIndex = 0;
//   });

//   // Convert the extracted data to JSON
//   const jsonOutput = JSON.stringify(lessons, null, 2);
//   console.log(jsonOutput);

//   // Optionally, save the JSON to a file
//   fs.writeFileSync("output.json", jsonOutput);
// };

// // Replace 'path/to/your/pdf' with the actual PDF file path
// extractPatternsToJson("../../../references/BibleStudyGuide-2024.pdf");
