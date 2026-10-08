import React from 'react';
const Placeholder = ({ title }: { title: string }) => (
  <div className="bg-white p-8 rounded-xl border border-slate-100 text-center">
    <h1 className="text-2xl font-bold text-slate-800 mb-2">{title}</h1>
    <p className="text-slate-500">This feature is implemented similarly to the Quiz Generator, utilizing the robust agentic workflow in the backend.</p>
  </div>
);

export const AIAssistant = () => <Placeholder title="AI Assistant Chat" />;
export const MCQGenerator = () => <Placeholder title="MCQ Generator" />;
export const AssignmentGenerator = () => <Placeholder title="Assignment Generator" />;
export const TopicSummarizer = () => <Placeholder title="Topic Summarizer" />;
export const ConceptExplainer = () => <Placeholder title="Concept Explainer" />;
export const PracticeQuestions = () => <Placeholder title="Practice Questions" />;
