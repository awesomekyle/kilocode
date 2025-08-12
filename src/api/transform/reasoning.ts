import { BetaThinkingConfigParam } from "@anthropic-ai/sdk/resources/beta"
import OpenAI from "openai"
import type { GenerateContentConfig } from "@google/genai"

import type { ModelInfo, ProviderSettings, ReasoningEffort } from "@roo-code/types" // kilocode_change

import { shouldUseReasoningBudget, shouldUseReasoningEffort } from "../../shared/api"

// kilocode_change - removed local ReasoningEffort type definition, now imported from @roo-code/types

// kilocode_change start
// Helper function to convert our internal ReasoningEffort type to OpenAI SDK's supported values
function convertReasoningEffortToOpenAI(effort: ReasoningEffort | undefined): OpenAI.Chat.ChatCompletionCreateParams["reasoning_effort"] {
	if (effort === "minimal") {
		// For now, map "minimal" to "low" until OpenAI SDK supports it
		return "low" as any;
	}
	return effort as OpenAI.Chat.ChatCompletionCreateParams["reasoning_effort"];
}
// kilocode_change end

export type OpenRouterReasoningParams = {
	effort?: ReasoningEffort
	max_tokens?: number
	exclude?: boolean
}

export type AnthropicReasoningParams = BetaThinkingConfigParam

export type OpenAiReasoningParams = { reasoning_effort: OpenAI.Chat.ChatCompletionCreateParams["reasoning_effort"] }

export type GeminiReasoningParams = GenerateContentConfig["thinkingConfig"]

export type GetModelReasoningOptions = {
	model: ModelInfo
	reasoningBudget: number | undefined
	reasoningEffort: ReasoningEffort | undefined
	settings: ProviderSettings
}

export const getOpenRouterReasoning = ({
	model,
	reasoningBudget,
	reasoningEffort,
	settings,
}: GetModelReasoningOptions): OpenRouterReasoningParams | undefined =>
	shouldUseReasoningBudget({ model, settings })
		? { max_tokens: reasoningBudget }
		: shouldUseReasoningEffort({ model, settings })
			? { effort: reasoningEffort }
			: undefined

export const getAnthropicReasoning = ({
	model,
	reasoningBudget,
	settings,
}: GetModelReasoningOptions): AnthropicReasoningParams | undefined =>
	shouldUseReasoningBudget({ model, settings }) ? { type: "enabled", budget_tokens: reasoningBudget! } : undefined

export const getOpenAiReasoning = ({
	model,
	reasoningEffort,
	settings,
}: GetModelReasoningOptions): OpenAiReasoningParams | undefined =>
	shouldUseReasoningEffort({ model, settings }) ? { reasoning_effort: convertReasoningEffortToOpenAI(reasoningEffort) } : undefined // kilocode_change

export const getGeminiReasoning = ({
	model,
	reasoningBudget,
	settings,
}: GetModelReasoningOptions): GeminiReasoningParams | undefined =>
	shouldUseReasoningBudget({ model, settings })
		? { thinkingBudget: reasoningBudget!, includeThoughts: true }
		: undefined
