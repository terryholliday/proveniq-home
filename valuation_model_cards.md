# Valuation Model Cards

## Overview
The Valuation Intelligence Engine uses a multi-model ensemble approach to provide accurate, transparent, and explainable value estimates for items.

## Models

### 1. AI Description Model
- **Type**: Heuristic / NLP (Placeholder)
- **Input**: Item description text.
- **Logic**: Analyzes the complexity and length of the description as a proxy for item detail and potential value features.
- **Output**: Estimated value in USD.
- **Strengths**: Good for capturing value from detailed user input.
- **Weaknesses**: Can be gamed by verbose but meaningless descriptions (in current heuristic form).

### 2. Price History Model
- **Type**: Historical Data Lookup
- **Input**: Original purchase price.
- **Logic**: Applies a baseline depreciation factor (40%) to the original price.
- **Output**: Estimated value in USD.
- **Strengths**: Anchored in real transaction data.
- **Weaknesses**: Does not account for appreciation or specific market trends.

### 3. Marketplace Comparison Model
- **Type**: Market Analysis (Placeholder)
- **Input**: Category (e.g., Guitar, Electronics).
- **Logic**: Simulates external market data by providing a range-based estimate for known categories.
- **Output**: Estimated value in USD.
- **Strengths**: Reflects current market conditions (simulated).
- **Weaknesses**: High variance in placeholder implementation.

### 4. Condition Adjusted Model
- **Type**: Adjustment Layer
- **Input**: Base estimate from ensemble, Condition (New, Excellent, Good, Fair, Poor).
- **Logic**: Applies a multiplier to the base estimate based on the item's condition.
    - New: 1.0x
    - Excellent: 0.9x
    - Good: 0.75x
    - Fair: 0.5x
    - Poor: 0.2x
- **Output**: Final adjusted value.

## Ensemble Logic
The final valuation is a weighted average of the available model outputs:
- **Marketplace Comparison**: 50% weight
- **Price History**: 30% weight
- **AI Description**: 20% weight

## Confidence Scoring
Score (0-100) is calculated based on:
- Availability of multiple model outputs (+20 each for History and Market).
- Presence of specific item details (Brand, Model).
- Base confidence of 50.

## Explainability
The engine generates a natural language explanation citing the factors used (sales data, age, condition) to build trust with the user.
