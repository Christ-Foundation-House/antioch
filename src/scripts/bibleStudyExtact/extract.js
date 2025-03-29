var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    // eslint-disable-next-line no-undef
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g;
    return (
      (g = { next: verb(0), throw: verb(1), return: verb(2) }),
      typeof Symbol === "function" &&
        // eslint-disable-next-line no-undef
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                    ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
var _this = this;
var fs = require("fs");
var pdf = require("pdf-parse");
// This function will read the PDF file and parse its contents
var parsePDF = function (filePath) {
  return __awaiter(_this, void 0, void 0, function () {
    var dataBuffer, data, text, topics, error_1;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 2, , 3]);
          dataBuffer = fs.readFileSync(filePath);
          return [4 /*yield*/, pdf(dataBuffer)];
        case 1:
          data = _a.sent();
          text = data.text;
          topics = processText(text);
          // Push the contents for each topic into their main components
          topics.forEach(function (topic) {
            console.log("Topic: ".concat(topic.title));
            console.log("Discussion: ".concat(topic.discussion));
            console.log("Further Readings: ".concat(topic.furtherReadings));
            console.log("Take Home Message: ".concat(topic.takeHomeMessage));
            console.log("Prayer Points: ".concat(topic.prayerPoints));
            // ... additional processing or pushing to a database can be done here
          });
          return [3 /*break*/, 3];
        case 2:
          error_1 = _a.sent();
          console.error("Error parsing PDF:", error_1);
          return [3 /*break*/, 3];
        case 3:
          return [2 /*return*/];
      }
    });
  });
};
// This function will process the text and return an array of topics with their components
var processText = function (text) {
  // Split the text into sections based on the pattern of the document structure
  var sections = text.split(/\\section\*\{[A-Z ]+\}/);
  // Remove the first element which is before the first section
  sections.shift();
  // Define a regex pattern to extract components of each topic
  var discussionPattern = /DISCUSSION}([\s\S]*?)\\section\*/;
  var furtherReadingsPattern = /FURTHER READINGS}([\s\S]*?)\\section\*/;
  var takeHomeMessagePattern = /TAKE HOME MESSAGE}([\s\S]*?)\\section\*/;
  var prayerPointsPattern = /PRAYER POINTS?}([\s\S]*?)(\\section\*|$)/;
  // Map each section to a topic object
  var topics = sections.map(function (section) {
    var titleMatch = section.match(/LESSON \d+: ([^\n]+)/);
    var title = titleMatch ? titleMatch[1].trim() : "Unknown Title";
    var discussionMatch = section.match(discussionPattern);
    var discussion = discussionMatch ? discussionMatch[1].trim() : "";
    var furtherReadingsMatch = section.match(furtherReadingsPattern);
    var furtherReadings = furtherReadingsMatch
      ? furtherReadingsMatch[1].trim()
      : "";
    var takeHomeMessageMatch = section.match(takeHomeMessagePattern);
    var takeHomeMessage = takeHomeMessageMatch
      ? takeHomeMessageMatch[1].trim()
      : "";
    var prayerPointsMatch = section.match(prayerPointsPattern);
    var prayerPoints = prayerPointsMatch ? prayerPointsMatch[1].trim() : "";
    return {
      title: title,
      discussion: discussion,
      furtherReadings: furtherReadings,
      takeHomeMessage: takeHomeMessage,
      prayerPoints: prayerPoints,
    };
  });
  return topics;
};
// Example usage:
// Replace 'path/to/BibleStudyGuide-2024.pdf' with the actual file path
parsePDF("../../../references/BibleStudyGuide-2024.pdf");
