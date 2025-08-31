import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Checkbox,
  FormControl,
  FormControlLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { QUESTION_TYPE_OPTIONS } from "../../constants";
import {
  Brain,
  ChevronDown,
  NotebookPen,
  Settings,
  Target,
} from "lucide-react";
import { useEffect, useState } from "react";

type Settings = {
  difficulty: string;
  numQuestions: number;
  questionType: string;
};

const CustomizationPanelPdfBased = ({
  settings,
  setSettings,
  isOpen,
  setIsOpen,
  isDisabled = false,
}: {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isDisabled?: boolean;
}) => {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  useEffect(() => {
    // Always set MCQ as the question type and 10 questions
    setSettings((prev) => ({
      ...prev,
      questionType: "mcq",
      numQuestions: 10,
    }));
  }, [setSettings]);

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
    <div className="w-full rounded-lg">
      <Accordion
        expanded={isOpen}
        onChange={handleAccordionChange}
        disabled={isDisabled}
        sx={{
          backgroundColor: isDisabled ? "#f5f5f5" : "#f8fafc",
          borderRadius: "0.75rem",
          "&:before": {
            display: "none",
          },
          boxShadow: "none",
          width: "100%",
          opacity: isDisabled ? 0.6 : 1,
        }}
      >
        <AccordionSummary
          expandIcon={<ChevronDown className="w-5 h-5" />}
          disabled={false}
          sx={{
            padding: { xs: "0.75rem", sm: "1rem" },
            "& .MuiAccordionSummary-content": {
              margin: 0,
            },
          }}
        >
          <div className="flex items-center space-x-2">
            <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
            <Typography variant="body1" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
              Customizations
            </Typography>
          </div>
        </AccordionSummary>

        <AccordionDetails 
          sx={{ 
            padding: { xs: "1rem", sm: "1.5rem" }, 
            paddingTop: 0 
          }}
        >
          <div className="space-y-6 sm:space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <FormControl fullWidth>
                <div className="flex items-center space-x-2 mb-2 sm:mb-3">
                  <Brain className="w-4 h-4" style={{ color: "#3b82f6" }} />
                  <Typography sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem' } }}>
                    Difficulty Level
                  </Typography>
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
                  size="small"
                  sx={{ 
                    fontSize: { xs: '0.85rem', sm: '0.95rem' },
                    '.MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(0, 0, 0, 0.15)',
                    },
                  }}
                >
                  <MenuItem value="easy">Easy</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="hard">Hard</MenuItem>
                  <MenuItem value="mixed">Mixed</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <div className="flex items-center space-x-2 mb-2 sm:mb-3">
                  <Target className="w-4 h-4" style={{ color: "#10b981" }} />
                  <Typography sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem' } }}>
                    Number of Questions
                  </Typography>
                  <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded" title="Fixed to 10 questions for now. More options coming soon!">
                    Fixed
                  </div>
                </div>
                <Select
                  value={10}
                  disabled
                  variant="outlined"
                  size="small"
                  sx={{ 
                    fontSize: { xs: '0.85rem', sm: '0.95rem' },
                    '.MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(0, 0, 0, 0.15)',
                    },
                    backgroundColor: '#f5f5f5',
                  }}
                >
                  <MenuItem value={10}>10</MenuItem>
                </Select>
              </FormControl>
            </div>

            <FormControl component="fieldset" className="w-full">
              <div className="flex items-center space-x-2 mb-2 sm:mb-3">
                <NotebookPen className="w-4 h-4" style={{ color: "#6366f1" }} />
                <Typography sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem' } }}>
                  Question Types
                </Typography>
                <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded" title="Only MCQ available for now. More types coming soon!">
                  MCQ Only
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2">
                {QUESTION_TYPE_OPTIONS.map((type) => (
                  <FormControlLabel
                    key={type.id}
                    control={
                      <Checkbox
                        checked={type.id === 'mcq'}
                        disabled={type.id !== 'mcq'}
                        size="small"
                        sx={{
                          padding: { xs: '4px', sm: '8px' },
                          "&.Mui-checked": {
                            color: "black",
                          },
                          "&.Mui-disabled": {
                            color: "rgba(0, 0, 0, 0.38)",
                          },
                        }}
                      />
                    }
                    label={
                      <div className="flex items-center space-x-2">
                        <Typography 
                          sx={{ 
                            fontSize: { xs: '0.8rem', sm: '0.9rem' },
                            color: type.id === 'mcq' ? 'inherit' : 'rgba(0, 0, 0, 0.38)',
                          }}
                        >
                          {type.label}
                        </Typography>
                        {type.id !== 'mcq' && (
                          <div className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">
                            Coming Soon
                          </div>
                        )}
                      </div>
                    }
                    sx={{
                      margin: { xs: '0', sm: '0 0 2px' },
                      '& .MuiFormControlLabel-label': {
                        width: '100%'
                      }
                    }}
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

export default CustomizationPanelPdfBased;
