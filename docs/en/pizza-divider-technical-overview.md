# Pizza Divider Application - Technical Overview

## Feature List

### Core Features

#### 1. Pizza Division System
- **Camera/Upload**: Capture pizza image before cutting or upload existing image
- **AI-Powered Division**: Real-time analysis of pizza and salami distribution using YOLOv8 segmentation
- **Optimal Cut Lines**: Mathematical calculation of fair division lines based on topping distribution
- **Visual Overlay**: SVG-based division lines overlaid on original pizza image
- **API Endpoint**: `POST /api/pizza-cutter/divide`

#### 2. Accuracy Evaluation System
- **After Photo Capture**: Take photo of actually cut pizza pieces
- **Fairness Scoring**: Compare ideal vs actual cutting accuracy (60-100 point scale)
- **Standard Deviation Analysis**: Mathematical evaluation of cutting precision
- **API Endpoint**: `POST /api/pizza-cutter/score`

#### 3. Participant Management
- **Multi-participant Support**: Configure 2-20 participants with custom names
- **Color Assignment**: Assign unique colors to each participant
- **Piece Assignment**: Random roulette-based piece assignment to participants
- **Local Storage**: Persistent participant data across sessions

### Advanced Features

#### 4. Emotion-Based Bill Splitting
- **Group Photo Capture**: Capture group photo of all participants
- **Facial Emotion Recognition**: AI analysis of facial expressions using deep learning
- **Dynamic Bill Calculation**: Bill split based on detected happiness levels
- **Receipt Generation**: Generate shareable receipt images with emotion analysis
- **API Endpoint**: `POST /api/face/emotion`

#### 5. Social Sharing Features
- **Result Image Generation**: Create shareable images with division results
- **Slack Integration**: Copy formatted results for team sharing
- **Memorial Photo Capture**: Capture group photos throughout the process
- **Canvas-based Image Processing**: Client-side image generation and manipulation

## User Flow Diagram

### Primary User Flow

```mermaid
graph TD
    A[Home Screen] --> B[Camera/Upload]
    B --> C[Settings]
    C --> D[Result Display]
    D --> E[Evaluation Photo]
    E --> F[Score Display]
    F --> G[Roulette]
    G --> H[Group Photo]
    H --> I[Bill Split]
    I --> J[Complete]
    
    C --> K[Back]
    K --> B
    D --> L[Back]
    L --> C
    E --> M[Skip]
    M --> G
    F --> N[Skip]
    N --> G
    G --> O[Skip]
    O --> H
    H --> P[Skip]
    P --> I
```

### User Flow Description

1. **Home Screen** → User clicks "Start" button
2. **Camera/Upload** → User takes photo or uploads existing pizza image
3. **Settings** → User configures participants (2-20 people) with names and colors
4. **Result Display** → System shows AI-generated division lines overlaid on pizza
5. **Evaluation Photo** → User takes photo of actually cut pizza (optional)
6. **Score Display** → System shows fairness score based on cutting accuracy (optional)
7. **Roulette** → System randomly assigns pizza pieces to participants (optional)
8. **Group Photo** → User takes memorial photo of the group (optional)
9. **Bill Split** → System calculates bill split using emotion recognition (optional)
10. **Complete** → Final confirmation and sharing options

## Sequence Diagram

### Core Pizza Division Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant AI as AI Service

    Note over U,AI: Pizza Division Process
    
    U->>F: Take pizza photo
    F->>F: Store image locally
    
    U->>F: Configure participants
    F->>F: Store participant data
    
    U->>F: Request division
    F->>B: POST /api/pizza-cutter/divide
    B->>AI: Analyze pizza image
    AI->>AI: Detect pizza boundary
    AI->>AI: Detect salami positions
    AI->>AI: Calculate optimal cuts
    AI-->>B: Return division data
    B-->>F: Return SVG overlay
    F->>F: Display division lines
    
    Note over U,AI: Optional Evaluation
    
    U->>F: Take "after" photo
    F->>B: POST /api/pizza-cutter/score
    B->>AI: Analyze cut accuracy
    AI->>AI: Calculate fairness score
    AI-->>B: Return score data
    B-->>F: Return fairness score
    F->>F: Display score
```

### Advanced Feature Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant AI as AI Service
    participant E as Emotion AI

    Note over U,E: Emotion-Based Bill Splitting
    
    U->>F: Take group photo
    F->>B: POST /api/face/emotion
    B->>AI: Detect faces
    AI->>AI: Extract individual faces
    AI-->>B: Return face regions
    B->>E: Analyze emotions
    E->>E: Process facial expressions
    E->>E: Calculate emotion scores
    E-->>B: Return emotion data
    B->>B: Calculate payment weights
    B-->>F: Return bill split data
    F->>F: Generate receipt
    F->>F: Display results
    
    Note over U,E: Social Sharing
    
    U->>F: Share results
    F->>F: Generate share image
    F->>F: Format for platforms
    F-->>U: Provide sharing options
```

## Technical Architecture

### Frontend Architecture
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 4
- **State Management**: Local storage + React state
- **Image Processing**: HTML5 Canvas + File API
- **Camera**: react-webcam for image capture

### Backend Architecture
- **Framework**: FastAPI (Python 3.13)
- **AI/ML**: YOLOv8 segmentation, emotion recognition models
- **Image Processing**: OpenCV, PIL, matplotlib
- **Database**: Google Apps Script + Google Sheets
- **Deployment**: Docker containers, cloud hosting

### API Integration
- **Production Backend**: rocket2025-backend.onrender.com
- **Fallback Strategy**: Stub implementations for offline functionality
- **Error Handling**: Graceful degradation with user-friendly messages
- **Image Format**: Base64 encoding for API transmission