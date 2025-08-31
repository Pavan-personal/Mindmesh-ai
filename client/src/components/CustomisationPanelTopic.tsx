import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Checkbox,
  Chip,
  FormControl,
  FormControlLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import {
  Brain,
  ChevronDown,
  NotebookPen,
  Settings,
  Target,
} from "lucide-react";
import { useEffect, useState } from "react";
import { QUESTION_TYPE_OPTIONS } from "../../constants";

type Settings = {
  difficulty: string;
  numQuestions: number;
  questionType: string;
};

const CustomizationPanelTopicBased = ({
  settings,
  setSettings,
  isOpen,
  setIsOpen,
}: {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  useEffect(() => {
    if (selectedTypes.length > 0) {
      setSettings((prev) => ({
        ...prev,
        questionTypes: selectedTypes.join(","),
      }));
    } else {
      setSettings((prev) => ({
        ...prev,
        questionTypes: "mcq",
      }));
    }
  }, [selectedTypes, setSettings]);

  useEffect(() => {
    if (settings.questionType) {
      setSelectedTypes(settings.questionType.split(","));
    }
  }, [settings.questionType]);

  const handleTypeToggle = (typeId: string) => {
    setSelectedTypes((prev) => {
      if (prev.includes(typeId)) {
        return prev.filter((t) => t !== typeId);
      }
      return [...prev, typeId];
    });
  };

  const handleAccordionChange = (
    event: React.SyntheticEvent,
    newExpanded: boolean
  ) => {
    setIsOpen(newExpanded);
  };

  return (
    <div className="w-full space-y-6">
      <Accordion
        expanded={isOpen}
        onChange={handleAccordionChange}
        sx={{
          backgroundColor: "#f8fafc",
          borderRadius: "0.75rem",
          "&:before": {
            display: "none",
          },
          boxShadow: "none",
        }}
      >
        <AccordionSummary
          expandIcon={<ChevronDown className="w-5 h-5" />}
          sx={{
            padding: "1rem",
            "& .MuiAccordionSummary-content": {
              margin: 0,
            },
          }}
        >
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <Typography>Customizations</Typography>
          </div>
        </AccordionSummary>

        <AccordionDetails sx={{ padding: "1.5rem", paddingTop: 0 }}>
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-6">
              <FormControl fullWidth>
                <div className="flex items-center space-x-2 mb-3">
                  <Brain className="w-4 h-4" style={{ color: "#3b82f6" }} />
                  <Typography>Difficulty Level</Typography>
                </div>
                <Select
                  value={settings.difficulty}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      difficulty: e.target.value as string,
                    })
                  }
                  variant="outlined"
                >
                  <MenuItem value="easy">Easy</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="hard">Hard</MenuItem>
                  <MenuItem value="mixed">Mixed</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <div className="flex items-center space-x-2 mb-3">
                  <Target className="w-4 h-4" style={{ color: "#10b981" }} />
                  <Typography>Number of Questions</Typography>
                </div>
                <Select
                  value={settings.numQuestions}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      numQuestions: parseInt(e.target.value as string),
                    })
                  }
                  variant="outlined"
                >
                  <MenuItem value={5}>5</MenuItem>
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={15}>15</MenuItem>
                  <MenuItem value={20}>20</MenuItem>
                  <MenuItem value={30}>30</MenuItem>
                </Select>
              </FormControl>
            </div>

            <FormControl component="fieldset" className="w-full">
              <div className="flex items-center space-x-2 mb-3">
                <NotebookPen className="w-4 h-4" style={{ color: "#" }} />
                <Typography>Question Types</Typography>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {QUESTION_TYPE_OPTIONS.map((type) => (
                  <FormControlLabel
                    key={type.id}
                    control={
                      <Checkbox
                        checked={selectedTypes.includes(type.id)}
                        onChange={() => handleTypeToggle(type.id)}
                        sx={{
                          "&.Mui-checked": {
                            color: "black",
                          },
                        }}
                      />
                    }
                    label={
                      <div className="flex items-center space-x-2">
                        <Typography>{type.label}</Typography>
                        {/* {selectedTypes.includes(type.id) && (
                          <Chip
                            size="small"
                            label="Selected"
                            sx={{
                              backgroundColor: "black",
                              color: "white",
                              fontSize: "0.7rem",
                            }}
                          />
                        )} */}
                      </div>
                    }
                  />
                ))}
              </div>
            </FormControl>
          </div>
        </AccordionDetails>
      </Accordion>
    </div>
  );
};

export default CustomizationPanelTopicBased;
