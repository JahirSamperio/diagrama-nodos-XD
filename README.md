# DAG Process Monitor

Interactive data pipeline visualization tool for monitoring AWS ETL processes and dependencies.

## 🚀 Features

- **Real-time Process Monitoring**: Visual status tracking (Success, Running, Failed, Pending)
- **Interactive DAG Visualization**: Drag & drop nodes, zoom in/out with mouse wheel
- **Process Classification**: 3-tier architecture visualization (Ingesta → Transformación → Business)
- **Dynamic Filtering**: Filter by process type with real-time updates
- **Professional UI**: Modern Material-UI design with glassmorphism effects

## 🏗️ Architecture

### Data Flow Classification

**🔵 INGESTA** - Data ingestion layer
- RaaS, MasterDB, STFP
- Finance, YaYas, Smile, NPS
- Standalone systems (Storkjet, Teallium, Kambr, Zendesk, Helix, Amplitude)

**🟠 TRANSFORMACIÓN** - Data processing layer
- Atlas processes (Ancillaries, BaseFare)
- Legacy processes (Ancillaries Legado, BaseFare Legado)
- Golden Record, YaYas Navifare
- Reports and analytics processing

**🟢 BUSINESS** - Business intelligence layer
- Total Revenue Atlas/Legado
- Total Sales Atlas/Legado
- Final business metrics

## 🛠️ Tech Stack

- **React 18** + **Vite** - Fast development and build
- **Material-UI (MUI)** - Professional component library
- **SVG Graphics** - Interactive node visualization
- **Modular Architecture** - Separated data and components

## 🚦 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📊 Process Flows

### 🟡 RaaS Flow
1. RaaS (Ingesta) → Ancillaries Atlas (Transformación) → Total Revenue Atlas (Business)
2. RaaS (Ingesta) → BaseFare Atlas (Transformación) → Total Sales Atlas (Business)

### 🟠 MasterDB Flow
1. MasterDB (Ingesta) → Ancillaries Legado (Transformación) → Golden Record (Transformación) → Total Sales Legado (Business)
2. MasterDB (Ingesta) → BaseFare Legado (Transformación) → YaYas Navifare (Transformación) → Total Revenue Legado (Business)

### 🔵 STFP Flow
1. STFP (Ingesta) → Generic Report (Transformación)
2. STFP (Ingesta) → Finance Atlas (Transformación)

### Other Flows
- **🟣 Finance**: Ingesta Finance → Finance P&L
- **🟢 YaYas**: YaYas → YaYas Juniper
- **🩷 Smile**: Smile → NPS Fase II
- **🟡 NPS**: NPS Fase I (standalone)
- **⚫ Standalone**: Independent systems

## 🎮 Interactive Features

- **Drag & Drop**: Move nodes freely to reorganize layout
- **Zoom Controls**: Mouse wheel to zoom in/out (10% - 300%)
- **Process Filtering**: Filter by specific process types
- **Real-time Stats**: Live process status indicators
- **Responsive Design**: Optimized for different screen sizes

## 📁 Project Structure

```
src/
├── components/
│   └── ETLDashboard.jsx    # Main dashboard component
├── data/
│   └── nodesData.js        # Process definitions and relationships
└── main.jsx                # Application entry point
```

## 🔧 Configuration

Process data is configured in `src/data/nodesData.js` with:
- Node definitions (id, name, type, status, position)
- Dependencies and relationships
- AWS service classifications
- Visual flow groupings
