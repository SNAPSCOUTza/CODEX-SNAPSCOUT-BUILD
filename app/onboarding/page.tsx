"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { RoleSelect } from "@/components/onboarding/RoleSelect"
import { BranchSelect } from "@/components/onboarding/BranchSelect"
import { QuestionScreen } from "@/components/onboarding/QuestionScreen"
import { AhaMoment } from "@/components/onboarding/AhaMoment"
import { SignupForm } from "@/components/onboarding/SignupForm"
import { FeatureTour } from "@/components/onboarding/FeatureTour"
import { CompleteScreen } from "@/components/onboarding/CompleteScreen"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getPersonaLine, getTrack, roleTheme } from "@/lib/onboarding-config"
import type { OnboardingAnswers, OnboardingBranch, OnboardingRole } from "@/types/onboarding"
import { useAuth } from "@/contexts/auth-context"
import type { OnboardingData as LegacyOnboardingData } from "@/types/onboarding"

type Screen = "role" | "branch" | "questions" | "aha" | "signup" | "tour" | "complete"
export type OnboardingData = LegacyOnboardingData

function ProgressBar({ total, current }: { total: number; current: number }) {
  return (
    <div className="mb-5 mt-2 grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.max(total, 1)}, minmax(0, 1fr))` }}>
      {Array.from({ length: total }).map((_, index) => {
        const done = index < current
        const active = index === current
        return (
          <div
            key={index}
            className={`h-1 rounded-full ${done ? "bg-green-600" : active ? "bg-red-700" : "bg-gray-200"}`}
          />
        )
      })}
    </div>
  )
}

export default function OnboardingPage() {
  const router = useRouter()
  const { signUp, isAuthenticated, user } = useAuth()
  const [screen, setScreen] = useState<Screen>("role")
  const [role, setRole] = useState<OnboardingRole | null>(null)
  const [branch, setBranch] = useState<OnboardingBranch | null>(null)
  const [answers, setAnswers] = useState<OnboardingAnswers>({})
  const [questionIndex, setQuestionIndex] = useState(0)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [signupError, setSignupError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [tourStep, setTourStep] = useState(0)

  const track = useMemo(() => getTrack(role, branch), [role, branch])
  const currentQuestion = track?.questions[questionIndex]
  const primaryClass = role ? roleTheme[role].primary : roleTheme.creator.primary
  const selectionClass = role ? roleTheme[role].selection : roleTheme.creator.selection

  const totalProgressSteps = 8
  const progressCurrent = screen === "questions" ? questionIndex : Math.min(questionIndex, totalProgressSteps - 1)

  const canContinueQuestion = useMemo(() => {
    if (!currentQuestion) return false
    const value = answers[currentQuestion.id]
    if (currentQuestion.mode === "multi") return Array.isArray(value) && value.length > 0
    return typeof value === "string" && value.length > 0
  }, [answers, currentQuestion])

  const handleRoleSelect = (nextRole: OnboardingRole) => {
    setRole(nextRole)
    setBranch(null)
    setAnswers({})
    setQuestionIndex(0)
    setScreen(nextRole === "scout" ? "questions" : "branch")
  }

  const handleBranchSelect = (nextBranch: OnboardingBranch) => {
    setBranch(nextBranch)
    setAnswers({})
    setQuestionIndex(0)
    setScreen("questions")
  }

  const handleQuestionContinue = () => {
    if (!track) return
    if (questionIndex < track.questions.length - 1) {
      setQuestionIndex((prev) => prev + 1)
      return
    }
    setScreen("aha")
  }

  const handleQuestionBack = () => {
    if (questionIndex > 0) {
      setQuestionIndex((prev) => prev - 1)
      return
    }
    if (role === "scout") {
      setScreen("role")
      return
    }
    setScreen("branch")
  }

  const handleSignup = async () => {
    if (!role) return
    setSignupError("")
    setSubmitting(true)
    try {
      const accountType =
        role === "scout"
          ? roleTheme.scout.accountType
          : role === "creator"
            ? roleTheme.creator.accountType
            : roleTheme.studio_store.accountType
      const displayName = email.split("@")[0] || "SnapScout User"

      if (!isAuthenticated) {
        const { error } = await signUp(email, password, displayName, accountType)
        if (error) {
          setSignupError(error.message || "Failed to create account")
          setSubmitting(false)
          return
        }
      }

      await fetch("/api/profile/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user?.id,
          display_name: displayName,
          full_name: displayName,
          account_type: accountType,
          onboarding_data: {
            role,
            branch,
            answers,
            completed_at: new Date().toISOString(),
          },
        }),
      }).catch(() => null)

      setScreen("tour")
    } finally {
      setSubmitting(false)
    }
  }

  const topSpecialisations = useMemo(() => {
    const possible = answers.q2
    if (Array.isArray(possible)) return possible.slice(0, 3).map((value) => value.replace(/_/g, " "))
    return []
  }, [answers])

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-5xl px-4 py-8 md:py-10">
        {screen === "questions" && track ? <ProgressBar total={totalProgressSteps} current={progressCurrent} /> : null}

        {screen === "role" ? <RoleSelect onSelect={handleRoleSelect} /> : null}

        {screen === "branch" && role && role !== "scout" ? (
          <BranchSelect role={role} onSelect={handleBranchSelect} onBack={() => setScreen("role")} />
        ) : null}

        {screen === "questions" && currentQuestion ? (
          <QuestionScreen
            question={currentQuestion}
            value={answers[currentQuestion.id]}
            onChange={(value) => setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }))}
            onContinue={handleQuestionContinue}
            onBack={handleQuestionBack}
            canContinue={canContinueQuestion}
            primaryButtonClass={primaryClass}
            roleSelectionClass={selectionClass}
          />
        ) : null}

        {screen === "aha" ? (
          <AhaMoment
            personaLine={getPersonaLine(role, branch, answers)}
            primaryButtonClass={primaryClass}
            onContinue={() => setScreen(isAuthenticated ? "tour" : "signup")}
            onBack={() => setScreen("questions")}
          />
        ) : null}

        {screen === "signup" && isAuthenticated ? (
          <Card className="border-2 border-gray-200">
            <CardHeader>
              <CardTitle>You are already signed in</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                We&apos;ll skip account creation and continue to your personalised tour.
              </p>
              <Button className={`w-full ${primaryClass}`} onClick={() => setScreen("tour")}>
                Continue
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => setScreen("aha")}>
                Back
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {screen === "signup" && !isAuthenticated ? (
          <SignupForm
            roleLabel={role ? roleTheme[role].label : "Member"}
            primaryButtonClass={primaryClass}
            email={email}
            password={password}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onSubmit={handleSignup}
            onBack={() => setScreen("aha")}
            loading={submitting}
            error={signupError}
          />
        ) : null}

        {screen === "tour" ? (
          <FeatureTour
            step={tourStep}
            onNext={() => {
              if (tourStep >= 3) {
                setScreen("complete")
                return
              }
              setTourStep((prev) => prev + 1)
            }}
            onSkip={() => setScreen("complete")}
          />
        ) : null}

        {screen === "complete" && role ? (
          <CompleteScreen
            role={role}
            firstName={(email.split("@")[0] || "there").replace(/[._-]/g, " ")}
            topSpecialisations={topSpecialisations}
            primaryButtonClass={primaryClass}
            onDone={() => router.push("/dashboard")}
          />
        ) : null}
      </div>
    </main>
  )
}
