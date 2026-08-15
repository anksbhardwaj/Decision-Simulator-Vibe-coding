import { useState } from 'react';
import { Compass } from 'lucide-react';
import { StepIndicator } from '@/components/StepIndicator';
import { Home } from '@/screens/Home';
import { Setup } from '@/screens/Setup';
import { Questions } from '@/screens/Questions';
import { Priorities } from '@/screens/Priorities';
import { Results } from '@/screens/Results';
import { rebalanceWeights, computeResult } from '@/lib/decision';
import { generateQuestions, generateCriteria } from '@/services/aiService';
import type { Answers, Criterion, DecisionInput, QuestionSet, Step } from '@/types';

const ORDER: Step[] = ['decision', 'questions', 'priorities', 'results'];

function App() {
  const [step, setStep] = useState<Step>('home');
  const [furthest, setFurthest] = useState<Step>('decision');
  const [decision, setDecision] = useState<DecisionInput>({ question: '', optionA: '', optionB: '' });
  const [answers, setAnswers] = useState<Answers>({});

  const [questionSet, setQuestionSet] = useState<QuestionSet | null>(null);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [questionsError, setQuestionsError] = useState<string | null>(null);

  const [criteria, setCriteria] = useState<Criterion[] | null>(null);
  const [criteriaLoading, setCriteriaLoading] = useState(false);
  const [criteriaError, setCriteriaError] = useState<string | null>(null);

  const [initialRecommended, setInitialRecommended] = useState<'A' | 'B'>('B');

  const labelA = decision.optionA.trim() || 'Option A';
  const labelB = decision.optionB.trim() || 'Option B';

  const advance = (target: Step) => {
    setStep(target);
    if (ORDER.indexOf(target) > ORDER.indexOf(furthest)) setFurthest(target);
  };

  const startDecision = (prefill?: DecisionInput) => {
    if (prefill) setDecision(prefill);
    setFurthest('decision');
    setStep('decision');
  };

  // Triggered when user clicks Continue on the decision form
  const handleDecisionContinue = async () => {
    setQuestionsError(null);
    setQuestionSet(null);
    advance('questions');
    setQuestionsLoading(true);
    try {
      const result = await generateQuestions(decision);
      setQuestionSet(result);
    } catch (err) {
      console.error('Question generation failed:', err);
      setQuestionsError(
        err instanceof Error ? err.message : 'We couldn\'t analyze your decision right now.',
      );
    } finally {
      setQuestionsLoading(false);
    }
  };

  const retryQuestions = () => handleDecisionContinue();

  // Triggered when user answers the final question and clicks Continue
  const handleQuestionsContinue = async () => {
    if (!questionSet) return;
    setCriteriaError(null);
    setCriteria(null);
    advance('priorities');
    setCriteriaLoading(true);
    try {
      const result = await generateCriteria({
        ...decision,
        questions: questionSet.questions.map((q) => ({
          id: q.id,
          question: q.question,
          type: q.type,
        })),
        answers,
      });
      setCriteria(result.criteria);
    } catch (err) {
      console.error('Criteria generation failed:', err);
      setCriteriaError(
        err instanceof Error ? err.message : 'We couldn\'t analyze your decision right now.',
      );
    } finally {
      setCriteriaLoading(false);
    }
  };

  const retryCriteria = () => handleQuestionsContinue();

  const handleWeightChange = (id: string, weight: number) => {
    setCriteria((prev) => (prev ? rebalanceWeights(prev, id, weight) : prev));
  };

  const calculate = () => {
    if (!criteria) return;
    setInitialRecommended(computeResult(criteria).recommended);
    advance('results');
  };

  const restart = () => {
    setDecision({ question: '', optionA: '', optionB: '' });
    setAnswers({});
    setQuestionSet(null);
    setQuestionsError(null);
    setQuestionsLoading(false);
    setCriteria(null);
    setCriteriaError(null);
    setCriteriaLoading(false);
    setFurthest('decision');
    setStep('home');
  };

  if (step === 'home') {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <Home onStart={startDecision} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <button
            type="button"
            onClick={restart}
            className="flex items-center gap-2 text-sm font-bold text-slate-900"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
              <Compass className="h-4 w-4" />
            </span>
            Decision Simulator
          </button>
        </div>
        <div className="mx-auto max-w-4xl px-6 pb-4">
          <StepIndicator current={step} furthest={furthest} onNavigate={setStep} />
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-10">
        {step === 'decision' && (
          <Setup
            value={decision}
            onChange={setDecision}
            onContinue={handleDecisionContinue}
            onBack={() => setStep('home')}
          />
        )}
        {step === 'questions' && (
          <Questions
            questionSet={questionSet}
            loading={questionsLoading}
            error={questionsError}
            answers={answers}
            onChange={setAnswers}
            onContinue={handleQuestionsContinue}
            onBack={() => setStep('decision')}
            onRetry={retryQuestions}
          />
        )}
        {step === 'priorities' && (
          <Priorities
            criteria={criteria}
            loading={criteriaLoading}
            error={criteriaError}
            labelA={labelA}
            labelB={labelB}
            onWeightChange={handleWeightChange}
            onCalculate={calculate}
            onBack={() => setStep('questions')}
            onRetry={retryCriteria}
          />
        )}
        {step === 'results' && criteria && (
          <Results
            criteria={criteria}
            labelA={labelA}
            labelB={labelB}
            initialRecommended={initialRecommended}
            onWeightChange={handleWeightChange}
            onBack={() => setStep('priorities')}
            onRestart={restart}
          />
        )}
      </main>
    </div>
  );
}

export default App;
