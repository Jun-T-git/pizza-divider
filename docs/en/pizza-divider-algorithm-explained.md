---
layout: default
title: Pizza Divider Application - Implemented Algorithm Technical Explanation
lang: en
---

# Pizza Divider Application - Implemented Algorithm Technical Explanation

## Overview

This document provides an engineer-friendly explanation of the technical methods and algorithms **actually implemented** in the three core functions of the pizza divider application.

## Important Note

This document covers only the implementations of the following three API endpoints actually called from the frontend:

- `/api/pizza-cutter/divide` - Pizza division processing
- `/api/pizza-cutter/score` - Division evaluation scoring  
- `/api/face/emotion` - Emotion-based bill splitting

---

## 1. Pizza Division Algorithm
### API: `/api/pizza-cutter/divide`

### Technical Challenge

How do you fairly divide a pizza when both total area and salami distribution must be equal across all pieces?

### Solution: Moving Knife Method + Monte Carlo

#### 1. Preprocessing Pipeline

**Ellipse → Circle normalization transformation:**
- Corrects elliptical pizza shapes caused by camera angles to perfect circles
- Normalizes major/minor axis ratio to 1:1 using affine transformation
- Enables circle-based calculations in subsequent algorithms

#### 2. AI Image Analysis

**Pizza region detection:**
- **YOLOv8 segmentation**: Detects pizza regions using `yolov8n-seg.pt` model
- **Minimum enclosing circle**: Approximates pizza boundary as circle using OpenCV's `minEnclosingCircle`
- **Center coordinate normalization**: Normalizes pizza center to origin, radius to 1.0

**Salami detection:**
- **YOLOv11 model**: Segments salami regions using custom `weights.pt`
- **Distance transform**: Detects center of each salami using `cv2.distanceTransform`
- **Circularity filter**: Removes non-circular noise with threshold 0.3, minimum radius 12px

#### 3. Moving Knife Method Implementation

**Monte Carlo point generation:**
- Generates 50,000 points with uniform random distribution within unit circle
- Assigns weight `w = π/50,000` to each point (for area approximation)
- Manages pizza interior points and salami interior points separately

**Target value calculation:**
```
A_goal = π / n  (Target pizza area per piece)
B_goal = Total salami area / n  (Target salami area per piece)
```

**Angle optimization:**
- Determines optimal cutting angles using 0.5° grid search
- Calculates cutting lines where pizza area = A_goal for each angle
- Selects angle where salami area is closest to B_goal

#### 4. Greedy Piece Assignment

**Algorithm:**
1. Determine cutting lines in angular order
2. Assign Monte Carlo points to pieces within remaining region
3. Finalize pieces that reach target area
4. Process next piece with remaining points

**Convergence criteria:**
- All piece areas within ±5% of target value
- Processing completed within maximum 25 iterations

### Technical Points

**Computational efficiency:**
- Monte Carlo method simplifies complex integral calculations
- O(N × M) computational complexity (N=points, M=angle grid count)
- YOLO model optimization through parallel processing

**Precision guarantee:**
- ±1% area precision with 50,000 point sampling
- Practically sufficient cutting precision with 0.5° angular resolution

---

## 2. Fairness Evaluation Scoring
### API: `/api/pizza-cutter/score`

### Technical Challenge

How do you quantitatively evaluate the fairness of an actual pizza division against the ideal division?

### Solution: Exponential Decay Scoring

#### 1. Image Analysis

**Post-division piece detection:**
- Analyzes each piece using same YOLOv8 + YOLOv11 pipeline
- Connected component analysis with `cv2.connectedComponents`
- Calculates pizza area and salami area for each piece

#### 2. Statistical Fairness Evaluation

**Standard deviation-based evaluation:**
```
Pizza std = std(pizza area ratio of each piece)
Salami std = std(salami area ratio of each piece)
```

**Exponential decay score calculation:**
```
Pizza score = 100 × exp(-2.0 × pizza std / 0.10)
Salami score = 100 × exp(-2.0 × salami std / 0.05)
```

