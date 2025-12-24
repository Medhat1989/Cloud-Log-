
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzeCrewDynamics(
  flightData: string,
  spatialData: string,
  currentPhase: string
): Promise<string> {
  const prompt = `
    As an Aviation Human Factors and CRM expert, analyze the following real-time crew dynamics and spatial coordination data for a flight in ${currentPhase} phase.
    
    Crew Stress Data:
    ${flightData}

    Spatial & Activity Data:
    ${spatialData}
    
    Provide a concise, non-punitive CRM assessment focusing on:
    1. Zone Bottlenecks: Are there "dead zones" or over-crowded galleys?
    2. Coordination Health: Is movement aligned with SOP for ${currentPhase}?
    3. Suggested "Support Actions": Strategic redistribution of tasks to balance workload.
    
    Format the response as a supportive, professional briefing for the Lead Flight Attendant.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    return response.text || "Analysis unavailable.";
  } catch (error) {
    console.error("Gemini analysis error:", error);
    return "Error connecting to CRM Insight Engine.";
  }
}

export async function analyzeVoiceStress(
  audioBase64: string,
  mimeType: string
): Promise<string> {
  const prompt = `
    Analyze this cabin crew audio for non-lexical stress markers and CRM (Crew Resource Management) implications.
    
    ALSO: Identify if a medical emergency is being described in the dialog.
    If a medical emergency is detected, specify the CATEGORY (e.g., Cardiac, Respiratory, Fainting, Choking, Anaphylaxis) and the standard Airline SOP steps required.

    Focus on:
    - Fundamental Frequency (F0) elevation (signs of acute stress)
    - Speech rate and jitter (urgency vs. composure)
    
    Do NOT transcribe the words fully in the final report, focus on acoustic features.
    
    If medical emergency found, include a section:
    [EMERGENCY_DATA]
    Type: {Category}
    SOP: {Action 1}; {Action 2}; {Action 3}
    [/EMERGENCY_DATA]
    
    Format as a structured technical report.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          inlineData: {
            mimeType: mimeType,
            data: audioBase64
          }
        },
        { text: prompt }
      ],
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    return response.text || "Acoustic analysis failed.";
  } catch (error) {
    console.error("Voice analysis error:", error);
    return "Analysis unavailable: Ensure your microphone is active and you provided a clear sample.";
  }
}

export async function generateDebriefReport(
  flightSummary: string
): Promise<string> {
  const prompt = `
    Generate a post-flight Human Factors Debrief Report for "CloudLog AI". 
    Focus on anonymized team-level metrics and systemic improvements. 
    Do not blame individuals.
    
    Summary of data:
    ${flightSummary}
    
    Include:
    - Overall Team Cohesion Trend
    - Phase-Specific Workload Spikes
    - SOP Refinement Recommendations
    - Wellness Summary
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 5000 }
      }
    });
    return response.text || "Report generation failed.";
  } catch (error) {
    console.error("Debrief generation error:", error);
    return "Error generating post-flight report.";
  }
}
