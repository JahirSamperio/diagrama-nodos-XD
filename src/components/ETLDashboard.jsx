import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Card,
  CardContent
} from '@mui/material';
import {
  PlayArrow,
  Error,
  CheckCircle,
  Schedule,
  Memory,
  Storage,
  Functions,
  Download,
  ExpandMore,
  ExpandLess,
  Flight,
  Upload
} from '@mui/icons-material';
import { nodesData, availableProcesses as processesData } from '../data/nodesData';
import NodeDetailsModal from './NodeDetailsModal';

const ETLDashboard = () => {
  const [allNodes, setAllNodes] = useState(nodesData);
  const [nodes, setNodes] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [availableProcesses, setAvailableProcesses] = useState(processesData);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLayouting, setIsLayouting] = useState(false);
  const [draggedNode, setDraggedNode] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(0.8);
  const [pan, setPan] = useState({ x: 100, y: 50 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [expandedLevels, setExpandedLevels] = useState({ 'Ingesta': false, 'Transformación': false, 'Business': false });
  const svgRef = useRef(null);

  const toggleLevel = (level) => {
    setExpandedLevels(prev => ({ ...prev, [level]: !prev[level] }));
  };

  useEffect(() => {
    setNodes(nodesData);
  }, []);

  useEffect(() => {
    if (draggedNode) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggedNode, dragOffset, pan, zoom]);

  useEffect(() => {
    if (isPanning) {
      document.addEventListener('mousemove', handleCanvasMouseMove);
      document.addEventListener('mouseup', handleCanvasMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleCanvasMouseMove);
        document.removeEventListener('mouseup', handleCanvasMouseUp);
      };
    }
  }, [isPanning, panStart]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'SUCCESS': return 'success';
      case 'RUNNING': return 'warning';
      case 'FAILED': return 'error';
      case 'PENDING': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'SUCCESS': return <CheckCircle sx={{ color: '#4caf50' }} />;
      case 'RUNNING': return <PlayArrow sx={{ color: '#ff9800', animation: 'pulse 2s infinite' }} />;
      case 'FAILED': return <Error sx={{ color: '#f44336' }} />;
      case 'PENDING': return <Schedule sx={{ color: '#9e9e9e' }} />;
      default: return <Pause sx={{ color: '#9e9e9e' }} />;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Glue': return <Storage />;
      case 'EMR': return <Memory />;
      case 'Lambda': return <Functions />;
      default: return <Memory />;
    }
  };

  const getLevelColor = (level) => {
    const colors = {
      'Ingesta': '#e3f2fd',
      'Transformación': '#fff3e0', 
      'Business': '#e8f5e8'
    };
    return colors[level] || '#f5f5f5';
  };

  const filterNodes = (processName) => {
    setIsLayouting(true);
    setTimeout(() => {
      if (processName === 'all') {
        setNodes(allNodes);
      } else {
        const filtered = allNodes.filter(node => node.process === processName);
        setNodes(filtered);
      }
      setIsLayouting(false);
    }, 200);
  };

  const handleMouseDown = (e, node) => {
    e.preventDefault();
    const rect = svgRef.current.getBoundingClientRect();
    setDraggedNode(node.id);
    setDragOffset({
      x: (e.clientX - rect.left - pan.x) / zoom - node.position.x,
      y: (e.clientY - rect.top - pan.y) / zoom - node.position.y
    });
  };

  const handleDoubleClick = (node) => {
    setSelectedNode(node);
    setModalOpen(true);
  };

  const handleMouseMove = (e) => {
    if (!draggedNode) return;
    const rect = svgRef.current.getBoundingClientRect();
    const newX = (e.clientX - rect.left - pan.x) / zoom - dragOffset.x;
    const newY = (e.clientY - rect.top - pan.y) / zoom - dragOffset.y;
    
    setNodes(prev => prev.map(node => 
      node.id === draggedNode 
        ? { ...node, position: { x: Math.max(0, newX), y: Math.max(0, newY) } }
        : node
    ));
  };

  const handleMouseUp = () => {
    setDraggedNode(null);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.min(Math.max(zoom * delta, 0.1), 3);
    
    setPan(prev => ({
      x: mouseX - (mouseX - prev.x) * (newZoom / zoom),
      y: mouseY - (mouseY - prev.y) * (newZoom / zoom)
    }));
    
    setZoom(newZoom);
  };

  const handleCanvasMouseDown = (e) => {
    if (e.target === svgRef.current || e.target.tagName === 'rect') {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleCanvasMouseMove = (e) => {
    if (isPanning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    }
  };

  const handleCanvasMouseUp = () => {
    setIsPanning(false);
  };



  const renderConnections = () => {
    return nodes.map(node =>
      node.dependencies.map(depId => {
        const sourceNode = nodes.find(n => n.id === depId);
        if (!sourceNode) return null;

        const sourceX = sourceNode.position.x + 120;
        const sourceY = sourceNode.position.y + 60;
        const targetX = node.position.x;
        const targetY = node.position.y + 60;

        return (
          <line
            key={`${depId}-${node.id}`}
            x1={sourceX}
            y1={sourceY}
            x2={targetX}
            y2={targetY}
            stroke="#666"
            strokeWidth="2"
            markerEnd="url(#arrowhead)"
          />
        );
      })
    ).flat();
  };

  const getProcessStats = () => {
    const total = nodes.length;
    const success = nodes.filter(n => n.status === 'SUCCESS').length;
    const running = nodes.filter(n => n.status === 'RUNNING').length;
    const failed = nodes.filter(n => n.status === 'FAILED').length;
    const pending = nodes.filter(n => n.status === 'PENDING').length;
    return { total, success, running, failed, pending };
  };

  const stats = getProcessStats();

  return (
    <Box sx={{ width: '100%', height: '100vh', bgcolor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper 
        elevation={0} 
        sx={{ 
          bgcolor: '#ffffff',
          color: '#0f172a',
          p: 2,
          borderRadius: 0,
          borderBottom: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight="600" sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ 
              width: 32, 
              height: 32, 
              borderRadius: 1, 
              bgcolor: '#3b82f6', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center'
            }}>
              <Flight sx={{ color: 'white', fontSize: 20 }} />
            </Box>
            Volaris Process Monitor
          </Typography>

          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>

            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 0.5, 
              bgcolor: '#dcfce7', 
              px: 1.5, 
              py: 0.5, 
              borderRadius: 1,
              border: '1px solid #22c55e'
            }}>
              <CheckCircle sx={{ color: '#16a34a', fontSize: 16 }} />
              <Typography variant="caption" sx={{ color: '#15803d', fontWeight: 600 }}>
                {stats.success} Success
              </Typography>
            </Box>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 0.5, 
              bgcolor: '#fef3c7', 
              px: 1.5, 
              py: 0.5, 
              borderRadius: 1,
              border: '1px solid #f59e0b'
            }}>
              <PlayArrow sx={{ color: '#d97706', fontSize: 16 }} />
              <Typography variant="caption" sx={{ color: '#92400e', fontWeight: 600 }}>
                {stats.running} Running
              </Typography>
            </Box>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 0.5, 
              bgcolor: '#fee2e2', 
              px: 1.5, 
              py: 0.5, 
              borderRadius: 1,
              border: '1px solid #ef4444'
            }}>
              <Error sx={{ color: '#dc2626', fontSize: 16 }} />
              <Typography variant="caption" sx={{ color: '#991b1b', fontWeight: 600 }}>
                {stats.failed} Failed
              </Typography>
            </Box>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 0.5, 
              bgcolor: '#f1f5f9', 
              px: 1.5, 
              py: 0.5, 
              borderRadius: 1,
              border: '1px solid #94a3b8'
            }}>
              <Schedule sx={{ color: '#64748b', fontSize: 16 }} />
              <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600 }}>
                {stats.pending} Pending
              </Typography>
            </Box>

            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel sx={{ color: '#64748b', '&.Mui-focused': { color: '#3b82f6' } }}>Filter</InputLabel>
              <Select
                value={activeFilter}
                label="Filter"
                onChange={(e) => {
                  setActiveFilter(e.target.value);
                  filterNodes(e.target.value);
                }}
                sx={{
                  color: '#0f172a',
                  '.MuiOutlinedInput-notchedOutline': { borderColor: '#d1d5db' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#9ca3af' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#3b82f6' },
                  '.MuiSvgIcon-root': { color: '#64748b' },
                  bgcolor: '#ffffff',
                  borderRadius: 1,
                  height: 36
                }}
              >
                <MenuItem value="all">All Processes</MenuItem>
                {availableProcesses.map(process => (
                  <MenuItem key={process} value={process}>{process}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="contained"
              startIcon={<Download />}
              sx={{
                bgcolor: '#3b82f6',
                border: '1px solid #3b82f6',
                color: 'white',
                fontWeight: 500,
                px: 2,
                py: 0.5,
                borderRadius: 1,
                textTransform: 'none',
                height: 36,
                '&:hover': {
                  bgcolor: '#2563eb'
                },
                transition: 'all 0.2s ease'
              }}
            >
              Template
            </Button>

            <Button
              variant="contained"
              component="label"
              startIcon={<Upload />}
              sx={{
                bgcolor: '#10b981',
                border: '1px solid #10b981',
                color: 'white',
                fontWeight: 500,
                px: 2,
                py: 0.5,
                borderRadius: 1,
                textTransform: 'none',
                height: 36,
                '&:hover': {
                  bgcolor: '#059669'
                },
                transition: 'all 0.2s ease'
              }}
            >
              Load Excel
              <input
                type="file"
                accept=".xlsx,.xls"
                hidden
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    console.log('Excel file selected:', file.name);
                    // TODO: Implement Excel processing logic
                  }
                }}
              />
            </Button>

            {activeFilter !== 'all' && (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                bgcolor: 'rgba(255,255,255,0.1)', 
                px: 1.5, 
                py: 0.5,
                borderRadius: 1,
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                <Typography variant="caption" sx={{ color: 'white', opacity: 0.9 }}>
                  {activeFilter} ({nodes.length}/{allNodes.length})
                </Typography>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => {
                    setActiveFilter('all');
                    filterNodes('all');
                  }}
                  sx={{
                    color: 'white',
                    textTransform: 'none',
                    minWidth: 'auto',
                    px: 0.5,
                    py: 0,
                    fontSize: '0.75rem',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  ✕
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', flex: 1 }}>
        {/* Main DAG Area */}
        <Box sx={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {isLayouting && (
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                bgcolor: 'rgba(255,255,255,0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10
              }}
            >
              <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    border: '3px solid #1976d2',
                    borderTop: '3px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    '@keyframes spin': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' }
                    }
                  }}
                />
                <Typography variant="h6">Reorganizing Layout...</Typography>
              </Paper>
            </Box>
          )}

          <Box
            component="svg"
            ref={svgRef}
            onWheel={handleWheel}
            onMouseDown={handleCanvasMouseDown}
            sx={{
              width: '100%',
              height: '100%',
              cursor: isPanning ? 'grabbing' : draggedNode ? 'grabbing' : 'grab'
            }}
          >
            <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            <defs>
              <pattern
                id="grid"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 20 0 L 0 0 0 20"
                  fill="none"
                  stroke="#e0e0e0"
                  strokeWidth="1"
                />
              </pattern>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3.5, 0 7"
                  fill="#666"
                />
              </marker>
            </defs>
            <rect width="100%" height="3000" fill="url(#grid)" />

            {/* Level Backgrounds */}
            <rect
              x={30}
              y={0}
              width="320"
              height="100%"
              fill={getLevelColor('Ingesta')}
              opacity="0.2"
            />
            <rect
              x={350}
              y={0}
              width="530"
              height="100%"
              fill={getLevelColor('Transformación')}
              opacity="0.2"
            />
            <rect
              x={880}
              y={0}
              width="400"
              height="100%"
              fill={getLevelColor('Business')}
              opacity="0.2"
            />

            {/* Level Labels */}
            <text
              x={190}
              y={30}
              textAnchor="middle"
              fontSize="16"
              fontWeight="bold"
              fill="#333"
            >
              INGESTA
            </text>
            <text
              x={615}
              y={30}
              textAnchor="middle"
              fontSize="16"
              fontWeight="bold"
              fill="#333"
            >
              TRANSFORMACIÓN
            </text>
            <text
              x={1080}
              y={30}
              textAnchor="middle"
              fontSize="16"
              fontWeight="bold"
              fill="#333"
            >
              BUSINESS
            </text>

            {/* Connections */}
            {renderConnections()}

            {/* Nodes */}
            {nodes.map(node => (
              <foreignObject
                key={node.id}
                x={node.position.x}
                y={node.position.y}
                width="240"
                height="120"
              >
                <Card
                  onMouseDown={(e) => handleMouseDown(e, node)}
                  onDoubleClick={() => handleDoubleClick(node)}
                  sx={{
                    width: '100%',
                    height: '100%',
                    cursor: draggedNode === node.id ? 'grabbing' : 'grab',
                    borderRadius: 3,
                    background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                    border: node.status === 'FAILED' ? '2px solid #ef4444' : 
                           node.status === 'SUCCESS' ? '2px solid #22c55e' :
                           node.status === 'RUNNING' ? '2px solid #f59e0b' : '2px solid #e2e8f0',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    transition: draggedNode === node.id ? 'none' : 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: draggedNode === node.id ? 'scale(1.05)' : 'none',
                    '&:hover': {
                      transform: draggedNode === node.id ? 'scale(1.05)' : 'translateY(-2px)',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                      border: node.status === 'FAILED' ? '2px solid #dc2626' : 
                             node.status === 'SUCCESS' ? '2px solid #16a34a' :
                             node.status === 'RUNNING' ? '2px solid #d97706' : '2px solid #3b82f6'
                    }
                  }}
                >
                  <CardContent sx={{ p: 1.5 }}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {getTypeIcon(node.type)}
                        <Typography variant="caption" color="text.secondary">
                          {node.type}
                        </Typography>
                      </Box>
                      <Chip
                        label={node.status}
                        color={getStatusColor(node.status)}
                        size="small"
                      />
                    </Box>

                    {/* Process Name */}
                    <Paper
                      sx={{
                        p: 1.5,
                        mb: 1,
                        background: node.status === 'SUCCESS' ? 'linear-gradient(135deg, #22c55e, #16a34a)' :
                                   node.status === 'FAILED' ? 'linear-gradient(135deg, #ef4444, #dc2626)' :
                                   node.status === 'RUNNING' ? 'linear-gradient(135deg, #f59e0b, #d97706)' :
                                   'linear-gradient(135deg, #3b82f6, #2563eb)',
                        color: 'white',
                        borderRadius: 1,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                    >
                      <Typography variant="body2" fontWeight="700" sx={{ mb: 0.5 }}>
                        {node.process}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.95 }}>
                        {node.name}
                      </Typography>
                    </Paper>

                    {/* Dependencies */}
                    {node.dependencies.length > 0 && (
                      <Typography variant="caption" color="text.secondary">
                        ⚡ {node.dependencies.length} deps
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </foreignObject>
            ))}
            </g>
          </Box>
        </Box>

        {/* Sidebar */}
        <Paper
          sx={{
            width: sidebarCollapsed ? 48 : 380,
            transition: 'width 0.3s ease',
            borderRadius: 0,
            display: 'flex',
            flexDirection: 'column',
            bgcolor: '#fafbfc',
            borderLeft: '1px solid #e5e7eb'
          }}
        >
          <Box sx={{ 
            p: 3, 
            borderBottom: '1px solid #e2e8f0',
            bgcolor: '#f8fafc',
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center'
          }}>
            {!sidebarCollapsed && (
              <Typography variant="h6" fontWeight="700" color="#0f172a">
                Control Panel
              </Typography>
            )}
            <Button 
              variant="text" 
              size="small"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              sx={{ 
                minWidth: 'auto', 
                px: 1.5,
                py: 0.5,
                borderRadius: 2,
                color: '#64748b',
                '&:hover': {
                  bgcolor: '#f1f5f9',
                  color: '#0f172a'
                }
              }}
            >
              {sidebarCollapsed ? '→' : '←'}
            </Button>
          </Box>

          {!sidebarCollapsed && (
            <Box sx={{ p: 2, overflow: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
              {/* Process Hierarchy */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle2" fontWeight="700" sx={{ mb: 3, color: '#0f172a', fontSize: '0.8rem' }}>
                  Process Hierarchy
                </Typography>
                {['Ingesta', 'Transformación', 'Business'].map(level => {
                  const levelNodes = nodes.filter(n => n.level === level);
                  const isExpanded = expandedLevels[level];
                  return (
                    <Box key={level} sx={{ 
                      mb: 2, 
                      bgcolor: level === 'Ingesta' ? '#f0f9ff' : level === 'Transformación' ? '#fefbf3' : '#f0fdf4',
                      border: `1px solid ${level === 'Ingesta' ? '#bae6fd' : level === 'Transformación' ? '#fed7aa' : '#bbf7d0'}`,
                      borderRadius: 3,
                      overflow: 'hidden'
                    }}>
                      <Box 
                        onClick={() => toggleLevel(level)}
                        sx={{ 
                          p: 3, 
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          '&:hover': {
                            bgcolor: '#f1f5f9'
                          },
                          transition: 'background-color 0.2s ease'
                        }}
                      >
                        <Typography variant="body2" fontWeight="700" color="#0f172a">
                          {level} ({levelNodes.length})
                        </Typography>
                        {isExpanded ? <ExpandLess color="action" /> : <ExpandMore color="action" />}
                      </Box>
                      {isExpanded && (
                        <Box sx={{ px: 3, pb: 3 }}>
                          {levelNodes.map(node => (
                            <Box 
                              key={node.id} 
                              onClick={() => handleDoubleClick(node)}
                              sx={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center', 
                                py: 2.5,
                                px: 3,
                                mb: 1,
                                bgcolor: '#ffffff',
                                border: '1px solid #f1f5f9',
                                borderRadius: 2,
                                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                cursor: 'pointer',
                                '&:hover': {
                                  bgcolor: '#f8fafc',
                                  borderColor: '#e2e8f0',
                                  transform: 'translateX(4px)'
                                },
                                transition: 'all 0.2s ease'
                              }}>
                              <Box>
                                <Typography variant="body2" color="#0f172a" fontWeight="600" sx={{ mb: 0.5 }}>
                                  {node.name}
                                </Typography>
                                <Typography variant="caption" color="#64748b" fontWeight="500">
                                  {node.type} • {node.process}
                                </Typography>
                              </Box>
                              <Chip
                                label={node.status}
                                color={getStatusColor(node.status)}
                                size="small"
                                variant="filled"
                                sx={{ fontWeight: 600 }}
                              />
                            </Box>
                          ))}
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </Box>

              {/* Critical Issues */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle2" fontWeight="700" sx={{ mb: 3, color: '#0f172a', fontSize: '0.8rem' }}>
                  Critical Issues
                </Typography>
                {nodes.filter(n => n.status === 'FAILED').map(node => (
                  <Box key={node.id} sx={{ 
                    p: 3, 
                    mb: 2, 
                    bgcolor: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: 3
                  }}>
                    <Typography variant="body2" fontWeight="700" color="#dc2626" sx={{ mb: 0.5 }}>
                      {node.name}
                    </Typography>
                    <Typography variant="caption" color="#991b1b" fontWeight="500">
                      {node.process} • {node.type}
                    </Typography>
                  </Box>
                ))}
                {nodes.filter(n => n.status === 'FAILED').length === 0 && (
                  <Box sx={{ 
                    p: 3, 
                    textAlign: 'center',
                    bgcolor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: 3
                  }}>
                    <Typography variant="body2" color="#059669" fontWeight="600">
                      No issues detected
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Available Processes */}
              <Box>
                <Typography variant="subtitle2" fontWeight="700" sx={{ mb: 3, color: '#0f172a', fontSize: '0.8rem' }}>
                  Available Processes
                </Typography>
                {availableProcesses.map(process => {
                  const processNodes = allNodes.filter(n => n.process === process);
                  const isActive = activeFilter === process;
                  return (
                    <Box
                      key={process}
                      sx={{
                        p: 3,
                        mb: 2,
                        cursor: 'pointer',
                        bgcolor: isActive ? '#eff6ff' : '#ffffff',
                        border: isActive ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                        borderLeft: isActive ? '4px solid #3b82f6' : '4px solid transparent',
                        borderRadius: 3,
                        transition: 'all 0.2s ease',
                        '&:hover': { 
                          bgcolor: isActive ? '#eff6ff' : '#f1f5f9',
                          borderColor: isActive ? '#3b82f6' : '#cbd5e1',
                          borderLeft: '4px solid #94a3b8'
                        }
                      }}
                      onClick={() => {
                        const newFilter = isActive ? 'all' : process;
                        setActiveFilter(newFilter);
                        filterNodes(newFilter);
                      }}
                    >
                      <Typography variant="body2" fontWeight="700" sx={{ 
                        color: isActive ? '#1e40af' : '#0f172a',
                        mb: 0.5
                      }}>
                        {process}
                      </Typography>
                      <Typography variant="caption" color={isActive ? '#3b82f6' : '#64748b'} fontWeight="500">
                        {processNodes.length} processes
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}
        </Paper>
      </Box>

      <NodeDetailsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        node={selectedNode}
      />

    </Box>
  );
};

export default ETLDashboard;