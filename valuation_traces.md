# Valuation Traces

## Scenario: Vintage Guitar
**Input:**
```json
{
  "category": "Guitar",
  "brand": "Fender",
  "model": "Stratocaster",
  "condition": "Good",
  "ageYears": 15,
  "description": "1970s style Stratocaster with some wear and tear but plays great.",
  "originalPrice": 1200
}
```
**Output:**
```json
{
  "estimatedValue": {
    "min": 407,
    "max": 498,
    "currency": "USD"
  },
  "confidenceScore": 100,
  "factors": {
    "brand": 10,
    "condition": -25,
    "age": -75,
    "materials": 0,
    "provenance": 0,
    "market": 0
  },
  "explanation": "This estimate is based on recent sales of similar items, age, and detected condition (Good).",
  "modelBreakdown": {
    "aiDescription": 82.5,
    "priceHistory": 720,
    "marketComparison": 741.7770814350079,
    "conditionAdjusted": 452.54140553812795
  },
  "depreciationCurve": [
    {
      "year": 2025,
      "value": 452.54140553812795
    },
    {
      "year": 2026,
      "value": 429.91433526122154
    },
    {
      "year": 2027,
      "value": 408.41861849816047
    },
    {
      "year": 2028,
      "value": 387.9976875732524
    },
    {
      "year": 2029,
      "value": 368.59780319458974
    },
    {
      "year": 2030,
      "value": 350.16791303486025
    }
  ]
}
```
---

## Scenario: Modern Laptop
**Input:**
```json
{
  "category": "Electronics",
  "brand": "Apple",
  "model": "MacBook Pro",
  "condition": "Excellent",
  "ageYears": 2,
  "description": "M1 MacBook Pro, barely used.",
  "originalPrice": 2000
}
```
**Output:**
```json
{
  "estimatedValue": {
    "min": 412,
    "max": 505,
    "currency": "USD"
  },
  "confidenceScore": 100,
  "factors": {
    "brand": 10,
    "condition": -10,
    "age": -10,
    "materials": 0,
    "provenance": 0,
    "market": 0
  },
  "explanation": "This estimate is based on recent sales of similar items, age, and detected condition (Excellent).",
  "modelBreakdown": {
    "aiDescription": 64,
    "priceHistory": 1200,
    "marketComparison": 273.8061067655981,
    "conditionAdjusted": 458.73274804451916
  },
  "depreciationCurve": [
    {
      "year": 2025,
      "value": 458.73274804451916
    },
    {
      "year": 2026,
      "value": 435.7961106422932
    },
    {
      "year": 2027,
      "value": 414.0063051101785
    },
    {
      "year": 2028,
      "value": 393.3059898546696
    },
    {
      "year": 2029,
      "value": 373.6406903619361
    },
    {
      "year": 2030,
      "value": 354.9586558438392
    }
  ]
}
```
---

## Scenario: Antique Chair
**Input:**
```json
{
  "category": "Furniture",
  "condition": "Fair",
  "ageYears": 50,
  "description": "Old wooden chair, needs reupholstering.",
  "materials": [
    "Wood",
    "Fabric"
  ]
}
```
**Output:**
```json
{
  "estimatedValue": {
    "min": 51,
    "max": 63,
    "currency": "USD"
  },
  "confidenceScore": 70,
  "factors": {
    "brand": 0,
    "condition": -50,
    "age": -250,
    "materials": 5,
    "provenance": 0,
    "market": 0
  },
  "explanation": "This estimate is based on recent sales of similar items, age, and detected condition (Fair).",
  "modelBreakdown": {
    "aiDescription": 69.5,
    "marketComparison": 131.268340313253,
    "conditionAdjusted": 56.810121540447504
  },
  "depreciationCurve": [
    {
      "year": 2025,
      "value": 56.810121540447504
    },
    {
      "year": 2026,
      "value": 53.96961546342513
    },
    {
      "year": 2027,
      "value": 51.271134690253874
    },
    {
      "year": 2028,
      "value": 48.70757795574117
    },
    {
      "year": 2029,
      "value": 46.27219905795411
    },
    {
      "year": 2030,
      "value": 43.9585891050564
    }
  ]
}
```
---