#### 3. Weighted Comprehensive Evaluation

**Weight allocation:**
- Pizza area: weight 1.0
- Salami distribution: weight 5.0 (5× emphasis on salami distribution)

**Final score:**
```
Overall score = (1.0 × pizza score + 5.0 × salami score) / 6.0
```

### Technical Points

**Score interpretation:**
- 100 points: Perfectly equal division
- 80-90 points: Practically fair division
- 60-80 points: Somewhat unequal but acceptable range
- Below 60 points: Clearly unfair division

**Baseline meaning:**
- Pizza baseline 0.10 = 37 points for 10% area variation
- Salami baseline 0.05 = 37 points for 5% distribution variation

---

## 3. Emotion-Based Bill Splitting
### API: `/api/face/emotion`

### Technical Challenge

How do you automatically calculate fair bill splitting based on facial expressions that indicate satisfaction levels?

### Solution: Face Detection + Emotion Recognition + Payment Probability

#### 1. Face Detection Algorithm

**OpenCV Haar Cascade:**
- Uses `haarcascade_frontalface_default.xml`
- Detection parameters: scale factor 1.1, min neighbors 4, min size 50×50px
- Converts to grayscale for improved detection accuracy
- Resizes detected faces to 200×200px

#### 2. Emotion Recognition Engine

**FER + MTCNN:**
- Pre-trained CNN model from FER library
- MTCNN=True for improved face detection accuracy
- Seven emotion classes: angry, disgust, fear, happy, sad, surprise, neutral
- Outputs confidence scores (0-1) for each emotion

#### 3. Payment Probability Calculation

**Emotion weight mapping:**
```
happy: 0.90     (Happier people pay more)
surprise: 0.80  (Surprised people also pay relatively more)
neutral: 0.05   (Neutral expression pays minimum)
fear: 0.20      (Anxious people pay less)
sad: 0.20       (Sad people pay less)
angry: 0.15     (Angry people pay even less)
disgust: 0.15   (Disgusted people pay even less)
```

**Payment ratio calculation:**
```
Individual payment probability = Σ(emotion score × emotion weight)
Normalized payment ratio = individual payment probability / total payment probability
```

### Technical Points

**Robustness:**
- Placeholder processing when face detection fails
- Treats failed emotion recognition as neutral emotion
- Reduces false positives with min neighbors 4

**Fairness consideration:**
- Normalization to avoid extreme payment ratios
- Design ensures everyone bears minimum payment

---

## Overall System Integration

### Processing Flow

1. **Image upload**: Receives Base64 encoded images from frontend
2. **Parallel AI processing**: Executes YOLOv8 (pizza) and YOLOv11 (salami) in parallel
3. **Coordinate normalization**: Converts detection results to normalized coordinate system
4. **Algorithm execution**: Executes Moving Knife method or scoring
5. **Result visualization**: Generates cutting lines in SVG format, overlay images in PNG format

### Performance Characteristics

**Computational complexity:**
- Pizza division: O(50,000 × angle grid count) ≈ O(10⁶)
- Scoring: O(image pixel count) ≈ O(10⁶)
- Emotion analysis: O(detected face count × CNN inference time)

**Response time:**
- Pizza division: 3-8 seconds (depends on image size/piece count)
- Scoring: 1-3 seconds
- Emotion analysis: 2-5 seconds (depends on face count)

---

## Summary

This pizza division application provides a consistent user experience from fair pizza division to bill calculation through three implemented core functions. Each algorithm emphasizes the balance between practicality and computational efficiency, optimized to operate with realistic response times as a web application.

**Implementation Features:**

1. **Practical focus**: Pursues practical fairness over theoretical perfection
2. **Computational efficiency**: Achieves real-time processing through Monte Carlo approximation
3. **Robustness**: Stable operation with fallback processing when AI fails
4. **Usability**: Intuitive result display of complex algorithms