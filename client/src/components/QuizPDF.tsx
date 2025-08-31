import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 30,
  },
  section: {
    margin: 10,
    padding: 10,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
  },
  question: {
    marginBottom: 15,
  },
  questionText: {
    fontSize: 12,
    marginBottom: 10,
  },
  code: {
    fontFamily: "Courier",
    fontSize: 10,
    marginVertical: 5,
    padding: 5,
    backgroundColor: "#f5f5f5",
  },
  option: {
    fontSize: 11,
    marginLeft: 20,
    marginVertical: 3,
  },
  marks: {
    fontSize: 10,
    marginTop: 5,
    textAlign: "right",
  },
});

interface QuizPDFProps {
  questions: any[];
  marksPerQuestion: number;
}

export const QuizPDF = ({ questions, marksPerQuestion }: QuizPDFProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.title}>Quiz Paper</Text>

        {questions.map((q, index) => (
          <View key={index} style={styles.question}>
            <Text style={styles.questionText}>
              {index + 1}.{" "}
              {q.type === "assertion-reason"
                ? `Assertion: ${q.question.assertion}\nReason: ${q.question.reason}`
                : q.question.text}
            </Text>

            {q.question.code && (
              <Text style={styles.code}>{q.question.code}</Text>
            )}

            {q.options.map((option: any, optIndex: number) => (
              <Text key={optIndex} style={styles.option}>
                {String.fromCharCode(65 + optIndex)}.{" "}
                {typeof option === "string"
                  ? option
                  : typeof option === "boolean"
                  ? JSON.stringify(option).replace('"', "")
                  : option.text}
              </Text>
            ))}
          </View>
        ))}
      </View>
    </Page>
  </Document>
);
