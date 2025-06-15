import React from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

// Simple line chart for small cards
export const MiniLineChart = ({ data, color }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
};

// Line chart with grid and axes
export const StatLineChart = ({ data, dataKey, color, xAxis }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
        <XAxis 
          dataKey={xAxis} 
          tick={{ fontSize: 12 }} 
          axisLine={false} 
          tickLine={false} 
        />
        <YAxis 
          tick={{ fontSize: 12 }} 
          axisLine={false} 
          tickLine={false} 
        />
        <Tooltip />
        <Line 
          type="monotone" 
          dataKey={dataKey} 
          stroke={color || "#3b82f6"} 
          strokeWidth={2} 
          dot={{ r: 4 }} 
          activeDot={{ r: 6 }} 
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

// Pie chart for distribution data
export const DistributionPieChart = ({ data, colors, dataKey, nameKey }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          fill="#8884d8"
          paddingAngle={2}
          dataKey={dataKey || "value"}
          nameKey={nameKey || "name"}
          labelLine={true}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
};

// Horizontal bar chart for event frequency
export const HorizontalBarChart = ({ data, color, dataKey, categoryKey }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
        <XAxis type="number" axisLine={false} tickLine={false} />
        <YAxis 
          dataKey={categoryKey || "name"} 
          type="category" 
          axisLine={false} 
          tickLine={false}
          tick={{ fontSize: 12 }}
        />
        <Tooltip cursor={{fill: 'rgba(0, 0, 0, 0.1)'}} />
        <Bar 
          dataKey={dataKey || "value"} 
          fill={color || "#3b82f6"} 
          radius={[0, 4, 4, 0]} 
          barSize={20} 
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default {
  MiniLineChart,
  StatLineChart,
  DistributionPieChart,
  HorizontalBarChart
};